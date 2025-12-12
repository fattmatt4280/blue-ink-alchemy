import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UnsubscribeRequest {
  token: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token }: UnsubscribeRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Processing unsubscribe for token:", token);

    // Find contact by token
    const { data: contact, error: fetchError } = await supabase
      .from("marketing_contacts")
      .select("id, email, subscribed")
      .eq("unsubscribe_token", token)
      .single();

    if (fetchError || !contact) {
      console.error("Contact not found for token:", token);
      return new Response(
        JSON.stringify({ error: "Invalid or expired unsubscribe link" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!contact.subscribed) {
      return new Response(
        JSON.stringify({ success: true, message: "Already unsubscribed", email: contact.email }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from("marketing_contacts")
      .update({
        subscribed: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", contact.id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw new Error("Failed to process unsubscribe request");
    }

    console.log(`Successfully unsubscribed: ${contact.email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Successfully unsubscribed", email: contact.email }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in handle-unsubscribe:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
