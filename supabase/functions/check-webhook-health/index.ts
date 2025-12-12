import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-HEALTH] ${timestamp} ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    logStep("Starting webhook health check");

    // Get last webhook received
    const { data: lastWebhook, error: webhookError } = await supabase
      .from('stripe_webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastWebhookTime = lastWebhook?.created_at ? new Date(lastWebhook.created_at) : null;
    logStep("Last webhook received", { time: lastWebhookTime?.toISOString() });

    // Get pending orders older than 15 minutes (should have been processed by webhook)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, email, amount, created_at, stripe_session_id')
      .eq('status', 'pending')
      .lt('created_at', fifteenMinutesAgo)
      .order('created_at', { ascending: false });

    const pendingOrderCount = pendingOrders?.length || 0;
    logStep("Pending orders check", { count: pendingOrderCount });

    // Get recent webhook events (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentEvents, error: eventsError } = await supabase
      .from('stripe_webhook_events')
      .select('*')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    const recentEventCount = recentEvents?.length || 0;
    logStep("Recent events in last 24h", { count: recentEventCount });

    // Calculate health status
    let status: 'healthy' | 'warning' | 'unhealthy' = 'healthy';
    let statusMessage = 'Webhooks are functioning normally';

    const hoursSinceLastWebhook = lastWebhookTime 
      ? (Date.now() - lastWebhookTime.getTime()) / (1000 * 60 * 60)
      : null;

    if (!lastWebhookTime) {
      status = 'unhealthy';
      statusMessage = 'No webhooks have ever been received. Check Stripe Dashboard configuration.';
    } else if (hoursSinceLastWebhook && hoursSinceLastWebhook > 24) {
      status = 'unhealthy';
      statusMessage = `No webhooks received in ${Math.round(hoursSinceLastWebhook)} hours. Check Stripe Dashboard.`;
    } else if (pendingOrderCount > 0) {
      status = 'warning';
      statusMessage = `${pendingOrderCount} orders stuck in pending status (older than 15 min)`;
    } else if (hoursSinceLastWebhook && hoursSinceLastWebhook > 6) {
      status = 'warning';
      statusMessage = `Last webhook was ${Math.round(hoursSinceLastWebhook)} hours ago`;
    }

    // Count events by status
    const processedCount = recentEvents?.filter(e => e.status === 'processed').length || 0;
    const failedCount = recentEvents?.filter(e => e.status === 'failed').length || 0;
    const receivedCount = recentEvents?.filter(e => e.status === 'received').length || 0;

    // Store health check result
    const healthCheck = {
      check_type: 'manual',
      status,
      orders_without_webhook: pendingOrderCount,
      last_webhook_received: lastWebhookTime?.toISOString() || null,
      details: {
        status_message: statusMessage,
        hours_since_last_webhook: hoursSinceLastWebhook ? Math.round(hoursSinceLastWebhook * 10) / 10 : null,
        recent_events_24h: recentEventCount,
        processed_count: processedCount,
        failed_count: failedCount,
        received_count: receivedCount,
        pending_orders: pendingOrders?.map(o => ({
          id: o.id,
          email: o.email,
          amount: o.amount,
          created_at: o.created_at
        })) || []
      }
    };

    const { error: insertError } = await supabase
      .from('webhook_health_checks')
      .insert(healthCheck);

    if (insertError) {
      logStep("ERROR: Failed to save health check", { error: insertError.message });
    }

    logStep("Health check complete", { status, pendingOrderCount });

    return new Response(JSON.stringify({
      success: true,
      health: {
        status,
        statusMessage,
        lastWebhookReceived: lastWebhookTime?.toISOString() || null,
        hoursSinceLastWebhook: hoursSinceLastWebhook ? Math.round(hoursSinceLastWebhook * 10) / 10 : null,
        pendingOrders: pendingOrderCount,
        pendingOrdersList: pendingOrders || [],
        recentEvents: {
          total: recentEventCount,
          processed: processedCount,
          failed: failedCount,
          received: receivedCount,
          events: recentEvents?.slice(0, 10) || [] // Return last 10 events
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { error: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
