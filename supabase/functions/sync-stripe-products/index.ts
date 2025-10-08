import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting Stripe product sync...');

    // Fetch all products from database
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('*')
      .not('stripe_price_id', 'is', null);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`Found ${dbProducts?.length || 0} products in database with Stripe price IDs`);

    const syncResults = {
      totalProducts: dbProducts?.length || 0,
      updated: 0,
      errors: [] as string[],
      changes: [] as any[],
    };

    // Process each product
    for (const dbProduct of dbProducts || []) {
      try {
        console.log(`Syncing product: ${dbProduct.name} (${dbProduct.stripe_price_id})`);

        // Fetch price from Stripe
        const price = await stripe.prices.retrieve(dbProduct.stripe_price_id, {
          expand: ['product'],
        });

        const stripeProduct = price.product as Stripe.Product;
        const stripePrice = price.unit_amount ? price.unit_amount / 100 : 0;
        const currentPrice = parseFloat(dbProduct.price);

        // Check if price has changed
        if (stripePrice !== currentPrice) {
          console.log(`Price changed for ${dbProduct.name}: ${currentPrice} -> ${stripePrice}`);

          // Update in database
          const { error: updateError } = await supabase
            .from('products')
            .update({
              price: stripePrice,
              updated_at: new Date().toISOString(),
            })
            .eq('id', dbProduct.id);

          if (updateError) {
            syncResults.errors.push(`Failed to update ${dbProduct.name}: ${updateError.message}`);
          } else {
            syncResults.updated++;
            syncResults.changes.push({
              product: dbProduct.name,
              field: 'price',
              oldValue: currentPrice,
              newValue: stripePrice,
            });
          }
        } else {
          console.log(`No price change for ${dbProduct.name}`);
        }

      } catch (error: any) {
        console.error(`Error syncing product ${dbProduct.name}:`, error);
        syncResults.errors.push(`${dbProduct.name}: ${error.message}`);
      }
    }

    console.log('Sync complete:', syncResults);

    return new Response(
      JSON.stringify({
        success: true,
        ...syncResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in sync-stripe-products function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
