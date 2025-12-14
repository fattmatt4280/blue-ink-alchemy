import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[APPROVE-SHIPPING-LABEL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const shippoApiKey = Deno.env.get('SHIPPO_API_KEY');
    if (!shippoApiKey) {
      throw new Error('SHIPPO_API_KEY is not set');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { queueId, selectedRateId } = await req.json();
    logStep("Request data parsed", { queueId, selectedRateId });

    if (!queueId || !selectedRateId) {
      throw new Error('queueId and selectedRateId are required');
    }

    // Get queue item with order details
    const { data: queueItem, error: queueError } = await supabaseClient
      .from('shipping_queue')
      .select('*, orders(*)')
      .eq('id', queueId)
      .single();

    if (queueError || !queueItem) {
      throw new Error('Queue item not found');
    }

    logStep("Queue item found", { orderId: queueItem.order_id, status: queueItem.status });

    // Find selected rate from fetched rates
    const rates = queueItem.fetched_rates || [];
    const selectedRate = rates.find((r: any) => r.object_id === selectedRateId);
    
    if (!selectedRate) {
      throw new Error('Selected rate not found in fetched rates');
    }

    logStep("Selected rate found", { 
      carrier: selectedRate.provider, 
      service: selectedRate.servicelevel?.name,
      amount: selectedRate.amount 
    });

    // Update queue status to processing
    await supabaseClient
      .from('shipping_queue')
      .update({ 
        status: 'fetching_rates',
        selected_rate_id: selectedRateId,
        selected_carrier: selectedRate.provider,
        selected_service: selectedRate.servicelevel?.name,
        selected_amount: parseFloat(selectedRate.amount)
      })
      .eq('id', queueId);

    // Create transaction (purchase label) via Shippo
    logStep("Creating Shippo transaction (purchasing label)");
    
    const transactionResponse = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${shippoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rate: selectedRateId,
        label_file_type: 'PDF',
        async: false
      })
    });

    if (!transactionResponse.ok) {
      const errorText = await transactionResponse.text();
      logStep("Shippo transaction failed", { error: errorText });
      
      await supabaseClient
        .from('shipping_queue')
        .update({ 
          status: 'failed',
          error_message: `Label creation failed: ${errorText}`
        })
        .eq('id', queueId);
      
      throw new Error(`Label creation failed: ${errorText}`);
    }

    const transaction = await transactionResponse.json();
    logStep("Shippo transaction created", { 
      status: transaction.status,
      tracking_number: transaction.tracking_number,
      label_url: transaction.label_url
    });

    if (transaction.status !== 'SUCCESS') {
      const errorMsg = transaction.messages?.map((m: any) => m.text).join(', ') || 'Unknown error';
      
      await supabaseClient
        .from('shipping_queue')
        .update({ 
          status: 'failed',
          error_message: errorMsg
        })
        .eq('id', queueId);
      
      throw new Error(`Label creation failed: ${errorMsg}`);
    }

    // Store shipment in shipments table
    const { data: shipment, error: shipmentError } = await supabaseClient
      .from('shipments')
      .insert({
        order_id: queueItem.order_id,
        carrier: selectedRate.provider,
        service: selectedRate.servicelevel?.name,
        shippo_tracking_number: transaction.tracking_number,
        shippo_label_url: transaction.label_url,
        shippo_transaction_id: transaction.object_id,
        tracking_status: 'PRE_TRANSIT',
        shipped_at: new Date().toISOString()
      })
      .select()
      .single();

    if (shipmentError) {
      logStep("Warning: Failed to create shipment record", { error: shipmentError.message });
    } else {
      logStep("Shipment record created", { shipmentId: shipment?.id });
    }

    // Update order status to shipped
    await supabaseClient
      .from('orders')
      .update({ status: 'shipped' })
      .eq('id', queueItem.order_id);

    logStep("Order status updated to shipped");

    // Update queue item to approved
    const authHeader = req.headers.get('authorization');
    let approvedBy = null;
    
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      approvedBy = user?.id;
    }

    await supabaseClient
      .from('shipping_queue')
      .update({ 
        status: 'approved',
        label_url: transaction.label_url,
        tracking_number: transaction.tracking_number,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', queueId);

    logStep("Queue item updated to approved");

    // Send shipping notification email
    try {
      const order = queueItem.orders;
      await supabaseClient.functions.invoke('send-order-notifications', {
        body: {
          orderId: queueItem.order_id,
          type: 'shipped',
          trackingNumber: transaction.tracking_number,
          carrier: selectedRate.provider,
          trackingUrl: transaction.tracking_url_provider || `https://parcelsapp.com/en/tracking/${transaction.tracking_number}`
        }
      });
      logStep("Shipping notification sent");
    } catch (notifyError) {
      logStep("Warning: Failed to send notification", { error: String(notifyError) });
    }

    return new Response(JSON.stringify({
      success: true,
      label_url: transaction.label_url,
      tracking_number: transaction.tracking_number,
      tracking_url: transaction.tracking_url_provider,
      carrier: selectedRate.provider,
      service: selectedRate.servicelevel?.name,
      amount_charged: selectedRate.amount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in approve-shipping-label", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
