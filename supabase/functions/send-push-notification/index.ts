import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  title: string;
  body: string;
  data?: any;
  userId?: string;
}

const logStep = (step: string, details?: any) => {
  console.log(`[${new Date().toISOString()}] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting push notification process');

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, body, data, userId }: PushNotificationRequest = await req.json();
    logStep('Received notification request', { title, body, userId });

    // Get push subscriptions - if userId is provided, get only that user's subscriptions
    // Otherwise, get all admin subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('active', true);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error: subError } = await query;
    
    if (subError) {
      logStep('Error fetching subscriptions', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      logStep('No active subscriptions found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active subscriptions found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('Found subscriptions', { count: subscriptions.length });

    // Send push notifications to all subscriptions
    const notificationPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key,
          },
        };

        const payload = JSON.stringify({
          title,
          body,
          data,
        });

        // Use web-push library functionality via fetch to VAPID endpoint
        const webPushResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${vapidPrivateKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint.split('/').pop(),
            notification: {
              title,
              body,
              icon: '/favicon.ico',
            },
            data,
          }),
        });

        if (!webPushResponse.ok) {
          logStep('Push notification failed', { 
            endpoint: subscription.endpoint,
            status: webPushResponse.status 
          });
          
          // If subscription is invalid, mark it as inactive
          if (webPushResponse.status === 410) {
            await supabase
              .from('push_subscriptions')
              .update({ active: false })
              .eq('id', subscription.id);
          }
        } else {
          logStep('Push notification sent successfully', { endpoint: subscription.endpoint });
        }

        return { success: webPushResponse.ok, endpoint: subscription.endpoint };
      } catch (error) {
        logStep('Error sending to subscription', { 
          endpoint: subscription.endpoint,
          error: error.message 
        });
        return { success: false, endpoint: subscription.endpoint, error: error.message };
      }
    });

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(r => r.success).length;
    
    logStep('Push notifications completed', { 
      total: results.length, 
      successful: successCount 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successCount,
      total: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep('Error in send-push-notification function', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
