
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
    logStep("🔄 CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🚀 Function started");
    logStep("📋 Request details", { method: req.method, url: req.url });

    // Only accept POST requests
    if (req.method !== "POST") {
      logStep("❌ Invalid method", { method: req.method });
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    logStep("🔑 Checking RESEND_API_KEY", { exists: !!resendKey, length: resendKey?.length });
    
    if (!resendKey) {
      logStep("❌ RESEND_API_KEY is not set");
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logStep("❌ Invalid email format", { email });
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("📧 Processing email signup", { email });

    logStep("🔧 Initializing Resend client");
    const resend = new Resend(resendKey);

    logStep("📤 Attempting to send email via Resend");

    try {
      const emailResponse = await resend.emails.send({
        from: "Blue Dream Budder <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Blue Dream Budder! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); padding: 40px 20px; text-align: center; color: white; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to Blue Dream Budder!</h1>
              <p style="margin: 16px 0 0 0; font-size: 18px;">Thanks for joining our family. Your skin is about to feel incredible.</p>
            </div>
            
            <div style="background: white; padding: 40px 20px; border-radius: 0 0 12px 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Your Exclusive 10% Discount Code</h2>
              
              <div style="background: #f1f5f9; border: 3px dashed #3b82f6; padding: 25px; text-align: center; margin: 30px 0; border-radius: 12px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Use Code</p>
                <p style="margin: 0; font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 3px;">WELCOME10</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">Save 10% on your first order</p>
              </div>
              
              <p style="color: #374151; margin: 25px 0; font-size: 16px; text-align: center;">
                As a valued subscriber, you'll be the first to know about exclusive discounts, new products, and professional tattoo aftercare tips.
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="https://bluedreambudder.com" 
                   style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 18px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                  Shop Now & Save 10%
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 16px; margin: 0;">
                  For Ink. For Skin. For Life.<br>
                  <span style="color: #3b82f6; font-weight: 600;">Blue Dream Budder Team</span>
                </p>
              </div>
            </div>
          </div>
        `,
      });

      logStep("✅ Email sent successfully!", { 
        id: emailResponse.data?.id,
        to: email,
        from: "Blue Dream Budder <onboarding@resend.dev>"
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Welcome email sent successfully",
        emailId: emailResponse.data?.id,
        recipient: email
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      logStep("💥 Resend API Error", { 
        error: errorMessage,
        email,
        errorType: emailError instanceof Error ? emailError.constructor.name : 'Unknown'
      });

      return new Response(JSON.stringify({ 
        error: "Failed to send email",
        details: errorMessage,
        suggestion: "Please try again or contact support if the issue persists"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    logStep("💥 CRITICAL ERROR", { 
      message: errorMessage, 
      stack: errorStack
    });
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
