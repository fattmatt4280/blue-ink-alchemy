import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and verify user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id; // Use verified user ID from JWT, not client-supplied

    const { 
      userName, 
      questionId, 
      questionText,
      analysisContext, 
      conversationHistory,
      healingProgressId 
    } = await req.json();

    // RATE LIMITING - 20 questions/hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: hourlyCount } = await supabase
      .from('healing_qa_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);

    if ((hourlyCount || 0) >= 20) {
      return new Response(
        JSON.stringify({ error: 'Too many questions. Please try again in an hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PROMPT INJECTION DETECTION
    const suspiciousPatterns = [/ignore\s+instructions/i, /system\s+prompt/i];
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(questionText)) {
        return new Response(
          JSON.stringify({ error: 'Invalid question. Please rephrase.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('Processing follow-up Q&A:', { 
      userId,
      userName, 
      questionId,
      hasAnalysis: !!analysisContext,
      conversationLength: conversationHistory?.length || 0 
    });
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Fetch previous Q&A interactions for this user to provide context
    const { data: previousQAs } = await supabase
      .from('healing_qa_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    let previousQAContext = '';
    if (previousQAs && previousQAs.length > 0) {
      previousQAContext = '\n\nPREVIOUS Q&A HISTORY (for context continuity):\n';
      previousQAs.forEach((qa: any, idx: number) => {
        previousQAContext += `${idx + 1}. Q: ${qa.question_text}\n   A: ${qa.answer_text.substring(0, 200)}...\n`;
      });
    }

    const systemPrompt = `You are Charlie, the AI healing assistant for Heal-AId by Blue Dream Budder. You're a warm, knowledgeable tattoo aftercare specialist with deep expertise in tattoo healing. You are providing follow-up consultation for ${userName} based on their recent tattoo healing analysis.

CRITICAL INSTRUCTIONS:
1. ONLY answer questions directly related to the analysis results below
2. Use ${userName}'s first name naturally in your response to maintain personal connection
3. Reference specific details from their analysis when answering
4. If they ask about something NOT in their analysis, politely redirect them back to relevant topics
5. Maintain warm, professional tone - this is a personal consultation continuation
6. Be concise but thorough - answer in 2-4 sentences typically

THEIR CURRENT ANALYSIS CONTEXT:
${JSON.stringify(analysisContext, null, 2)}

${previousQAContext}

CURRENT CONVERSATION:
${conversationHistory.map((msg: any) => `${msg.role === 'user' ? userName : 'Charlie'}: ${msg.content}`).join('\n')}

RESPONSE FORMAT (JSON):
{
  "answer": "Your personalized answer using ${userName}'s name, referencing their specific analysis details",
  "suggestedFollowUps": [
    {
      "id": "unique-id",
      "question": "Specific follow-up question based on your answer",
      "category": "healing_stage|products|concerns|aftercare",
      "icon": "Activity|Package|AlertCircle|Heart",
      "context": "Why this question is relevant"
    }
  ],
  "requiresAttention": false // true if immediate professional care needed
}

GENERATE 2-3 NEW FOLLOW-UP QUESTIONS that naturally flow from your answer and their analysis.`;

    const userPrompt = `Question: ${questionText}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dreamtattoocompany.com',
        'X-Title': 'Heal-AId by Blue Dream Budder - Healing Q&A',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'insufficient_credits',
            userMessage: 'The AI service needs to be topped up. Please try again later.'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'rate_limit_exceeded',
            userMessage: 'Too many requests. Please wait a few minutes and try again.'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ai_gateway_error',
          userMessage: 'The AI service had a temporary issue. Please try again shortly.'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const aiData = await response.json();
    const responseText = aiData.choices[0].message.content;
    
    console.log('Raw AI Q&A response:', responseText);
    
    let qaResult;
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      qaResult = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', responseText);
      qaResult = {
        answer: responseText,
        suggestedFollowUps: [],
        requiresAttention: false
      };
    }

    // Save this Q&A interaction to database for future context
    if (userId && healingProgressId) {
      await supabase
        .from('healing_qa_interactions')
        .insert({
          user_id: userId,
          healing_progress_id: healingProgressId,
          question_text: questionText,
          answer_text: qaResult.answer,
          question_category: questionId.split('-')[0],
          analysis_context: analysisContext
        });
    }

    return new Response(
      JSON.stringify({ success: true, result: qaResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in healing-followup-qa:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
