-- Add Heal-AId page content entries
INSERT INTO public.site_content (key, value, type) VALUES
-- Hero Section
('healaid_hero_title', 'Heal-AId™', 'text'),
('healaid_hero_subtitle', 'Your AI Tattoo Healing Doctor', 'text'),
('healaid_hero_description', '24/7 AI-Powered Analysis | Personalized Healing Guidance | Track Your Journey', 'text'),
('healaid_hero_cta_primary', 'Start Free 3-Day Trial', 'text'),
('healaid_hero_cta_secondary', 'See How It Works', 'text'),

-- Problem/Solution Section
('healaid_problem_title', 'Worried About Your Tattoo Healing?', 'text'),
('healaid_problem_card_1_title', 'Is this normal or infected?', 'text'),
('healaid_problem_card_1_description', 'Get instant answers to your healing concerns', 'text'),
('healaid_problem_card_2_title', 'Am I using the right products?', 'text'),
('healaid_problem_card_2_description', 'Personalized product recommendations for your tattoo', 'text'),
('healaid_problem_card_3_title', 'Should I see a doctor?', 'text'),
('healaid_problem_card_3_description', 'Early warnings for potential complications', 'text'),
('healaid_problem_conclusion', 'Heal-AId uses advanced AI trained on thousands of tattoo healing cases to give you instant, expert-level guidance', 'text'),

-- How It Works Section
('healaid_how_title', 'Get Expert Analysis in 3 Simple Steps', 'text'),
('healaid_how_step_1_title', '1. Upload', 'text'),
('healaid_how_step_1_description', 'Take a photo of your tattoo', 'text'),
('healaid_how_step_2_title', '2. Analyze', 'text'),
('healaid_how_step_2_description', 'AI examines healing progress', 'text'),
('healaid_how_step_3_title', '3. Heal', 'text'),
('healaid_how_step_3_description', 'Get personalized recommendations', 'text'),
('healaid_how_cta_button', 'Try It Now - Free for 3 Days', 'text'),

-- Features Section
('healaid_features_title', 'Powerful AI Features', 'text'),
('healaid_feature_1_title', 'Real-Time Analysis', 'text'),
('healaid_feature_1_description', 'Instant feedback on healing progress in under 30 seconds', 'text'),
('healaid_feature_2_title', 'Healing Stage Detection', 'text'),
('healaid_feature_2_description', 'Know exactly where you are: Fresh, Peeling, Settling, or Healed', 'text'),
('healaid_feature_3_title', 'Risk Assessment', 'text'),
('healaid_feature_3_description', 'Early warning for potential infections or complications', 'text'),
('healaid_feature_4_title', 'Product Recommendations', 'text'),
('healaid_feature_4_description', 'Personalized aftercare product suggestions', 'text'),
('healaid_feature_5_title', 'Progress Tracking', 'text'),
('healaid_feature_5_description', 'Photo timeline to visualize your healing journey', 'text'),
('healaid_feature_6_title', 'Ask Questions', 'text'),
('healaid_feature_6_description', 'Interactive Q&A about your specific tattoo', 'text'),

-- Pricing Section
('healaid_pricing_title', 'Choose Your Healing Journey', 'text'),
('healaid_pricing_subtitle', '💡 All budder purchases include a FREE 3-day trial!', 'text'),
('healaid_pricing_free_title', 'FREE TRIAL', 'text'),
('healaid_pricing_free_price', '$0.00', 'text'),
('healaid_pricing_free_duration', '3 Days', 'text'),
('healaid_pricing_free_badge', 'FREE with every budder purchase!', 'text'),
('healaid_pricing_7day_title', '7-DAY ACCESS', 'text'),
('healaid_pricing_7day_price', '$4.99', 'text'),
('healaid_pricing_7day_duration', '7 Days', 'text'),
('healaid_pricing_30day_title', '30-DAY ACCESS', 'text'),
('healaid_pricing_30day_price', '$9.99', 'text'),
('healaid_pricing_30day_duration', '30 Days', 'text'),
('healaid_pricing_30day_badge', 'Best Value', 'text'),

-- Use Cases Section
('healaid_usecases_title', 'Perfect For Every Tattoo Owner', 'text'),
('healaid_usecase_1_title', 'First-Timers', 'text'),
('healaid_usecase_1_description', 'New to tattoos? Get expert guidance every step of the way', 'text'),
('healaid_usecase_2_title', 'Experienced Collectors', 'text'),
('healaid_usecase_2_description', 'Track healing across multiple pieces and compare progress', 'text'),
('healaid_usecase_3_title', 'Concerned Owners', 'text'),
('healaid_usecase_3_description', 'Peace of mind when something doesn''t look quite right', 'text'),

-- Technology Section
('healaid_tech_title', 'AI-Powered Precision', 'text'),
('healaid_tech_description', 'Our AI has analyzed thousands of tattoo healing progressions to provide accurate, reliable assessments', 'text'),
('healaid_tech_stat_1_number', '10,000+', 'text'),
('healaid_tech_stat_1_label', 'Analyses Performed', 'text'),
('healaid_tech_stat_2_number', '98%', 'text'),
('healaid_tech_stat_2_label', 'User Satisfaction', 'text'),
('healaid_tech_stat_3_number', '<30s', 'text'),
('healaid_tech_stat_3_label', 'Average Response Time', 'text'),

-- FAQ Section
('healaid_faq_title', 'Frequently Asked Questions', 'text'),

-- Final CTA Section
('healaid_cta_title', 'Start Your Healing Journey Today', 'text'),
('healaid_cta_description', 'Get your FREE 3-day trial with any budder purchase', 'text'),
('healaid_cta_button_primary', 'Get Started Now', 'text'),
('healaid_cta_button_secondary', 'Already Have a Code?', 'text'),

-- Add Healing Tracker page content entries
('tracker_title', 'Upload Tattoo Photo', 'text'),
('tracker_description', 'Take clear, well-lit photos of your tattoo for AI analysis', 'text'),
('tracker_signin_message', 'Please sign in to upload and track your healing progress', 'text'),
('tracker_cta_button', 'Analyze Healing Progress', 'text'),
('tracker_tips_title', 'Photo Guidelines', 'text'),
('tracker_alert_message', 'This AI assessment is for informational purposes only. Always consult with your tattoo artist or healthcare provider for serious concerns.', 'text')
ON CONFLICT (key) DO NOTHING;