-- Add social media links to site content
INSERT INTO public.site_content (key, value, type) VALUES
('social_links_enabled', 'true', 'boolean'),
('social_tiktok_name', 'TikTok', 'text'),
('social_tiktok_url', 'https://www.tiktok.com/@bluedreambudder', 'text'),
('social_tiktok_enabled', 'true', 'boolean'),
('social_instagram_name', 'Instagram', 'text'),
('social_instagram_url', '', 'text'),
('social_instagram_enabled', 'false', 'boolean'),
('social_facebook_name', 'Facebook', 'text'),
('social_facebook_url', '', 'text'),
('social_facebook_enabled', 'false', 'boolean'),
('social_twitter_name', 'Twitter', 'text'),
('social_twitter_url', '', 'text'),
('social_twitter_enabled', 'false', 'boolean'),
('social_youtube_name', 'YouTube', 'text'),
('social_youtube_url', '', 'text'),
('social_youtube_enabled', 'false', 'boolean');