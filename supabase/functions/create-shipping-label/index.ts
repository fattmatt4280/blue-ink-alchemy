import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SHIPPING-LABEL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const shippoApiKey = Deno.env.get('SHIPPO_API_KEY');
    if (!shippoApiKey) {
      throw new Error('SHIPPO_API_KEY is not set');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    logStep("Admin authenticated", { userId: user.id });

    const { orderId, rateId, shipmentId } = await req.json();
    logStep("Request data parsed", { orderId, rateId, shipmentId });

    if (!orderId || !rateId) {
      throw new Error('orderId and rateId are required');
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    logStep("Order found", { orderId: order.id, status: order.status });

    // Create transaction (shipping label)
    const transactionResponse = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${shippoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rate: rateId,
        label_file_type: "PDF",
        async: false
      }),
    });

    if (!transactionResponse.ok) {
      const error = await transactionResponse.text();
      throw new Error(`Transaction creation failed: ${error}`);
    }

    const transaction = await transactionResponse.json();
    logStep("Transaction created", { 
      transactionId: transaction.object_id,
      status: transaction.status,
      trackingNumber: transaction.tracking_number 
    });

    if (transaction.status !== 'SUCCESS') {
      throw new Error(`Transaction failed with status: ${transaction.status}`);
    }

    // Get rate details for carrier info
    const rateResponse = await fetch(`https://api.goshippo.com/rates/${rateId}`, {
      headers: {
        'Authorization': `ShippoToken ${shippoApiKey}`,
      },
    });

    const rate = await rateResponse.json();
    
    // Store shipment details in database
    const shipmentData = {
      order_id: orderId,
      shippo_transaction_id: transaction.object_id,
      shippo_tracking_number: transaction.tracking_number,
      carrier: rate.provider,
      service_level: rate.servicelevel?.name,
      tracking_status: 'UNKNOWN',
      tracking_url: transaction.tracking_url_provider,
      label_url: transaction.label_url,
      shipping_cost: parseFloat(rate.amount),
      currency: rate.currency,
      shipped_at: new Date().toISOString()
    };

    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('shipments')
      .insert(shipmentData)
      .select()
      .single();

    if (shipmentError) {
      logStep("Error storing shipment", { error: shipmentError });
      throw new Error('Failed to store shipment data');
    }

    logStep("Shipment stored in database", { shipmentId: shipment.id });

    // Update order status to shipped
    await supabaseClient
      .from('orders')
      .update({ 
        status: 'shipped',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    logStep("Order status updated to shipped");

    return new Response(JSON.stringify({
      success: true,
      shipment: {
        id: shipment.id,
        tracking_number: transaction.tracking_number,
        tracking_url: transaction.tracking_url_provider,
        label_url: transaction.label_url,
        carrier: rate.provider,
        service_level: rate.servicelevel?.name,
        shipping_cost: parseFloat(rate.amount)
      },
      transaction: {
        id: transaction.object_id,
        status: transaction.status
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-shipping-label", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});