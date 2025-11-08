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

  const startTime = Date.now();

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
      imageUrls, 
      primaryImageUrl, 
      tattooAge, 
      cleanedWithAlcohol, 
      coveringType, 
      aftercareProducts, 
      allergies, 
      hotToTouch, 
      feverSymptoms, 
      sensitiveToTouch, 
      hasTenderness, 
      visibleRashes, 
      rashDescription, 
      previousAnalyses,
      urgencyMode = 'progress', // 'progress' | 'concerns' | 'urgent'
      userName = 'there',
      symptoms = {} // New simplified symptoms object
    } = await req.json();
    
    // RATE LIMITING - Per User (10/hour, 50/day)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: hourlyCount } = await supabase
      .from('ai_response_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);

    const { count: dailyCount } = await supabase
      .from('ai_response_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneDayAgo);

    if ((hourlyCount || 0) >= 10) {
      await supabase.from('rate_limit_violations').insert({
        identifier: userId,
        action_type: 'ai_analysis',
        violation_count: 1,
      });

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in an hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((dailyCount || 0) >= 50) {
      return new Response(
        JSON.stringify({ error: 'Daily analysis limit reached. Please try again tomorrow.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // USAGE LIMITS CHECK - Must happen before processing
    const { data: subscription } = await supabase
      .from('healaid_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!subscription || !subscription.is_active) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'no_subscription',
          message: 'No active subscription. Please activate or upgrade.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tier = subscription.tier;

    // FREE TRIAL: 1 analysis total
    if (tier === 'free_trial') {
      const { count: analysisCount } = await supabase
        .from('healing_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if ((analysisCount || 0) >= 1) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'trial_limit_reached',
            message: 'Your free trial allows 1 analysis. Upgrade to continue tracking your healing.' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // BASIC TIERS: 2 uploads per day
    if (tier === 'basic_weekly' || tier === 'basic_monthly') {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayUsage } = await supabase
        .from('healaid_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();
      
      const uploadsToday = todayUsage?.uploads_count || 0;
      
      if (uploadsToday >= 2) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'daily_limit_reached',
            message: 'Basic tier allows 2 analyses per day. Upgrade to Pro for unlimited access.' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Increment usage counter
      if (todayUsage) {
        await supabase
          .from('healaid_usage_tracking')
          .update({ uploads_count: uploadsToday + 1 })
          .eq('id', todayUsage.id);
      } else {
        await supabase
          .from('healaid_usage_tracking')
          .insert({
            user_id: userId,
            subscription_id: subscription.id,
            date: today,
            uploads_count: 1,
            analyses_count: 1,
          });
      }
    }

    // PRO and SHOP TIERS: No limits (continue normally)
    
    // Support both single image (legacy) and multiple images
    const images = imageUrls || [primaryImageUrl];
    const mainImage = primaryImageUrl || images[0];
    
    // Get user's first name for personalization
    let userFirstName = 'there';
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();
    
    if (profile?.first_name) {
      userFirstName = profile.first_name;
    } else if (profile?.email) {
      userFirstName = profile.email.split('@')[0];
    }
    
    console.log('Analyzing healing progress:', { imageCount: images.length, tattooAge, previousAnalysesCount: previousAnalyses?.length || 0, userFirstName });
    
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

    // Fetch medical references for evidence-based assessments
    const { data: medicalReferences } = await supabase
      .from('medical_references')
      .select('*')
      .in('condition_category', ['infection', 'allergic_reaction', 'healing_complication', 'normal_healing'])
      .order('severity_level', { ascending: false })
      .limit(20);

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
      previousAnalysesContext = `\n\nCLIENT'S TATTOO COLLECTION & HEALING HISTORY:
${userFirstName} has been tracking ${previousAnalyses.length} tattoo(s) with us:
${previousAnalyses.map((prev: any, idx: number) => `
  ${idx + 1}. ${new Date(prev.date).toLocaleDateString()} - ${prev.tattooDescription || 'Previous tattoo'}
     Healing Stage: ${prev.stage} | Progress: ${prev.score || 'N/A'}/10
     Notes: ${prev.summary || 'None'}
`).join('\n')}

IMPORTANT: 
- Reference this history naturally ("Another piece added!", "Your collection is growing!", "Compared to your [previous piece]...")
- Show continuity of care by acknowledging you've seen them before
- If this is a different tattoo than previous entries, acknowledge it as a NEW piece in their collection
- If this appears to be the SAME tattoo as the most recent entry, reference how healing has progressed`;
    } else {
      previousAnalysesContext = `\n\nThis is ${userFirstName}'s FIRST tattoo tracking with Heal-AId. Welcome them warmly to the healing tracker and get them excited about documenting their healing journey!`;
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

    // Build medical references context
    let medicalReferencesContext = '';
    if (medicalReferences && medicalReferences.length > 0) {
      medicalReferencesContext = '\n\nMEDICAL REFERENCE DATABASE (Use for evidence-based assessments):\n';
      medicalReferences.forEach((ref: any) => {
        medicalReferencesContext += `\n[${ref.source_type.toUpperCase()}] ${ref.reference_title}\n`;
        medicalReferencesContext += `  Condition: ${ref.condition_name} (${ref.condition_category})\n`;
        medicalReferencesContext += `  Severity: ${ref.severity_level}\n`;
        medicalReferencesContext += `  URL: ${ref.reference_url}\n`;
        medicalReferencesContext += `  Key Symptoms: ${ref.key_symptoms.join(', ')}\n`;
        medicalReferencesContext += `  When to Seek Care: ${ref.when_to_seek_care || 'Consult healthcare provider'}\n`;
        medicalReferencesContext += `  Evidence Strength: ${ref.evidence_strength}\n`;
        if (ref.visual_examples_url?.length) {
          medicalReferencesContext += `  📸 Visual Examples Available: ${ref.visual_examples_url.length} medical reference images\n`;
        }
      });
    }

    // Determine urgency mode context
    const urgencyContext = urgencyMode === 'progress' 
      ? 'BRIEF PROGRESS CHECK: User is doing routine tracking. Provide a concise assessment. If ANY concerning signs are detected, flag for detailed follow-up.'
      : urgencyMode === 'concerns'
      ? 'USER HAS CONCERNS: Provide thorough analysis addressing their specific worries with medical context and reassurance.'
      : 'URGENT ASSESSMENT: User needs immediate guidance. Prioritize identifying any issues requiring medical attention.';

    const systemPrompt = `You are Charlie, the AI tattoo healing assistant for Heal-AId by Blue Dream Budder. You're a warm, knowledgeable aftercare specialist with deep expertise in tattoo healing and 25 years of professional experience to draw from. Your PRIMARY responsibility is to identify potential infections and complications early while providing warm, personalized care.

URGENCY MODE: ${urgencyMode.toUpperCase()}
${urgencyContext}

PERSONALIZATION REQUIREMENTS:
1. ALWAYS address the client by their first name (${userName}) warmly and professionally
2. Start your analysis by thoroughly describing what the tattoo itself depicts and its artistic characteristics
3. Reference their previous check-ins if available - note improvements, consistency, or new concerns with specific comparisons
4. Use warm, conversational yet professional language - make them feel personally cared for
5. Show genuine empathy and encouragement for their healing journey
6. Make this feel like a personal consultation from Charlie at Heal-AId, not a robotic analysis

CRITICAL: TATTOO ARTWORK ASSESSMENT (Lead with this in a natural, conversational way):

Your personality as Charlie:
- You're a veteran tattoo artist who LOVES good ink
- You get HYPED about well-executed pieces ("That's fire!", "Clean work!", "Dope addition!")
- You're HONEST about concerns ("I'm seeing some spots that worry me...")
- You recognize returning clients and their growing collections
- You speak like a real person in a tattoo shop, not a medical textbook

How to describe tattoos (choose the right tone for the situation):

FOR HEALTHY TATTOOS:
- Start with genuine enthusiasm: "${userFirstName}, this [style] [subject] is [fire/sick/clean/dope]!"
- If they have history: "Love seeing your collection grow!" or "Another solid piece added to the collection!"
- Compliment the artist's work: "Your artist did clean work on this" / "The [specific detail] is executed really well"
- Be specific: Mention the actual subject (spiderweb, rose, portrait, etc.) and standout elements

FOR CONCERNING TATTOOS:
- Lead with concern + care: "${userFirstName}, I'm seeing some concerning spots on your new [subject]..."
- Be direct but reassuring: "Let's talk about what I'm noticing..."
- Then explain the specific issues you see

DESCRIBE IN THIS ORDER:
1. **Subject & Style**: What is it? (spiderweb, rose bouquet, geometric mandala, lion portrait, etc.) What style? (traditional, neo-trad, realism, Japanese, etc.)
2. **Technical Quality**: Clean linework? Solid shading? Good saturation? (Only mention if relevant)
3. **Personal Touch**: Reference their collection if they have previous tattoos, or welcome their first piece
4. **Color Scheme**: Black/grey, color, or both (keep it natural, not clinical)

EXAMPLES OF GOOD RESPONSES:

First-time client, healthy tattoo:
"${userFirstName}, welcome to the healing tracker! That neo-traditional rose on your forearm is fire - your artist did some really clean linework and the color saturation looks solid."

Returning client, new tattoo:
"${userFirstName}, another dope addition to your collection! This geometric mandala pairs nicely with your other pieces. The symmetry is on point and I can see your artist took their time with the dotwork."

Returning client, multiple angles:
"${userFirstName}, thanks for giving me multiple angles of your spiderweb elbow piece - super helpful! That's a classic traditional design and your artist nailed it. The bold black is going to age beautifully."

Concerning tattoo, first visit:
"${userFirstName}, first off - that Japanese koi design is beautifully done, your artist has serious skills. However, I'm noticing some concerning redness spreading beyond the tattoo borders that we need to address..."

Concerning tattoo, returning:
"${userFirstName}, I know we were tracking your phoenix piece and it was healing well, but I'm seeing some new swelling and heat signs that weren't there before. Let's figure out what's going on..."

CRITICAL INFECTION SIGNS (flag immediately as "High Risk"):
- HOT TO TOUCH: Skin noticeably warmer than surrounding areas
- FEVER SYMPTOMS: Chills, body aches, feeling unwell systemically
- EXCESSIVE SENSITIVITY: Severe pain beyond normal healing discomfort
- SEVERE TENDERNESS: Pain with light pressure (not just touch)
- VISIBLE RASHES: Bumps, hives, or spreading redness (potential allergic reaction)
- Excessive redness spreading beyond tattoo borders
- Significant swelling that's increasing
- Pus, yellow/green discharge, or cloudy fluid
- Red streaks radiating from tattoo
- Foul odor from the area

HEALING TIMELINE (be strict about age):
- Days 0-2: Fresh/Open Wound - Red, slightly swollen, oozing plasma
- Days 3-4: Early Healing - Still red, forming scabs, some swelling normal
- Days 5-7: Scabbing Phase - Darker scabs forming, itching starts
- Days 8-14: Peeling Phase - Scabs flaking off, skin looks dull/silvery
- Days 15-30: Late Healing - Most peeling done, color returning
- Days 30+: Settled - Fully healed, vibrant colors, no flaking

EFFECTIVE HEALING AGE ASSESSMENT (CRITICAL - Visual-based progress tracking):

You MUST determine the "effective healing age" by assessing what day the tattoo APPEARS to be at based on visual appearance, regardless of calendar age.

**CORE PRINCIPLE**: Tattoos heal over a fixed 62-day regeneration cycle. Complications don't extend the timeline - they PAUSE healing progress. A tattoo with an infection is essentially frozen in time until the complication clears.

**YOUR TASK**: Look at the photos and determine: "What day of healing does this tattoo LOOK like it's at?"

VISUAL INDICATORS BY AGE (Use these to assess effective age):

Days 0-3 (Fresh/Raw):
- Raw, open wound appearance
- Bright red inflammation border
- Plasma oozing, shiny wetness
- Ink may appear "blown out" or undefined edges
- Significant swelling

Days 4-7 (Early Scabbing):
- Dark scabs forming over tattooed areas
- Still red/pink around edges
- Scabs may be thick and crusty
- Some plasma dried on surface
- Mild to moderate swelling

Days 8-14 (Peak Peeling):
- Scabs actively flaking/peeling off
- Skin underneath looks dull, silvery, or milky
- Lots of visible flakes and shedding skin
- Colors appear muted or faded
- Itching is common (client may report)

Days 15-21 (Late Peeling):
- Most scabs gone, minor flaking remains
- Skin still slightly dull but improving
- Colors starting to return
- Minimal to no swelling
- Texture smoothing out

Days 22-30 (Settling):
- Colors brightening back up
- Skin texture nearly normal
- Very minimal if any flaking
- Looks almost healed but not quite "settled"

Days 31-45 (Mature Healing):
- Colors fully saturated and vibrant
- Skin texture smooth and normal
- No flaking, scabbing, or peeling
- May have slight shininess that will fade

Days 46-62 (Fully Healed):
- Completely healed appearance
- Skin texture matches surrounding skin perfectly
- Colors are stable and vivid
- No signs of healing process
- Tattoo looks "settled in"

**COMPLICATION IMPACTS** (How they affect effective age):

Active Infection (pus, fever, heat, spreading redness):
- Healing is PAUSED completely
- Tattoo will look the same age as when infection started
- Effective age = when infection began (roughly)
- Example: Day 30 tattoo with 7-day infection → looks like Day 23

Severe Inflammation (very red, hot, extremely swollen):
- Healing is SEVERELY DELAYED
- Tattoo looks younger than calendar age
- Subtract 1-2 weeks from calendar age
- Example: Day 20 with severe inflammation → looks like Day 10

Allergic Reaction (rash, hives, spreading bumps):
- Healing is PAUSED in affected areas
- Can regress appearance (looks younger than it did before)
- Effective age based on visible healing state
- Example: Day 15 with allergic reaction → may look like Day 8

Poor Aftercare (dried out, picking, no cleaning):
- Slows healing by 30-50%
- Tattoo looks 1-2 stages behind where it should be
- More scabbing, slower peeling than normal
- Example: Day 10 with poor care → looks like Day 6

Normal Complications (expected redness, standard scabbing):
- Minor delay, 0-3 days behind schedule
- This is NORMAL healing variance
- Don't penalize heavily for expected symptoms

**CALCULATION PROCESS**:

1. **Assess Calendar Age**: Note the actual days since tattoo was done
2. **Assess Visual Appearance**: Compare photos to the visual indicators above - what day does it LOOK like?
3. **Determine Effective Age**: This is what day the tattoo appears to be at visually
4. **Calculate Healing Delay**: Calendar Age - Effective Age = Days Lost to Complications
5. **Calculate Progress Score**: (Effective Age / 62) × 100

**EXAMPLES**:

Example 1 - Normal Healing:
- Calendar Age: Day 31
- Visual Assessment: Colors returning, mostly peeled, looks Day 28-30
- Effective Age: 30
- Healing Delay: 1 day (minimal)
- Progress Score: (30/62) × 100 = 48%

Example 2 - Active Infection:
- Calendar Age: Day 25
- Visual Assessment: Still heavily scabbed, inflamed, looks Day 10-12
- Effective Age: 11
- Healing Delay: 14 days (2 weeks lost)
- Progress Score: (11/62) × 100 = 18%

Example 3 - Perfect Healing:
- Calendar Age: Day 35
- Visual Assessment: Vibrant colors, smooth texture, looks Day 35-38
- Effective Age: 36
- Healing Delay: 0 days (healing ahead of schedule!)
- Progress Score: (36/62) × 100 = 58%

Example 4 - Resolved Complication:
- Calendar Age: Day 40
- Visual Assessment: Still some peeling, looks Day 25
- Effective Age: 25
- Healing Delay: 15 days (complication cost 2+ weeks)
- Progress Score: (25/62) × 100 = 40%

Example 5 - Fresh Tattoo:
- Calendar Age: Day 3
- Visual Assessment: Raw, oozing, bright red - classic Day 3
- Effective Age: 3
- Healing Delay: 0 days
- Progress Score: (3/62) × 100 = 5%

**CRITICAL RULES**:
- Be REALISTIC about effective age based on actual visual appearance
- A Day 5 tattoo should score ~8%, NOT 50%
- Complications mean healing is BEHIND SCHEDULE (lower effective age)
- Never assume progress based on calendar age alone - USE YOUR EYES
- Progress score must reflect actual healing state, not time elapsed
- If in doubt, be conservative (assess younger effective age rather than older)

${previousAnalysesContext}
${customInstructionsContext}
${expertContext}
${medicalReferencesContext}

MEDICAL REFERENCE REQUIREMENTS (CRITICAL - Always provide evidence):
When identifying ANY conditions (especially HIGH RISK: infections, allergic reactions, severe complications):
1. YOU MUST cite specific medical references from the database above to back up your assessment
2. Match observed symptoms EXACTLY with the "Key Symptoms" in the medical reference database
3. ALWAYS include the complete reference URL so users can verify the source themselves
4. Include a direct key quote from the source that supports your specific finding
5. Provide clear "when to seek care" guidance directly from the reference
6. If visual_examples_url are available in the database, YOU MUST INCLUDE 1-2 of them in your response to help users visually compare with their tattoo
7. Indicate evidence strength (peer-reviewed > medical_guideline > clinical_observation) to show reliability
8. Format references as clickable links and make it clear users should verify and learn more
9. For every concern you raise, back it up with factual medical information and visual examples when available
10. If you're comparing to prior assessments, cite the specific differences you observe with reference to medical healing timelines

ANALYSIS PRIORITY:
1. First, scan for infection/complication signs
2. Compare visually with expert reference images if available in the knowledge base above
3. Determine tattoo age compatibility with visible stage
4. Assess healing stage based on timeline above
5. Provide clear, actionable recommendations with continuity of care

VISUAL COMPARISON INSTRUCTIONS:
When the Expert Knowledge Base mentions "REFERENCE IMAGES AVAILABLE", you should visually compare the user's tattoo photo with what those documented conditions look like. Use these visual references to improve diagnostic accuracy for infections, allergic reactions, and healing complications.

TATTOO TITLE EXTRACTION:
Extract a concise title (1-3 words) that identifies the tattoo for ${userFirstName}'s records:
- If it's a specific subject: Use that (e.g., "Skull", "Beta Fish", "Rose", "Dragon")
- If it's a name tattoo: Use the name (e.g., "Mom", "Sarah", "Family Names")
- If it's abstract/geometric: Describe pattern (e.g., "Geometric Mandala", "Tribal Band")
- If zoomed in/unclear: Use body location (e.g., "Forearm Piece", "Elbow Detail")
- Keep it SHORT and memorable for file naming

RESPONSE FORMAT - Updated with medical evidence:
{
  "personalGreeting": "Warm, personalized opening addressing ${userFirstName} by their actual first name (NOT their email unless no name exists). Example: 'Hi ${userFirstName}! Great to see you checking in with me again...'",
  "tattooDescription": "Natural, conversational description from Charlie that: 1) Uses authentic tattoo shop language, 2) Names the specific subject/design, 3) Identifies the style naturally, 4) References their collection if applicable, 5) Shows genuine enthusiasm or concern based on what you see. Should read like Charlie talking to ${userFirstName} in person, NOT a medical report.",
  "tattooTitle": "SHORT title (1-3 words max) identifying the tattoo subject for client records. Examples: 'Beta Fish', 'Skull', 'Rose Bouquet', 'Mom Name', 'Geometric Sleeve', 'Forearm Piece'. Use the most specific identifiable subject. If zoomed in and unclear, use location like 'Forearm Detail' or 'Elbow Piece'.",
  "healingStage": "stage name",
  "summary": "Personalized summary that: 1) References what you observe about the current healing state, 2) Compares to their previous visits if available with specific details, 3) Explains your assessment reasoning with references to medical healing timelines, 4) Shows clear continuity of care",
  "tattooAgeDays": number or null,
  "effectiveHealingAge": "Number representing what day the tattoo APPEARS to be at based on visual assessment (not calendar age). Compare photos to the visual indicators provided. This is the actual healing progress day.",
  "healingDelay": "Number of days healing is behind schedule (tattooAgeDays - effectiveHealingAge). If 0 or negative, healing is on track or ahead. If positive, complications have paused healing. Example: 14 means '2 weeks lost to complications'",
  "progressScore": "Number 1-100. Calculate as: (effectiveHealingAge / 62) × 100. This represents actual healing completion percentage. A Day 3 tattoo should be ~5%, Day 31 should be ~50%, Day 62 should be ~100%. Be realistic based on visual appearance, not calendar age.",
  "visualAssessment": {
    "colorAssessment": "description",
    "textureAssessment": "description",
    "overallCondition": "description"
  },
  "recommendations": ["rec1", "rec2"],
  "riskFactorsWithEvidence": [
    {
      "concern": "Specific concern observed",
      "symptoms": ["symptom1 observed in photo", "symptom2 observed in photo"],
      "severity": "urgent|concerning|monitor|normal",
      "medicalReference": {
        "source": "Exact source name from database",
        "sourceType": "medical_journal|nhs|mayo_clinic|dermatology_org|clinical_guideline",
        "url": "exact URL from database",
        "visualExamples": ["url1", "url2"] if available,
        "keyQuote": "Direct quote from medical source explaining why this matters",
        "whenToSeekCare": "Exact guidance from database on when to seek medical attention",
        "evidenceStrength": "peer_reviewed|medical_guideline|clinical_observation"
      }
    }
  ],
  "medicalReferencesUsed": [
    // Array of all unique medical references cited in the analysis
  ],
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

IMPORTANT: Only cite medical references when you observe symptoms that match the database. Don't force citations for normal healing.

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

    const userPrompt = `Analyze ${userFirstName}'s tattoo healing progress from ${images.length} photo${images.length > 1 ? 's' : ''}.
${images.length > 1 ? 'Multiple angles have been provided for comprehensive analysis.' : ''}

CLIENT INFORMATION:
- Name: ${userFirstName}
- This is their personal healing journey with Heal-AId by Blue Dream Budder
- Address them by their first name, NOT by their email address

CRITICAL: Begin your analysis by thoroughly describing the tattoo artwork itself (color scheme, style, subject matter, quality) BEFORE assessing healing status.

Tattoo Age: ${tattooAge ? `${tattooAge} days` : 'Not specified'}

Artist Post-Tattoo Care:
- Cleaned with alcohol afterward: ${cleanedWithAlcohol || 'Not specified'}
- Initial covering used: ${coveringType || 'Not specified'}

Client Aftercare Routine:
- Products and routine: ${aftercareProducts || 'Not specified'}

Allergies: ${allergies || 'None reported'}

SYMPTOM ASSESSMENT:
- Hot to touch: ${hotToTouch || 'Not specified'}
- Fever symptoms: ${feverSymptoms || 'Not specified'}
- Sensitive to touch: ${sensitiveToTouch || 'Not specified'}
- Tenderness: ${hasTenderness || 'Not specified'}
- Visible rashes: ${visibleRashes || 'Not specified'}
${rashDescription ? `- Rash description: ${rashDescription}` : ''}

**IMPORTANT**: If the client reports YES to hot to touch, fever symptoms, severe sensitivity, 
or visible rashes, this significantly increases infection/allergic reaction risk. 
Cross-reference with medical reference database and provide urgent care guidance if needed.

${previousAnalyses && previousAnalyses.length > 0 ? `
Previous Assessments:
${previousAnalyses.map((a: any, i: number) => `
${i + 1}. Date: ${new Date(a.date).toLocaleDateString()}
   Stage: ${a.stage}
   Progress Score: ${a.score}/10
   Summary: ${a.summary || 'No summary'}
`).join('\n')}
` : 'This is the first assessment for this tattoo.'}

CRITICAL REQUIREMENTS FOR YOUR RESPONSE:
1. Use ${userFirstName} as their name - DO NOT default to their email address
2. START with a detailed tattoo artwork description (color scheme, style identification, subject matter, technical quality)
3. Reference their ${previousAnalyses?.length || 0} previous check-in(s) with specific comparisons if applicable
4. Cite medical references with URLs and visual examples for any concerns you identify
5. Back up ALL conclusions with factual medical information from the reference database
6. If you see concerning signs, provide the exact medical source that validates your concern
7. Make references clickable and encourage users to verify the information
8. Provide continuity of care by noting specific changes since their last visit

Provide your assessment following the expert guidance provided in the system prompt. Take into account the initial covering method, aftercare products being used, and any allergies when making recommendations.`;

    // Call OpenRouter for analysis (temporary - using OpenRouter credits)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dreamtattoocompany.com',
        'X-Title': 'Heal-AId by Blue Dream Budder',
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
      analysis.riskFactorsWithEvidence = analysis.riskFactorsWithEvidence || analysis.risk_factors_with_evidence || [];
      analysis.medicalReferencesUsed = analysis.medicalReferencesUsed || analysis.medical_references_used || [];
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
      
      const responseTime = Date.now() - startTime;

      // ANOMALY DETECTION
      let anomalyScore = 0;
      if (tattooAge <= 3 && !analysis.healingStage.includes('Fresh')) anomalyScore += 0.3;
      if (analysis.riskFactors?.length > 5) anomalyScore += 0.25;
      if (!analysis.visualAssessment) anomalyScore += 0.2;
      if (responseTime < 1000) anomalyScore += 0.15;

      // LOG AI RESPONSE
      if (userId) {
        await supabase.from('ai_response_logs').insert({
          user_id: userId,
          healing_progress_id: null,
          request_hash: 'analyzed',
          response_hash: 'tracked',
          model_used: 'google/gemini-2.5-flash',
          response_time_ms: responseTime,
          healing_stage: analysis.healingStage,
          risk_level: analysis.riskFactors?.length > 3 ? 'High' : 'Low',
          anomaly_score: Math.min(anomalyScore, 1.0),
        });

        if (anomalyScore > 0.7) {
          await supabase.functions.invoke('send-security-alert', {
            body: {
              alertType: 'anomaly',
              severity: 'high',
              details: {
                message: `Anomalous AI response detected (score: ${anomalyScore.toFixed(2)})`,
                context: { userId, healingStage: analysis.healingStage },
                timestamp: new Date().toISOString()
              }
            }
          });
        }
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

    // Check if we need to alert the artist
    if (userId && analysis.riskFactors && analysis.riskFactors.length > 0) {
      try {
        // Check if client has an artist relationship
        const { data: relationship } = await supabase
          .from('client_artist_relationships')
          .select('artist_user_id')
          .eq('client_user_id', userId)
          .eq('relationship_status', 'active')
          .maybeSingle();

        if (relationship && relationship.artist_user_id) {
          // Determine severity based on risk factors
          const criticalKeywords = ['infection', 'pus', 'fever', 'streaks', 'severe'];
          const highKeywords = ['swelling', 'excessive', 'spreading', 'hot', 'concerning'];
          
          const riskText = analysis.riskFactors.join(' ').toLowerCase();
          let severity = 'medium';
          let alertType = 'follow_up_needed';
          
          if (criticalKeywords.some(kw => riskText.includes(kw))) {
            severity = 'critical';
            alertType = 'infection_suspected';
          } else if (highKeywords.some(kw => riskText.includes(kw))) {
            severity = 'high';
            alertType = 'high_risk';
          }
          
          // Trigger artist alert for high/critical severity
          if (severity === 'high' || severity === 'critical') {
            try {
              await supabase.functions.invoke('send-artist-alert', {
                body: {
                  artistUserId: relationship.artist_user_id,
                  clientUserId: userId,
                  healingProgressId: null, // Will be set after saving healing_progress
                  alertType,
                  severity,
                  alertTitle: `${severity === 'critical' ? '🚨' : '⚠️'} Healing Concerns Detected`,
                  alertMessage: `AI analysis detected ${analysis.riskFactors.length} risk factor(s) that may require your attention: ${analysis.riskFactors.slice(0, 3).join(', ')}`,
                  riskFactors: analysis.riskFactors,
                },
              });
              console.log('Artist alert sent successfully');
            } catch (alertError) {
              console.error('Failed to send artist alert:', alertError);
            }
          }
        }
      } catch (error) {
        console.error('Error checking for artist alert:', error);
      }
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
