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

    const systemPrompt = `You are a professional tattoo aftercare specialist with 25 years of experience. Your PRIMARY responsibility is to identify potential infections and complications early.

CRITICAL INFECTION SIGNS (flag immediately as "High Risk"):
- Excessive redness spreading beyond tattoo borders
- Significant swelling that's increasing or hot to touch
- Pus, yellow/green discharge, or cloudy fluid
- Red streaks radiating from tattoo
- Fever symptoms or extreme pain
- Foul odor from the area
- Skin that feels hot compared to surrounding areas

HEALING TIMELINE (be strict about age):
- Days 0-2: Fresh/Open Wound - Red, slightly swollen, oozing plasma. Score: 5-15
- Days 3-4: Early Healing - Still red, forming scabs, some swelling normal. Score: 15-25
- Days 5-7: Scabbing Phase - Darker scabs forming, itching starts. Score: 25-40
- Days 8-14: Peeling Phase - Scabs flaking off, skin looks dull/silvery. Score: 40-65
- Days 15-30: Late Healing - Most peeling done, color returning. Score: 65-85
- Days 30+: Settled - Fully healed, vibrant colors, no flaking. Score: 85-100

SCORING RULES:
- Subtract 30-50 points if ANY infection signs present
- A 3-day-old tattoo should NEVER score above 25
- Fresh tattoos (0-4 days) with complications: 0-10
- If unsure between stages, choose the EARLIER stage

${previousAnalysesContext}
${customInstructionsContext}
${expertContext}

ANALYSIS PRIORITY:
1. First, scan for infection/complication signs
2. Determine tattoo age compatibility with visible stage
3. Assess healing stage based on timeline above
4. Calculate score based on both stage AND any concerns
5. Provide clear, actionable recommendations

Respond with valid JSON only, no markdown formatting:
{
  "healingStage": "stage name",
  "progressScore": number (0-100),
  "summary": "Brief summary mentioning tattoo age and overall assessment",
  "tattooAgeDays": number or null,
  "visualAssessment": {
    "colorAssessment": "description",
    "textureAssessment": "description",
    "overallCondition": "description"
  },
  "recommendations": ["rec1", "rec2"],
  "riskFactors": ["any concerns or empty array"],
  "productRecommendations": ["product suggestions based on healing stage"],
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
      
      // Handle specific error cases with user-friendly messages
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'insufficient_credits',
            message: 'AI analysis service is temporarily unavailable due to insufficient credits. Please try again later or contact support.',
            userMessage: 'The AI analysis service needs to be topped up. Please contact support or try again later.'
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
            message: 'Too many requests. Please wait a moment before trying again.',
            userMessage: 'Our AI service is experiencing high demand. Please wait a few minutes and try again.'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Generic error for other status codes -> normalize to 200 so client can show friendly message
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ai_gateway_error',
          message: `AI analysis failed with status ${response.status}`,
          userMessage: 'The AI service had a temporary issue. Please try again shortly.'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
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
      
      // Normalize keys and ensure required fields
      analysis.healingStage = analysis.healingStage || analysis.healing_stage || 'Unknown';
      analysis.progressScore = analysis.progressScore || analysis.progress_score || 50;
      analysis.recommendations = analysis.recommendations || [];
      analysis.riskFactors = analysis.riskFactors || analysis.risk_factors || [];
      analysis.productRecommendations = analysis.productRecommendations || analysis.product_recommendations || [];
      analysis.tattooAgeDays = tattooAge || analysis.tattooAgeDays || analysis.tattoo_age_days || null;
      
      // Normalize visualAssessment
      if (analysis.visual_assessment) {
        analysis.visualAssessment = {
          colorAssessment: analysis.visual_assessment.color_assessment || analysis.visual_assessment.colorAssessment,
          textureAssessment: analysis.visual_assessment.texture_assessment || analysis.visual_assessment.textureAssessment,
          overallCondition: analysis.visual_assessment.overall_condition || analysis.visual_assessment.overallCondition
        };
      }
      
      // Ensure progressScore is 0-100 scale
      if (analysis.progressScore > 0 && analysis.progressScore <= 10) {
        analysis.progressScore = analysis.progressScore * 10;
      }
      
      // Generate summary if missing
      if (!analysis.summary) {
        const ageText = analysis.tattooAgeDays ? `Tattoo age: ${analysis.tattooAgeDays} days. ` : '';
        const concernText = analysis.concerns && analysis.concerns !== 'None' ? analysis.concerns : 'No major concerns observed.';
        analysis.summary = `${ageText}Assessed stage: ${analysis.healingStage}. Progress score: ${analysis.progressScore}/100. ${concernText}`;
      }
      
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      // Fallback response if parsing fails
      analysis = {
        healingStage: 'Unknown',
        progressScore: 50,
        summary: 'Unable to analyze image automatically. Please consult with a professional.',
        tattooAgeDays: tattooAge || null,
        visualAssessment: {},
        recommendations: ['Upload a clearer photo', 'Consult with your tattoo artist'],
        riskFactors: [],
        productRecommendations: [],
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
