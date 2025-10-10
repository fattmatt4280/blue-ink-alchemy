-- Update broken NHS reference with Cleveland Clinic
UPDATE medical_references 
SET 
  reference_title = 'Cleveland Clinic - Tattoo Infection: Signs, Causes, Treatment',
  reference_url = 'https://my.clevelandclinic.org/health/diseases/23295-tattoo-infection',
  detailed_explanation = 'Comprehensive guide on tattoo infections covering signs, symptoms, causes, treatment options, and prevention strategies from Cleveland Clinic.',
  evidence_strength = 'medical_guideline',
  last_verified = now()
WHERE id = 'ed7a8e32-c7b8-4f54-b4ee-e66191a39d81';

-- Update broken NCBI cellulitis reference with The Lancet
UPDATE medical_references 
SET 
  reference_title = 'The Lancet Microbe - Microbiology of Tattoo-Associated Infections',
  reference_url = 'https://www.thelancet.com/journals/lanmic/article/PIIS2666-5247(24)00273-8/fulltext',
  detailed_explanation = 'Peer-reviewed research on the microbiology and clinical management of tattoo-associated skin infections from The Lancet Microbe journal.',
  evidence_strength = 'peer_reviewed',
  last_verified = now()
WHERE id = '6e503cd7-2911-4359-b87b-f6b272cc9bbc';

-- Add DermNet NZ comprehensive reference
INSERT INTO medical_references (
  condition_category,
  condition_name,
  source_type,
  reference_title,
  reference_url,
  visual_examples_url,
  key_symptoms,
  severity_level,
  detailed_explanation,
  when_to_seek_care,
  evidence_strength,
  last_verified
) VALUES (
  'skin_reaction',
  'Tattoo-Associated Skin Reactions',
  'medical_guideline',
  'DermNet NZ - Tattoo-Associated Skin Reactions',
  'https://dermnetnz.org/topics/tattoo-associated-skin-reactions',
  ARRAY[]::text[],
  ARRAY['redness', 'swelling', 'pain', 'discharge', 'allergic reactions', 'granulomas', 'raised bumps'],
  'urgent',
  'Comprehensive dermatology reference covering immediate and delayed tattoo reactions including infections, allergic responses, and inflammatory conditions.',
  'Seek medical attention immediately if you experience spreading redness, fever, severe pain, or discharge from your tattoo.',
  'medical_guideline',
  now()
);

-- Add American Academy of Dermatology reference
INSERT INTO medical_references (
  condition_category,
  condition_name,
  source_type,
  reference_title,
  reference_url,
  visual_examples_url,
  key_symptoms,
  severity_level,
  detailed_explanation,
  when_to_seek_care,
  evidence_strength,
  last_verified
) VALUES (
  'allergic_reaction',
  'Tattoo Allergic and Inflammatory Reactions',
  'medical_guideline',
  'American Academy of Dermatology - Tattoo Skin Reactions',
  'https://www.aad.org/public/everyday-care/skin-care-basics/tattoos/tattoo-skin-reactions',
  ARRAY[]::text[],
  ARRAY['swelling', 'redness years later', 'raised bumps', 'itching', 'burning', 'scaly patches'],
  'concerning',
  'Official AAD guidance on unexpected skin reactions to tattoos including allergic responses, granulomas, and chronic inflammatory conditions.',
  'Consult a board-certified dermatologist if you develop an allergic reaction or persistent skin changes around your tattoo.',
  'medical_guideline',
  now()
);

-- Add PMC comprehensive review reference
INSERT INTO medical_references (
  condition_category,
  condition_name,
  source_type,
  reference_title,
  reference_url,
  visual_examples_url,
  key_symptoms,
  severity_level,
  detailed_explanation,
  when_to_seek_care,
  evidence_strength,
  last_verified
) VALUES (
  'infection',
  'Comprehensive Review of Tattoo Complications',
  'medical_journal',
  'PMC - Tattooing: Immediate and Long-term Adverse Reactions',
  'https://pmc.ncbi.nlm.nih.gov/articles/PMC11739707/',
  ARRAY[]::text[],
  ARRAY['infection', 'allergic reactions', 'granulomas', 'scarring', 'keloids', 'fever', 'pus discharge'],
  'urgent',
  'Peer-reviewed systematic review of immediate and long-term adverse reactions to tattooing, including infectious complications and management strategies.',
  'Seek immediate medical care for signs of infection including fever, spreading redness, severe pain, or pus discharge.',
  'peer_reviewed',
  now()
);