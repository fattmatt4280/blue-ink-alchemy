-- Create medical_references table for evidence-based healing analysis
CREATE TABLE medical_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_category TEXT NOT NULL,
  condition_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  reference_title TEXT NOT NULL,
  reference_url TEXT NOT NULL,
  visual_examples_url TEXT[],
  key_symptoms TEXT[] NOT NULL,
  severity_level TEXT NOT NULL,
  detailed_explanation TEXT NOT NULL,
  when_to_seek_care TEXT,
  evidence_strength TEXT DEFAULT 'clinical_observation',
  last_verified TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_medical_refs_condition ON medical_references(condition_category, severity_level);
CREATE INDEX idx_medical_refs_severity ON medical_references(severity_level);

-- Enable RLS
ALTER TABLE medical_references ENABLE ROW LEVEL SECURITY;

-- Admins can manage all references
CREATE POLICY "Admins can manage medical references"
ON medical_references
FOR ALL
TO authenticated
USING (is_admin());

-- Public can view references (for displaying to users)
CREATE POLICY "Anyone can view medical references"
ON medical_references
FOR SELECT
TO authenticated
USING (true);

-- Update healing_progress table to track medical references used
ALTER TABLE healing_progress
ADD COLUMN medical_references_used JSONB DEFAULT '[]'::jsonb;

-- Seed initial high-quality medical references
INSERT INTO medical_references (
  condition_category, condition_name, source_type, reference_title, 
  reference_url, key_symptoms, severity_level, detailed_explanation, 
  when_to_seek_care, evidence_strength
) VALUES
-- Infection References
(
  'infection',
  'Bacterial Infection of Tattoo',
  'nhs',
  'NHS - Infected Tattoo Signs and Treatment',
  'https://www.nhs.uk/conditions/infected-tattoo/',
  ARRAY['spreading redness beyond tattoo border', 'warmth to touch', 'pus or discharge', 'fever symptoms', 'increasing pain'],
  'urgent',
  'A tattoo infection occurs when bacteria enter the wound during or after the tattooing process. Signs include redness spreading beyond the tattoo area, swelling, warmth, pus, and sometimes fever. Infected tattoos require prompt medical attention to prevent serious complications.',
  'If you notice redness spreading beyond the tattoo site, develop a fever, or see pus discharge, seek medical attention within 24 hours. Do not delay treatment.',
  'medical_guideline'
),
(
  'infection',
  'Tattoo Infection Risk Factors',
  'mayo_clinic',
  'Mayo Clinic - Tattoos: Risks and Precautions',
  'https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/tattoos-and-piercings/art-20045067',
  ARRAY['red streaks from tattoo', 'hot skin', 'cloudy fluid', 'foul odor'],
  'urgent',
  'According to Mayo Clinic, tattoo infections can range from minor to serious. Red streaks radiating from the tattoo, skin that feels hot, and foul-smelling discharge are serious warning signs that require immediate medical evaluation.',
  'Red streaks from a tattoo can indicate blood infection (sepsis). Seek emergency care immediately if you see red lines spreading from your tattoo or develop fever.',
  'medical_guideline'
),
-- Allergic Reaction References
(
  'allergic_reaction',
  'Tattoo Ink Allergic Reactions',
  'dermatology_org',
  'American Academy of Dermatology - Tattoo Allergies',
  'https://www.aad.org/public/everyday-care/skin-care-basics/tattoos/caring-for-tattooed-skin',
  ARRAY['raised bumps', 'intense itching', 'red rash around tattoo', 'hives'],
  'concerning',
  'Allergic reactions to tattoo ink can occur even years after getting a tattoo. Red ink is most commonly associated with allergic reactions. Symptoms include raised, itchy bumps on the tattooed skin, rash, or widespread hives.',
  'If you develop severe itching, hives, or difficulty breathing, seek medical attention. Mild reactions may be treated with topical or oral antihistamines, but consult a healthcare provider.',
  'clinical_observation'
),
(
  'allergic_reaction',
  'Contact Dermatitis from Tattoo Pigments',
  'medical_journal',
  'Journal of Dermatology - Allergic Reactions to Tattoo Pigments',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5750216/',
  ARRAY['localized swelling', 'contact dermatitis', 'persistent redness in one color'],
  'monitor',
  'Contact dermatitis from tattoo pigments presents as localized allergic reactions, often to specific colors (especially red). The reaction may be delayed and appear weeks or months after tattooing.',
  'If symptoms worsen or spread, consult a dermatologist. Patch testing may be needed to identify the specific allergen.',
  'peer_reviewed'
),
-- Healing Complications
(
  'healing_complication',
  'Excessive Scabbing and Crust Formation',
  'clinical_guideline',
  'Tattoo Aftercare Guidelines - Normal vs Abnormal Scabbing',
  'https://www.healthline.com/health/tattoo-scabbing',
  ARRAY['thick crusts', 'cracked scabs', 'delayed peeling', 'excessive dryness'],
  'monitor',
  'Some scabbing is normal during tattoo healing (days 4-7), but excessive thick crusting can indicate over-drying or poor aftercare. Thick scabs can pull out ink and damage the tattoo design when they fall off.',
  'If scabs are thick, cracking, or bleeding, increase moisturization. If accompanied by redness, warmth, or pus, see a healthcare provider to rule out infection.',
  'clinical_observation'
),
(
  'healing_complication',
  'Ink Rejection and Scarring',
  'dermatology_org',
  'Dermatological Complications of Tattoos',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6637666/',
  ARRAY['raised scars', 'ink pushing out', 'keloid formation', 'persistent inflammation'],
  'concerning',
  'In rare cases, the body may reject tattoo ink, leading to scarring, raised areas, or ink being pushed to the surface. Keloid-prone individuals are at higher risk for scarring complications.',
  'If you notice raised, thick scars forming or ink appearing to be pushed out, consult a dermatologist. Keloid treatment may be necessary.',
  'peer_reviewed'
),
-- Normal Healing
(
  'normal_healing',
  'Expected Tattoo Healing Timeline',
  'clinical_guideline',
  'AAD - Normal Tattoo Healing Process',
  'https://www.aad.org/public/everyday-care/skin-care-basics/tattoos/caring-for-tattooed-skin',
  ARRAY['initial redness days 1-3', 'scabbing days 4-7', 'peeling days 7-14', 'color settling days 14-30'],
  'normal',
  'Normal tattoo healing follows a predictable timeline: Days 1-3 show redness and oozing, days 4-7 develop light scabs, days 7-14 experience peeling, and by day 30 the tattoo should be fully healed with vibrant colors.',
  'Follow your artist''s aftercare instructions. If healing deviates significantly from this timeline or you have concerns, consult your tattoo artist or healthcare provider.',
  'medical_guideline'
),
(
  'normal_healing',
  'Normal Peeling and Flaking',
  'clinical_guideline',
  'Understanding Normal Tattoo Peeling',
  'https://www.healthline.com/health/tattoo-peeling',
  ARRAY['dry flaking skin', 'silvery appearance', 'itching without redness', 'color looking dull'],
  'normal',
  'Peeling typically begins around day 5-7 and is a normal part of healing. The skin may look silvery or dull, and flakes of colored skin may come off. This is dead skin shedding, not the tattoo fading.',
  'Do not pick or scratch. Keep the area moisturized with fragrance-free lotion. If peeling is accompanied by oozing, extreme redness, or pain, consult a healthcare provider.',
  'clinical_observation'
),
(
  'infection',
  'Cellulitis from Tattoo Infection',
  'medical_journal',
  'Clinical Recognition of Tattoo-Associated Cellulitis',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3071458/',
  ARRAY['skin feels hot', 'rapidly spreading redness', 'swelling beyond tattoo area', 'systemic fever'],
  'urgent',
  'Cellulitis is a bacterial skin infection that can spread rapidly. In tattoos, it presents as hot, red, swollen skin extending beyond the tattoo borders. This is a medical emergency requiring antibiotic treatment.',
  'Cellulitis requires immediate medical care. If you have spreading redness, fever, or skin that feels hot to touch, go to urgent care or emergency department immediately.',
  'peer_reviewed'
),
(
  'healing_complication',
  'Over-Moisturization and Moisture Blisters',
  'clinical_guideline',
  'Tattoo Moisture Balance During Healing',
  'https://www.healthline.com/health/how-to-moisturize-a-tattoo',
  ARRAY['small fluid-filled blisters', 'soggy appearance', 'prolonged wetness', 'white macerated skin'],
  'monitor',
  'While keeping a tattoo moisturized is important, over-moisturizing can trap moisture and bacteria, leading to small blisters, prolonged healing, and increased infection risk. Balance is key.',
  'Reduce moisturizer frequency and allow skin to breathe. If blisters develop pus, redness spreads, or pain increases, consult a healthcare provider.',
  'clinical_observation'
);