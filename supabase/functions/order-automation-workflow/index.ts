import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ORDER-AUTOMATION] ${timestamp} ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { orderId, triggerStep } = await req.json();
    logStep("Automation workflow started", { orderId, triggerStep });

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*, products(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    logStep("Order retrieved", { orderId: order.id, status: order.status });

    const automationResults = [];

    // Step 1: Generate and send invoice (if paid and not done)
    if (order.status === 'paid' && triggerStep === 'invoice') {
      try {
        logStep("Generating invoice for order", { orderId });
        
        const invoiceResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ orderId }),
        });

        if (invoiceResponse.ok) {
          automationResults.push({ step: 'invoice', status: 'success' });
          logStep("Invoice generated successfully", { orderId });
        } else {
          throw new Error('Invoice generation failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        automationResults.push({ step: 'invoice', status: 'failed', error: errorMessage });
        logStep("Invoice generation failed", { orderId, error: errorMessage });
      }
    }

    // Step 2: Create shipping label (if paid and shipping info exists)
    if (order.status === 'paid' && order.shipping_info && triggerStep === 'shipping') {
      try {
        logStep("Creating shipping label for order", { orderId });

        // First get shipping rates for the order
        const ratesResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/get-shipping-rates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ 
            orderId,
            shipping: order.shipping_info 
          }),
        });

        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          const cheapestRate = ratesData.rates?.[0]; // Use the cheapest rate

          if (cheapestRate) {
            // Create shipping label with the rate
            const labelResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/create-shipping-label`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                orderId,
                rateId: cheapestRate.rate_id,
                shipmentId: ratesData.shipment_id
              }),
            });

            if (labelResponse.ok) {
              automationResults.push({ step: 'shipping', status: 'success' });
              logStep("Shipping label created successfully", { orderId });

              // Update order status to shipped
              await supabaseClient
                .from("orders")
                .update({ status: 'shipped', updated_at: new Date().toISOString() })
                .eq('id', orderId);

              // Send tracking notification
              setTimeout(() => {
                fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-notifications`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                  },
                  body: JSON.stringify({
                    orderId,
                    notificationType: 'shipping_confirmation'
                  }),
                });
              }, 1000);

            } else {
              throw new Error('Shipping label creation failed');
            }
          } else {
            throw new Error('No shipping rates available');
          }
        } else {
          throw new Error('Failed to get shipping rates');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        automationResults.push({ step: 'shipping', status: 'failed', error: errorMessage });
        logStep("Shipping label creation failed", { orderId, error: errorMessage });
      }
    }

    // Step 3: Send notifications
    if (triggerStep === 'notification') {
      try {
        logStep("Sending order notification", { orderId, status: order.status });

        let notificationType = 'order_confirmation';
        if (order.status === 'shipped') notificationType = 'shipping_confirmation';
        if (order.status === 'delivered') notificationType = 'delivery_confirmation';

        const notificationResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            orderId,
            notificationType
          }),
        });

        if (notificationResponse.ok) {
          automationResults.push({ step: 'notification', status: 'success' });
          logStep("Notification sent successfully", { orderId, notificationType });
        } else {
          throw new Error('Notification sending failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        automationResults.push({ step: 'notification', status: 'failed', error: errorMessage });
        logStep("Notification sending failed", { orderId, error: errorMessage });
      }
    }

    // Log automation execution
    await supabaseClient.from("automation_executions").insert({
      automation_id: null, // This is a manual automation
      order_id: orderId,
      trigger_data: { triggerStep, orderStatus: order.status },
      execution_logs: automationResults,
      status: automationResults.some(r => r.status === 'failed') ? 'failed' : 'completed',
      completed_at: new Date().toISOString()
    });

    logStep("Automation workflow completed", { orderId, results: automationResults });

    return new Response(JSON.stringify({
      success: true,
      orderId,
      results: automationResults
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in automation workflow", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});