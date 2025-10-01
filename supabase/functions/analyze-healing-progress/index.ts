import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client to access expert knowledge
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, tattooAge, previousAnalyses } = await req.json();
    
    console.log('Analyzing healing progress:', { imageUrl, tattooAge, previousAnalysesCount: previousAnalyses?.length || 0 });
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch custom AI instructions
    const { data: customInstructions } = await supabase
      .from('ai_custom_instructions')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false });

    // Fetch expert knowledge from database to enhance AI analysis
    const { data: expertKnowledge } = await supabase
      .from('expert_knowledge_base')
      .select('*')
      .order('times_referenced', { ascending: false })
      .limit(10);

    // Fetch similar expert assessments for context
    const { data: expertAssessments } = await supabase
      .from('expert_assessments')
      .select('*')
      .limit(5);

    // Build expert context for AI prompt
    let expertContext = '';
    if (expertKnowledge && expertKnowledge.length > 0) {
      expertContext = '\n\nEXPERT KNOWLEDGE FROM 25-YEAR TATTOO ARTIST:\n';
      expertKnowledge.forEach((entry: any) => {
        expertContext += `\n- ${entry.condition_name} (${entry.severity_level}):\n`;
        expertContext += `  Description: ${entry.condition_description}\n`;
        if (entry.visual_indicators?.length) {
          expertContext += `  Visual Signs: ${entry.visual_indicators.join(', ')}\n`;
        }
        if (entry.recommended_actions?.length) {
          expertContext += `  Expert Recommendations: ${entry.recommended_actions.join('; ')}\n`;
        }
        if (entry.product_recommendations?.length) {
          expertContext += `  Product Recommendations: ${entry.product_recommendations.join(', ')}\n`;
        }
      });
    }

    // Add expert assessment patterns if available
    if (expertAssessments && expertAssessments.length > 0) {
      expertContext += '\n\nEXPERT ASSESSMENT PATTERNS:\n';
      expertAssessments.forEach((assessment: any) => {
        if (assessment.expert_notes) {
          expertContext += `- ${assessment.expert_notes}\n`;
        }
        if (assessment.common_mistakes_corrected) {
          expertContext += `  Common AI mistakes to avoid: ${assessment.common_mistakes_corrected}\n`;
        }
      });
    }

    // Build previous analyses context
    let previousAnalysesContext = '';
    if (previousAnalyses && previousAnalyses.length > 0) {
      previousAnalysesContext = '\nPrevious analyses for this tattoo:\n';
      previousAnalyses.forEach((prev: any, idx: number) => {
        previousAnalysesContext += `Analysis ${idx + 1}: Stage=${prev.healingStage}, Score=${prev.progressScore}\n`;
      });
    }

    // Build custom instructions context
    let customInstructionsContext = '';
    if (customInstructions && customInstructions.length > 0) {
      customInstructionsContext = '\n\nCUSTOM AI INSTRUCTIONS:\n';
      customInstructions.forEach((instruction: any) => {
        customInstructionsContext += `\n[${instruction.category.toUpperCase()}] ${instruction.title}:\n`;
        customInstructionsContext += `${instruction.instruction_text}\n`;
      });
    }

    const systemPrompt = `You are a professional tattoo aftercare specialist with access to expert knowledge from a 25-year tattoo artist.
    
Analyze the provided tattoo image and determine:
1. Current healing stage (Fresh, Early Healing, Peeling Phase, Late Healing, or Settled)
2. Progress score (0-100, where 100 is fully healed)
3. Specific recommendations for care
4. Any concerns or issues visible

${previousAnalysesContext}
${customInstructionsContext}
${expertContext}

IMPORTANT: Use the expert knowledge provided above to inform your assessment. Pay special attention to:
- Visual indicators that experts have documented
- Common conditions and their severity levels
- Expert-recommended products and actions
- Patterns from previous expert corrections
- Follow ALL custom instructions provided above

Respond with valid JSON only, no markdown formatting:
{
  "healingStage": "stage name",
  "progressScore": number,
  "recommendations": ["rec1", "rec2"],
  "concerns": "any concerns or 'None'"
}`;

    const userPrompt = `Analyze this tattoo healing progress photo. ${tattooAge ? `The tattoo is ${tattooAge} days old.` : ''}

Provide your assessment following the expert guidance provided in the system prompt.`;

    // Call Lovable AI for analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiData = await response.json();
    const analysisText = aiData.choices[0].message.content;
    
    console.log('Raw AI response:', analysisText);
    
    // Parse JSON response from AI
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                        analysisText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      // Fallback response if parsing fails
      analysis = {
        healingStage: 'Unknown',
        progressScore: 50,
        recommendations: ['Upload a clearer photo', 'Consult with your tattoo artist'],
        concerns: 'Unable to analyze image automatically. Please consult with a professional.'
      };
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-healing-progress:', error);
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
