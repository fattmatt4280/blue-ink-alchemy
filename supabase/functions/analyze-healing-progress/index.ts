import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, tattooAge, previousAnalyses } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Construct detailed prompt for healing analysis
    const systemPrompt = `You are an expert tattoo aftercare specialist with extensive knowledge of tattoo healing processes. Analyze tattoo healing progress from photos and provide detailed, accurate assessments.

Your analysis should include:
1. Healing Stage: Identify if the tattoo is in Fresh (0-3 days), Peeling (4-14 days), Settling (15-30 days), or Healed (30+ days) stage
2. Visual Assessment: Color, redness, swelling, scabbing, peeling, clarity
3. Progress Score: Rate 1-10 (1=concerning, 10=excellent healing)
4. Recommendations: Specific aftercare advice based on current stage
5. Risk Factors: Identify any signs of infection, poor healing, or concerns
6. Product Suggestions: Recommend appropriate Blue Dream Budder products for this healing stage

Be thorough but reassuring. If you see warning signs, clearly state them but avoid causing panic.`;

    const userPrompt = `Analyze this tattoo healing progress photo. ${tattooAge ? `The tattoo is ${tattooAge} days old.` : ''} ${previousAnalyses?.length > 0 ? `Previous analysis showed ${previousAnalyses[0]?.healing_stage} stage.` : ''}

Provide a comprehensive assessment in JSON format with these fields:
- healingStage: string (Fresh/Peeling/Settling/Healed)
- progressScore: number (1-10)
- visualAssessment: { color, redness, swelling, texture, overall }
- recommendations: string[] (array of specific advice)
- riskFactors: string[] (any concerns or warning signs)
- productRecommendations: string[] (Blue Dream Budder products that would help)
- summary: string (2-3 sentence overall assessment)`;

    // Call Lovable AI for analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiData = await response.json();
    const analysisText = aiData.choices[0].message.content;
    
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
        progressScore: 5,
        visualAssessment: {
          overall: 'Unable to analyze image automatically. Please consult with a professional.'
        },
        recommendations: ['Upload a clearer photo', 'Consult with your tattoo artist'],
        riskFactors: [],
        productRecommendations: ['Blue Dream Budder Original Formula'],
        summary: 'Analysis unavailable. Please try again with a clearer photo.'
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