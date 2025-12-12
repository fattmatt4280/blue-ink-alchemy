-- Update admin notification email to the correct address
UPDATE public.site_content 
SET value = 'orders@bluedreambudder.com', updated_at = now() 
WHERE key = 'admin_notification_email';

-- Insert if it doesn't exist
INSERT INTO public.site_content (key, value, type)
VALUES ('admin_notification_email', 'orders@bluedreambudder.com', 'text')
ON CONFLICT (key) DO UPDATE SET value = 'orders@bluedreambudder.com', updated_at = now();