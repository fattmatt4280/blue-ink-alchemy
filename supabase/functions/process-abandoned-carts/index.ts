import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting abandoned cart processing...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    console.log("Querying for abandoned carts created before:", twentyFourHoursAgo);

    // Query for abandoned carts that need follow-up
    const { data: abandonedCarts, error: queryError } = await supabase
      .from("abandoned_carts")
      .select("*")
      .is("email_sent_at", null)
      .eq("converted", false)
      .lt("created_at", twentyFourHoursAgo)
      .limit(50);

    if (queryError) {
      console.error("Error querying abandoned carts:", queryError);
      throw queryError;
    }

    console.log(`Found ${abandonedCarts?.length || 0} abandoned carts to process`);

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No abandoned carts to process",
          processed: 0
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Process each abandoned cart
    for (const cart of abandonedCarts) {
      try {
        console.log(`Processing cart ${cart.id} for ${cart.email}`);

        // Call send-abandoned-cart-email function
        const emailResponse = await supabase.functions.invoke("send-abandoned-cart-email", {
          body: {
            email: cart.email,
            cartItems: cart.cart_items,
            cartValue: cart.cart_value,
          },
        });

        if (emailResponse.error) {
          console.error(`Error sending email for cart ${cart.id}:`, emailResponse.error);
          errors.push({ cartId: cart.id, error: emailResponse.error });
          errorCount++;
          continue;
        }

        console.log(`Email sent successfully for cart ${cart.id}`);

        // Update the cart record with email_sent_at timestamp
        const { error: updateError } = await supabase
          .from("abandoned_carts")
          .update({ 
            email_sent_at: new Date().toISOString(),
            metadata: {
              ...cart.metadata,
              email_sent_via: "automated_processor",
              processed_at: new Date().toISOString()
            }
          })
          .eq("id", cart.id);

        if (updateError) {
          console.error(`Error updating cart ${cart.id}:`, updateError);
          errors.push({ cartId: cart.id, error: updateError });
          errorCount++;
          continue;
        }

        // Track analytics event
        await supabase.from("analytics_events").insert({
          event_type: "abandoned_cart_email_sent",
          event_data: {
            cart_id: cart.id,
            email: cart.email,
            cart_value: cart.cart_value,
            items_count: cart.cart_items?.length || 0,
          },
          user_id: cart.user_id,
        });

        successCount++;
        console.log(`Successfully processed cart ${cart.id}`);
      } catch (cartError: any) {
        console.error(`Error processing cart ${cart.id}:`, cartError);
        errors.push({ cartId: cart.id, error: cartError.message });
        errorCount++;
      }
    }

    console.log(`Processing complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${abandonedCarts.length} abandoned carts`,
        processed: successCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-abandoned-carts function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
