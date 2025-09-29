-- Add admin notification email to site content
INSERT INTO public.site_content (key, value, type) 
VALUES ('admin_notification_email', 'orders@bluebudder.com', 'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;