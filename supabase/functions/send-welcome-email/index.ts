
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

    // Parse request body with better error handling
    let body;
    try {
      const contentType = req.headers.get("content-type") || "";
      logStep("📝 Content-Type header", { contentType });
      
      if (contentType.includes("application/json")) {
        body = await req.json();
        logStep("📝 Request body parsed as JSON", { body });
      } else {
        // Try to parse as text first, then JSON
        const bodyText = await req.text();
        logStep("📝 Raw request body as text", { bodyText, length: bodyText.length });
        
        if (bodyText.trim()) {
          body = JSON.parse(bodyText);
          logStep("📝 Request body parsed from text", { body });
        } else {
          logStep("❌ Empty request body received");
          return new Response(JSON.stringify({ error: "Empty request body" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
      }
    } catch (parseError) {
      logStep("❌ Failed to parse request body", { 
        error: parseError.message,
        contentType: req.headers.get("content-type")
      });
      return new Response(JSON.stringify({ 
        error: "Invalid request body format",
        details: parseError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { email } = body;

    if (!email) {
      logStep("❌ Email is required but not provided", { receivedBody: body });
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1e40af; text-align: center;">Welcome to Blue Dream Budder!</h1>
            <p style="font-size: 18px; text-align: center;">Thanks for joining our family!</p>
            
            <div style="background: #f1f5f9; border: 2px dashed #3b82f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #1e40af; margin: 0;">Your Discount Code</h2>
              <p style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 10px 0;">WELCOME10</p>
              <p style="color: #64748b;">Save 10% on your first order</p>
            </div>
            
            <p style="text-align: center;">
              <a href="https://bluedreambudder.com" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Shop Now & Save 10%
              </a>
            </p>
            
            <p style="text-align: center; color: #6b7280; margin-top: 30px;">
              For Ink. For Skin. For Life.<br>
              Blue Dream Budder Team
            </p>
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
        details: errorMessage
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
