
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

    // Parse request body - handle both direct calls and supabase.functions.invoke calls
    let requestData;
    try {
      const rawBody = await req.text();
      logStep("📝 Raw request body", { rawBody, length: rawBody.length });
      
      if (!rawBody || rawBody.trim() === '') {
        logStep("❌ Empty request body");
        return new Response(JSON.stringify({ error: "Empty request body" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      requestData = JSON.parse(rawBody);
      logStep("📝 Parsed request data", { requestData, type: typeof requestData });
    } catch (parseError) {
      logStep("❌ Failed to parse request body", { error: parseError.message });
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        details: parseError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Extract email from the request data
    let email;
    if (requestData && typeof requestData === 'object') {
      if (requestData.email) {
        email = requestData.email;
      } else if (Array.isArray(requestData) && requestData[0] && requestData[0].email) {
        email = requestData[0].email;
      }
    }

    if (!email) {
      logStep("❌ Email is required but not provided", { receivedData: requestData });
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

    // Initialize Resend with error handling
    let resend;
    try {
      resend = new Resend(resendKey);
      logStep("🔧 Resend client initialized successfully");
    } catch (resendInitError) {
      logStep("❌ Failed to initialize Resend client", { error: resendInitError.message });
      return new Response(JSON.stringify({ 
        error: "Failed to initialize email service",
        details: resendInitError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

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

      logStep("✅ Resend API call completed", { 
        responseData: emailResponse.data,
        responseError: emailResponse.error 
      });

      // Check if Resend returned an error
      if (emailResponse.error) {
        logStep("❌ Resend API returned error", { error: emailResponse.error });
        return new Response(JSON.stringify({ 
          error: "Failed to send email",
          details: emailResponse.error 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

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
      logStep("💥 Email sending error", { 
        error: errorMessage,
        email,
        stack: emailError instanceof Error ? emailError.stack : 'No stack trace'
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
