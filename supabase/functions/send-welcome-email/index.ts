
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
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); padding: 40px 20px; text-align: center; color: white; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Welcome to Blue Dream Budder!</h1>
              <p style="margin: 16px 0 0 0; font-size: 18px; opacity: 0.95;">Thanks for joining the Blue Dream Budder family. Your skin is about to feel incredible.</p>
            </div>
            
            <div style="background: white; padding: 40px 20px; border-radius: 0 0 12px 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Your Exclusive 10% Discount Code</h2>
              
              <div style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border: 3px dashed #3b82f6; padding: 25px; text-align: center; margin: 30px 0; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Use Code</p>
                <p style="margin: 0; font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 3px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">WELCOME10</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b; font-style: italic;">Save 10% on your first order</p>
              </div>
              
              <p style="color: #374151; margin: 25px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                As a valued subscriber, you'll be the first to know about:
              </p>
              
              <ul style="color: #4b5563; margin: 25px 0; padding-left: 0; list-style: none; font-size: 15px; line-height: 1.8;">
                <li style="padding: 8px 0; border-left: 3px solid #3b82f6; padding-left: 15px; margin-bottom: 10px;">🎯 Exclusive discounts and promotions</li>
                <li style="padding: 8px 0; border-left: 3px solid #3b82f6; padding-left: 15px; margin-bottom: 10px;">🚀 New product launches</li>
                <li style="padding: 8px 0; border-left: 3px solid #3b82f6; padding-left: 15px; margin-bottom: 10px;">💡 Professional tattoo aftercare tips</li>
                <li style="padding: 8px 0; border-left: 3px solid #3b82f6; padding-left: 15px; margin-bottom: 10px;">🎨 Artist collaborations and features</li>
              </ul>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="https://bluedreambudder.com/#products" 
                   style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 18px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;">
                  Shop Now & Save 10%
                </a>
              </div>
              
              <hr style="border: none; height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 35px 0;">
              
              <div style="text-align: center;">
                <p style="color: #6b7280; font-size: 16px; margin: 0; font-weight: 500;">
                  For Ink. For Skin. For Life.<br>
                  <span style="color: #3b82f6; font-weight: 600;">Blue Dream Budder Team</span>
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
                  If you no longer wish to receive these emails, you can <a href="#" style="color: #6b7280; text-decoration: underline;">unsubscribe at any time</a>.
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

      // Check for common Resend errors
      if (errorMessage.includes('domain')) {
        return new Response(JSON.stringify({ 
          error: "Email domain not verified",
          details: "The sender domain needs to be verified in Resend",
          suggestion: "Please verify your domain at https://resend.com/domains or contact support"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      if (errorMessage.includes('API key')) {
        return new Response(JSON.stringify({ 
          error: "Invalid API key",
          details: "The RESEND_API_KEY is invalid or expired",
          suggestion: "Please check your API key at https://resend.com/api-keys"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }

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
    const errorName = error instanceof Error ? error.name : 'Unknown error type';
    
    logStep("💥 CRITICAL ERROR", { 
      message: errorMessage, 
      stack: errorStack,
      name: errorName,
      fullError: error
    });
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: errorMessage,
      troubleshooting: "Check function logs for more details"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
