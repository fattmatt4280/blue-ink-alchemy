
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🚀 Function started");
    logStep("📋 Request method", { method: req.method });
    logStep("🔗 Request URL", { url: req.url });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    logStep("🔑 Checking RESEND_API_KEY", { exists: !!resendKey, length: resendKey?.length });
    
    if (!resendKey) {
      logStep("❌ RESEND_API_KEY is not set");
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    logStep("✅ RESEND_API_KEY found");

    let body;
    try {
      body = await req.json();
      logStep("📝 Request body parsed", { body });
    } catch (e) {
      logStep("❌ Failed to parse request body", { error: e.message });
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { email } = body;

    if (!email) {
      logStep("❌ Email is required but not provided");
      return new Response(JSON.stringify({ error: "Email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("📧 Processing email signup", { email });

    logStep("🔧 Initializing Resend client");
    const resend = new Resend(resendKey);

    logStep("📤 Attempting to send email via Resend");

    const emailResponse = await resend.emails.send({
      from: "Blue Dream Budder <hello@updates.bluedreambudder.com>",
      to: [email],
      subject: "Welcome to Blue Dream Budder! 🎨",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); padding: 40px 20px; text-align: center; color: white; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to the Blue Dream Family!</h1>
            <p style="margin: 16px 0 0 0; font-size: 18px; opacity: 0.9;">Premium CBD-infused tattoo aftercare</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 24px;">Your Exclusive 10% Discount Code</h2>
            
            <div style="background: #f1f5f9; border: 2px dashed #3b82f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Use Code</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 2px;">WELCOME10</p>
            </div>
            
            <p style="color: #64748b; margin: 20px 0; font-size: 16px; line-height: 1.6;">
              Thank you for joining our community! As a new subscriber, you'll be the first to know about:
            </p>
            
            <ul style="color: #64748b; margin: 20px 0; padding-left: 20px; font-size: 16px; line-height: 1.8;">
              <li>Exclusive discounts and promotions</li>
              <li>New product launches</li>
              <li>Professional tattoo aftercare tips</li>
              <li>Artist collaborations and features</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bluedreambudder.com/shop" 
                 style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
                Shop Now & Save 10%
              </a>
            </div>
            
            <hr style="border: none; height: 1px; background: #e2e8f0; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                For Ink. For Skin. For Life.<br>
                Blue Dream Budder Team
              </p>
              <p style="color: #cbd5e1; font-size: 12px; margin: 16px 0 0 0;">
                You're receiving this because you signed up for our newsletter. 
                <a href="#" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    logStep("✅ Email sent successfully!", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    const errorName = error instanceof Error ? error.name : 'Unknown error type';
    
    logStep("💥 CRITICAL ERROR", { 
      message: errorMessage, 
      stack: errorStack,
      name: errorName,
      fullError: error
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: {
        name: errorName,
        message: errorMessage
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
