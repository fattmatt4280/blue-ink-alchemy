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
    const { imageUrls, primaryImageUrl, tattooAge, cleanedWithAlcohol, coveringType, aftercareProducts, allergies, previousAnalyses, userName, userId } = await req.json();
    
    // Support both single image (legacy) and multiple images
    const images = imageUrls || [primaryImageUrl];
    const mainImage = primaryImageUrl || images[0];
    
    const clientName = userName || 'there';
    
    console.log('Analyzing healing progress:', { imageCount: images.length, tattooAge, previousAnalysesCount: previousAnalyses?.length || 0, userName: clientName });
    
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Fetch custom AI instructions
    const { data: customInstructions } = await supabase
      .from('ai_custom_instructions')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false });

    // Fetch expert knowledge with reference images from database to enhance AI analysis
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
        const hasReferenceImages = entry.reference_images && entry.reference_images.length > 0;
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
        if (hasReferenceImages) {
          expertContext += `  ⚠️ REFERENCE IMAGES AVAILABLE: ${entry.reference_images.length} visual examples of this condition exist for comparison\n`;
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
      previousAnalysesContext = `\n\nCLIENT'S HEALING HISTORY:
${clientName} has ${previousAnalyses.length} previous check-in(s) with us:
${previousAnalyses.map((prev: any, idx: number) => `
  ${idx + 1}. ${new Date(prev.date).toLocaleDateString()}
     - Healing Stage: ${prev.stage}
     - Progress Score: ${prev.score || 'N/A'}/10
     - Key Notes: ${prev.summary || 'None'}
`).join('\n')}

Based on this history, provide continuity of care and reference any improvements or concerns compared to their previous visits.`;
    } else {
      previousAnalysesContext = `\n\nThis is ${clientName}'s first check-in with our healing tracker. Welcome them warmly and establish a baseline for future comparisons.`;
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

    const systemPrompt = `You are Matt from Dream Tattoo Company, a professional tattoo aftercare specialist with 25 years of experience. Your PRIMARY responsibility is to identify potential infections and complications early while providing warm, personalized care.

PERSONALIZATION REQUIREMENTS:
1. Address the client by their first name (${clientName}) warmly and professionally
2. Describe the tattoo design and style you observe in the photos (subject matter, artistic style, color palette, notable elements)
3. Reference their previous check-ins if available - note improvements, consistency, or new concerns
4. Use warm, conversational yet professional language - make them feel cared for
5. Show genuine empathy and encouragement for their healing journey
6. Make this feel like a personal consultation from Matt, not a robotic analysis

TATTOO DESCRIPTION (Required in response):
- Identify the subject matter (e.g., "your floral sleeve," "portrait piece," "geometric design")
- Note the artistic style (realism, traditional, watercolor, blackwork, neo-traditional, etc.)
- Comment on color palette if applicable (black & grey, vibrant colors, etc.)
- Mention notable artistic elements (shading quality, linework, detail level)

CRITICAL INFECTION SIGNS (flag immediately as "High Risk"):
- Excessive redness spreading beyond tattoo borders
- Significant swelling that's increasing or hot to touch
- Pus, yellow/green discharge, or cloudy fluid
- Red streaks radiating from tattoo
- Fever symptoms or extreme pain
- Foul odor from the area
- Skin that feels hot compared to surrounding areas

HEALING TIMELINE (be strict about age):
- Days 0-2: Fresh/Open Wound - Red, slightly swollen, oozing plasma
- Days 3-4: Early Healing - Still red, forming scabs, some swelling normal
- Days 5-7: Scabbing Phase - Darker scabs forming, itching starts
- Days 8-14: Peeling Phase - Scabs flaking off, skin looks dull/silvery
- Days 15-30: Late Healing - Most peeling done, color returning
- Days 30+: Settled - Fully healed, vibrant colors, no flaking

${previousAnalysesContext}
${customInstructionsContext}
${expertContext}

ANALYSIS PRIORITY:
1. First, scan for infection/complication signs
2. Compare visually with expert reference images if available in the knowledge base above
3. Determine tattoo age compatibility with visible stage
4. Assess healing stage based on timeline above
5. Provide clear, actionable recommendations with continuity of care

VISUAL COMPARISON INSTRUCTIONS:
When the Expert Knowledge Base mentions "REFERENCE IMAGES AVAILABLE", you should visually compare the user's tattoo photo with what those documented conditions look like. Use these visual references to improve diagnostic accuracy for infections, allergic reactions, and healing complications.

RESPONSE FORMAT - Add these new fields at the top:
{
  "personalGreeting": "Warm, personalized opening addressing ${clientName} by name (e.g., 'Hi ${clientName}! Great to see you...')",
  "tattooDescription": "Description of the tattoo design and artistic style visible in the photos",
  "healingStage": "stage name",
  "summary": "Personalized summary that references their history if available and shows continuity of care",
  "tattooAgeDays": number or null,
  "visualAssessment": {
    "colorAssessment": "description",
    "textureAssessment": "description",
    "overallCondition": "description"
  },
  "recommendations": ["rec1", "rec2"],
  "riskFactors": ["any concerns or empty array"],
  "productRecommendations": ["product suggestions based on healing stage"],
  "concerns": "any concerns or 'None'",
  "suggestedQuestions": [
    {
      "id": "unique-id-based-on-category",
      "question": "Specific question based on THEIR analysis results",
      "category": "healing_stage|products|concerns|aftercare",
      "icon": "Activity|Package|AlertCircle|Heart",
      "context": "Why this question is relevant to their specific situation"
    }
  ]
}

SUGGESTED QUESTIONS INSTRUCTIONS:
Generate 3-5 contextual follow-up questions that are:
1. Specific to THIS client's analysis (their healing stage, risk factors, recommendations)
2. Genuinely helpful and actionable
3. Strictly within scope (healing, products, aftercare only)
4. Natural conversation starters that feel personal

Example patterns:
- If they have peeling: "What should I do if the peeling increases in the next few days?"
- If using specific product: "Can I switch from [product] to [alternative] at this stage?"
- If at risk: "What specific signs should I watch for in my [area] over the next 48 hours?"
- Based on their history: "How does my current progress compare to my last check-in?"
`;

    const userPrompt = `Analyze ${clientName}'s tattoo healing progress from ${images.length} photo${images.length > 1 ? 's' : ''}.
${images.length > 1 ? 'Multiple angles have been provided for comprehensive analysis.' : ''}

CLIENT INFORMATION:
- Name: ${clientName}
- This is their personal healing journey with Dream Tattoo Company

Tattoo Age: ${tattooAge ? `${tattooAge} days` : 'Not specified'}

Artist Post-Tattoo Care:
- Cleaned with alcohol afterward: ${cleanedWithAlcohol || 'Not specified'}
- Initial covering used: ${coveringType || 'Not specified'}

Client Aftercare Routine:
- Products and routine: ${aftercareProducts || 'Not specified'}

Allergies: ${allergies || 'None reported'}

${previousAnalyses && previousAnalyses.length > 0 ? `
Previous Assessments:
${previousAnalyses.map((a: any, i: number) => `
${i + 1}. Date: ${new Date(a.date).toLocaleDateString()}
   Stage: ${a.stage}
   Progress Score: ${a.score}/10
   Summary: ${a.summary || 'No summary'}
`).join('\n')}
` : 'This is the first assessment for this tattoo.'}

Remember to:
- Address ${clientName} personally and warmly in your personalGreeting
- Describe their tattoo design and style in tattooDescription
- Reference their previous visits if this isn't their first check-in
- Provide continuity of care and personalized guidance

Provide your assessment following the expert guidance provided in the system prompt. Take into account the initial covering method, aftercare products being used, and any allergies when making recommendations.`;

    // Call OpenRouter for analysis (temporary - using OpenRouter credits)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dreamtattoocompany.com',
        'X-Title': 'Dream Tattoo Company - Healing Tracker',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              ...images.map((url: string) => ({ 
                type: 'image_url', 
                image_url: { url } 
              }))
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
      
      // Generate summary if missing
      if (!analysis.summary) {
        const ageText = analysis.tattooAgeDays ? `Tattoo age: ${analysis.tattooAgeDays} days. ` : '';
        const concernText = analysis.concerns && analysis.concerns !== 'None' ? analysis.concerns : 'No major concerns observed.';
        analysis.summary = `${ageText}Assessed stage: ${analysis.healingStage}. ${concernText}`;
      }
      
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      // Fallback response if parsing fails
      analysis = {
        healingStage: 'Unknown',
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
