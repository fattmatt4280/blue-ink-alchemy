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

// Input validation schema
const validateInput = (data: any) => {
  const errors: string[] = [];
  
  if (!data.cartItems || !Array.isArray(data.cartItems) || data.cartItems.length === 0) {
    errors.push('cartItems must be a non-empty array');
  }
  
  if (!data.toAddress || typeof data.toAddress !== 'object') {
    errors.push('toAddress is required');
  } else {
    if (!data.toAddress.name || data.toAddress.name.length > 200) {
      errors.push('toAddress.name is required and must be less than 200 characters');
    }
    if (!data.toAddress.street1 || data.toAddress.street1.length > 200) {
      errors.push('toAddress.street1 is required and must be less than 200 characters');
    }
    if (!data.toAddress.city || data.toAddress.city.length > 100) {
      errors.push('toAddress.city is required and must be less than 100 characters');
    }
    if (!data.toAddress.state || data.toAddress.state.length > 50) {
      errors.push('toAddress.state is required and must be less than 50 characters');
    }
    if (!data.toAddress.zip || data.toAddress.zip.length > 20) {
      errors.push('toAddress.zip is required and must be less than 20 characters');
    }
  }
  
  return errors;
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

    const requestData = await req.json();
    
    // Validate input
    const validationErrors = validateInput(requestData);
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    const { cartItems, toAddress, fromAddress, orderId } = requestData;
    logStep("Request data validated", { cartItems: cartItems?.length, orderId });

    // Default from address (your business address) - using a real address for testing
    const defaultFromAddress = fromAddress || {
      name: "Blue Dream Budder",
      company: "Blue Dream Budder LLC",
      street1: "1600 Amphitheatre Parkway",
      city: "Mountain View",
      state: "CA",
      zip: "94043",
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
    logStep("Shipment created", { 
      shipmentId: shipment.object_id, 
      ratesCount: shipment.rates?.length,
      rawRates: shipment.rates,
      messages: shipment.messages
    });

    // USPS baseline rates for price comparison
    const uspsBaselineRates = {
      'Ground Advantage': 8.50,
      'Priority Mail': 10.20,
      'Priority Mail Express': 28.50
    };

    // Filter and format rates with price comparison
    logStep("Raw rates before filtering", { 
      totalRates: shipment.rates?.length || 0,
      ratesArray: shipment.rates,
      messages: shipment.messages 
    });
    
    const rates = shipment.rates
      .filter((rate: any) => {
        const hasAmount = !!rate.amount;
        const hasProvider = !!rate.provider;
        const isValid = hasAmount && hasProvider;
        
        logStep("Rate filter check", { 
          rateId: rate.object_id, 
          available: rate.available, 
          amount: rate.amount,
          provider: rate.provider,
          hasAmount,
          hasProvider,
          isValid,
          attributes: rate.attributes
        });
        
        return isValid;
      })
      .map((rate: any) => {
        const shippoAmount = parseFloat(rate.amount);
        const serviceName = rate.servicelevel.name;
        
        // Check if we have a baseline rate for this service
        const baselineAmount = uspsBaselineRates[serviceName as keyof typeof uspsBaselineRates];
        const finalAmount = baselineAmount && baselineAmount < shippoAmount ? baselineAmount : shippoAmount;
        
        if (baselineAmount && baselineAmount < shippoAmount) {
          logStep("Using baseline rate", {
            service: serviceName,
            shippoRate: shippoAmount,
            baselineRate: baselineAmount,
            savings: shippoAmount - baselineAmount
          });
        }

        return {
          id: rate.object_id,
          carrier: rate.provider,
          service_level: serviceName,
          amount: finalAmount,
          currency: rate.currency,
          estimated_days: rate.estimated_days,
          duration_terms: rate.duration_terms
        };
      })
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