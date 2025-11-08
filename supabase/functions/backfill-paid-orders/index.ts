import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[Backfill Orders] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep('Starting backfill process');

    // Fetch all pending orders
    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    logStep(`Found ${pendingOrders?.length || 0} pending orders`);

    const results = {
      processed: [] as any[],
      cancelled: [] as any[],
      errors: [] as any[],
      skipped: [] as any[],
    };

    for (const order of pendingOrders || []) {
      try {
        logStep(`Processing order ${order.id}`, { email: order.email });

        // Skip if no Stripe session ID
        if (!order.stripe_session_id) {
          logStep(`Skipping order ${order.id} - no Stripe session ID`);
          results.skipped.push({
            orderId: order.id,
            email: order.email,
            reason: 'No Stripe session ID',
          });
          continue;
        }

        // Check Stripe for payment status
        let session;
        try {
          session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        } catch (stripeError: any) {
          logStep(`Stripe session not found for order ${order.id}`, stripeError.message);
          
          // Mark as cancelled if session doesn't exist (likely expired)
          if (stripeError.code === 'resource_missing') {
            await supabase
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', order.id);

            await supabase.from('order_status_history').insert({
              order_id: order.id,
              old_status: 'pending',
              new_status: 'cancelled',
              changed_by: 'backfill_system',
              notes: 'Abandoned checkout - Stripe session expired',
            });

            results.cancelled.push({
              orderId: order.id,
              email: order.email,
              reason: 'Stripe session not found',
            });
            continue;
          }
          
          throw stripeError;
        }

        // Check if payment was completed
        if (session.payment_status === 'paid') {
          logStep(`Order ${order.id} was paid - processing`);

          // Update order status to paid
          await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', order.id);

          // Log status change
          await supabase.from('order_status_history').insert({
            order_id: order.id,
            old_status: 'pending',
            new_status: 'paid',
            changed_by: 'backfill_system',
            notes: 'Backfilled from Stripe - payment was completed',
          });

          // Check if this is a HealAid product order
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', order.product_id)
            .single();

          let activationCode = null;

          // If it's a HealAid product, generate activation code
          if (product && product.name.toLowerCase().includes('healaid')) {
            const generateCode = () => {
              const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
              let code = '';
              for (let i = 0; i < 12; i++) {
                if (i > 0 && i % 4 === 0) code += '-';
                code += chars[Math.floor(Math.random() * chars.length)];
              }
              return code;
            };

            activationCode = generateCode();

            // Determine tier based on product name
            let tier = 'free_trial';
            if (product.name.toLowerCase().includes('30')) tier = '30_day';
            else if (product.name.toLowerCase().includes('90')) tier = '90_day';
            else if (product.name.toLowerCase().includes('365')) tier = '365_day';

            // Insert activation code
            await supabase.from('healaid_activation_codes').insert({
              code: activationCode,
              tier,
              duration_days: tier === '30_day' ? 30 : tier === '90_day' ? 90 : tier === '365_day' ? 365 : 1,
              email: order.email,
              redeemed: false,
            });
          }

          // Trigger notifications and automation
          try {
            // Send invoice
            await fetch(`${supabaseUrl}/functions/v1/generate-invoice`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId: order.id }),
            });

            // Send admin notification
            await fetch(`${supabaseUrl}/functions/v1/send-admin-notification`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId: order.id }),
            });

            // Send order confirmation to customer
            await fetch(`${supabaseUrl}/functions/v1/send-order-notifications`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId: order.id, orderStatus: 'paid' }),
            });

            // Send activation code email if HealAid product
            if (activationCode) {
              const tier = activationCode.includes('30') ? '30_day' : 
                          activationCode.includes('90') ? '90_day' : 
                          activationCode.includes('365') ? '365_day' : 'free_trial';
              
              await fetch(`${supabaseUrl}/functions/v1/send-activation-code-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: order.email,
                  code: activationCode,
                  tier,
                }),
              });
            }

            // Trigger shipping automation if has shipping info
            if (order.shipping_info) {
              await fetch(`${supabaseUrl}/functions/v1/order-automation-workflow`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId: order.id, triggerStep: 'shipping' }),
              });
            }
          } catch (notificationError: any) {
            logStep(`Error sending notifications for order ${order.id}`, notificationError.message);
            // Continue even if notifications fail
          }

          results.processed.push({
            orderId: order.id,
            email: order.email,
            amount: session.amount_total / 100,
            activationCode,
            hasShipping: !!order.shipping_info,
          });

        } else {
          // Payment not completed - mark as cancelled
          logStep(`Order ${order.id} not paid - marking as cancelled`);

          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order.id);

          await supabase.from('order_status_history').insert({
            order_id: order.id,
            old_status: 'pending',
            new_status: 'cancelled',
            changed_by: 'backfill_system',
            notes: `Abandoned checkout - payment status: ${session.payment_status}`,
          });

          results.cancelled.push({
            orderId: order.id,
            email: order.email,
            reason: `Payment status: ${session.payment_status}`,
          });
        }

      } catch (orderError: any) {
        logStep(`Error processing order ${order.id}`, orderError.message);
        results.errors.push({
          orderId: order.id,
          email: order.email,
          error: orderError.message,
        });
      }
    }

    logStep('Backfill complete', results);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: pendingOrders?.length || 0,
          processed: results.processed.length,
          cancelled: results.cancelled.length,
          skipped: results.skipped.length,
          errors: results.errors.length,
        },
        details: results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    logStep('Backfill failed', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
