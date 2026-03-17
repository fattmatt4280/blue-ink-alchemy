import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRACK-SHIPMENT] ${step}${detailsStr}`);
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

    // Verify user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    logStep("User authenticated", { userId: user.id });

    const { trackingNumber, carrier, shipmentId } = await req.json();
    logStep("Request data parsed", { trackingNumber, carrier, shipmentId });

    if (!trackingNumber && !shipmentId) {
      throw new Error('Either trackingNumber or shipmentId is required');
    }

    let shipment = null;
    
    // If shipmentId provided, get tracking number from database
    if (shipmentId) {
      const { data, error } = await supabaseClient
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (error || !data) {
        throw new Error('Shipment not found');
      }

      shipment = data;
      logStep("Shipment found in database", { 
        trackingNumber: shipment.shippo_tracking_number,
        carrier: shipment.carrier 
      });
    }

    const finalTrackingNumber = trackingNumber || shipment?.shippo_tracking_number;
    const finalCarrier = carrier || shipment?.carrier;

    if (!finalTrackingNumber) {
      throw new Error('Tracking number not found');
    }

    // Get tracking info from Shippo
    const trackingResponse = await fetch(
      `https://api.goshippo.com/tracks/${finalCarrier}/${finalTrackingNumber}`, 
      {
        headers: {
          'Authorization': `ShippoToken ${shippoApiKey}`,
        },
      }
    );

    if (!trackingResponse.ok) {
      const error = await trackingResponse.text();
      throw new Error(`Tracking request failed: ${error}`);
    }

    const trackingInfo = await trackingResponse.json();
    logStep("Tracking info retrieved", { 
      status: trackingInfo.tracking_status,
      location: trackingInfo.location 
    });

    // Update shipment in database if we have shipment data
    if (shipment) {
      const updateData: any = {
        tracking_status: trackingInfo.tracking_status,
        updated_at: new Date().toISOString()
      };

      // Set delivered date if package is delivered
      if (trackingInfo.tracking_status === 'DELIVERED' && !shipment.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }

      await supabaseClient
        .from('shipments')
        .update(updateData)
        .eq('id', shipment.id);

      logStep("Shipment updated in database", { status: trackingInfo.tracking_status });
    }

    // Format tracking history
    const trackingHistory = trackingInfo.tracking_history?.map((event: any) => ({
      status: event.status,
      status_details: event.status_details,
      status_date: event.status_date,
      location: event.location
    })) || [];

    return new Response(JSON.stringify({
      success: true,
      tracking: {
        tracking_number: finalTrackingNumber,
        carrier: finalCarrier,
        status: trackingInfo.tracking_status,
        location: trackingInfo.location,
        eta: trackingInfo.eta,
        tracking_url: trackingInfo.public_url,
        history: trackingHistory
      },
      shipment: shipment ? {
        id: shipment.id,
        order_id: shipment.order_id,
        shipped_at: shipment.shipped_at,
        delivered_at: shipment.delivered_at
      } : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in track-shipment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});