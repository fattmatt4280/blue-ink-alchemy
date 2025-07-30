import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-SHIPPING-RATES] ${step}${detailsStr}`);
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

    const { cartItems, toAddress, fromAddress, orderId } = await req.json();
    logStep("Request data parsed", { cartItems: cartItems?.length, orderId });

    // Default from address (your business address)
    const defaultFromAddress = fromAddress || {
      name: "Blue Dream Budder",
      company: "Blue Dream Budder LLC",
      street1: "123 Business St",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      country: "US",
      phone: "+1 555-0123",
      email: "shipping@bluedreambudder.com"
    };

    // Validate to address
    const shippoToAddress = {
      name: toAddress.name,
      company: toAddress.company || "",
      street1: toAddress.street1,
      street2: toAddress.street2 || "",
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zip,
      country: toAddress.country || "US",
      phone: toAddress.phone || "",
      email: toAddress.email || ""
    };

    logStep("Validating addresses with Shippo");

    // Validate addresses
    const [fromAddressValidation, toAddressValidation] = await Promise.all([
      fetch('https://api.goshippo.com/addresses/', {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${shippoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultFromAddress),
      }).then(async (response) => {
        const text = await response.text();
        logStep("From address response", { status: response.status, text: text.substring(0, 200) });
        if (!response.ok) {
          throw new Error(`From address validation failed: ${response.status} - ${text}`);
        }
        return text ? JSON.parse(text) : {};
      }),
      fetch('https://api.goshippo.com/addresses/', {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${shippoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippoToAddress),
      }).then(async (response) => {
        const text = await response.text();
        logStep("To address response", { status: response.status, text: text.substring(0, 200) });
        if (!response.ok) {
          throw new Error(`To address validation failed: ${response.status} - ${text}`);
        }
        return text ? JSON.parse(text) : {};
      })
    ]);

    const validatedFromAddress = fromAddressValidation;
    const validatedToAddress = toAddressValidation;

    logStep("Addresses validated", { 
      fromValid: validatedFromAddress.validation_results?.is_valid,
      toValid: validatedToAddress.validation_results?.is_valid 
    });

    // Calculate total weight (assuming 0.5 lbs per item if not specified)
    const totalWeight = cartItems.reduce((sum: number, item: any) => {
      const weight = item.weight || 0.5; // Default 0.5 lbs
      return sum + (weight * item.quantity);
    }, 0);

    // Create parcel
    const parcel = {
      length: "8",
      width: "6",
      height: "4",
      distance_unit: "in",
      weight: totalWeight.toString(),
      mass_unit: "lb"
    };

    logStep("Creating shipment for rate calculation", { parcel, totalWeight });

    // Create shipment to get rates
    const shipmentResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${shippoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_from: validatedFromAddress.object_id,
        address_to: validatedToAddress.object_id,
        parcels: [parcel],
        async: false
      }),
    });

    if (!shipmentResponse.ok) {
      const error = await shipmentResponse.text();
      throw new Error(`Shipment creation failed: ${error}`);
    }

    const shipment = await shipmentResponse.json();
    logStep("Shipment created", { shipmentId: shipment.object_id, ratesCount: shipment.rates?.length });

    // Filter and format rates
    const rates = shipment.rates
      .filter((rate: any) => rate.available)
      .map((rate: any) => ({
        id: rate.object_id,
        carrier: rate.provider,
        service_level: rate.servicelevel.name,
        amount: parseFloat(rate.amount),
        currency: rate.currency,
        estimated_days: rate.estimated_days,
        duration_terms: rate.duration_terms
      }))
      .sort((a: any, b: any) => a.amount - b.amount); // Sort by price

    logStep("Rates processed", { availableRates: rates.length });

    // Store rates in database if orderId provided
    if (orderId && rates.length > 0) {
      const rateRecords = rates.map((rate: any) => ({
        order_id: orderId,
        carrier: rate.carrier,
        service_level: rate.service_level,
        rate_id: rate.id,
        amount: rate.amount,
        currency: rate.currency,
        estimated_days: rate.estimated_days
      }));

      await supabaseClient
        .from('shipping_rates')
        .insert(rateRecords);

      logStep("Rates stored in database", { storedRates: rateRecords.length });
    }

    // Store validated address if orderId provided
    if (orderId) {
      await supabaseClient
        .from('shipping_addresses')
        .insert({
          order_id: orderId,
          name: validatedToAddress.name,
          company: validatedToAddress.company,
          street1: validatedToAddress.street1,
          street2: validatedToAddress.street2,
          city: validatedToAddress.city,
          state: validatedToAddress.state,
          zip: validatedToAddress.zip,
          country: validatedToAddress.country,
          phone: validatedToAddress.phone,
          email: validatedToAddress.email,
          is_validated: validatedToAddress.validation_results?.is_valid || false,
          shippo_address_id: validatedToAddress.object_id
        });
    }

    return new Response(JSON.stringify({
      success: true,
      rates,
      shipment_id: shipment.object_id,
      validated_address: validatedToAddress
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-shipping-rates", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});