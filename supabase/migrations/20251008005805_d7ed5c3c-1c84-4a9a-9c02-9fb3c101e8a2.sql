-- Add image content entries for Heal-AId page
INSERT INTO public.site_content (key, value, type) VALUES
  ('healaid_hero_image', '', 'image'),
  ('healaid_problem_image', '', 'image'),
  ('healaid_how_image', '', 'image'),
  ('healaid_features_image', '', 'image'),
  ('healaid_tech_image', '', 'image'),
  ('healaid_cta_image', '', 'image'),
  ('healaid_shield_logo', '', 'image')
ON CONFLICT (key) DO NOTHING;