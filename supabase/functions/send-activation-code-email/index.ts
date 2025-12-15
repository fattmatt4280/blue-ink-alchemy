import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivationCodeEmailRequest {
  email: string;
  code: string;
  tier: 'free_trial' | '7_day' | '30_day';
  customerName?: string;
}

const tierNames = {
  free_trial: '3-Day Free Trial',
  '7_day': '7-Day Access',
  '30_day': '30-Day Access',
};

const tierDurations = {
  free_trial: '3 days',
  '7_day': '7 days',
  '30_day': '30 days',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, tier, customerName }: ActivationCodeEmailRequest = await req.json();

    if (!email || !code || !tier) {
      return new Response(
        JSON.stringify({ error: 'Email, code, and tier are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tierName = tierNames[tier] || 'Heal-AId Access';
    const duration = tierDurations[tier] || 'access';
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);

    const activateUrl = `https://bluedreambudder.com/activate?code=${code}`;

    const emailResponse = await resend.emails.send({
      from: "Dream Tattoo Company <noreply@updates.bluedreambudder.com>",
      to: [email],
      subject: `Your Heal-AId™ (Patent Pending) Activation Code - ${tierName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .code-box { background: #f3f4f6; border: 2px dashed #9ca3af; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; }
              .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: 'Courier New', monospace; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; margin-top: 20px; }
              .features { margin: 20px 0; }
              .feature { padding: 10px 0; }
              .feature::before { content: "✓"; color: #10b981; font-weight: bold; margin-right: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎨 Heal-AId™ (Patent Pending) Activated!</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px;">Your ${tierName}</p>
              </div>
              
              <div class="content">
                <p>Hi${customerName ? ` ${customerName}` : ''},</p>
                
                <p>Thank you for choosing Heal-AId™ (Patent Pending), powered by Blue Dream Budder! You're about to experience the most advanced tattoo healing guidance available.</p>
                
                <div class="code-box">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your Activation Code</p>
                  <div class="code">${code}</div>
                </div>

                <div class="warning">
                  <strong>⏰ Important:</strong> This code must be activated within 90 days (expires ${expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})
                </div>

                <p><strong>Once activated, you'll have ${duration} of access to:</strong></p>
                
                <div class="features">
                  <div class="feature">Charlie AI - Your personal tattoo healing assistant</div>
                  <div class="feature">Real-time healing analysis with photo tracking</div>
                  <div class="feature">Personalized aftercare recommendations</div>
                  <div class="feature">24/7 access to expert guidance</div>
                  <div class="feature">Progress monitoring and healing timeline</div>
                </div>

                <div style="text-align: center;">
                  <a href="${activateUrl}" class="cta-button">Activate Now</a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${activateUrl}" style="color: #667eea; word-break: break-all;">${activateUrl}</a>
                </p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Questions? We're here to help!</p>
                  <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Reply to this email or visit our support page.</p>
                </div>
              </div>

              <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>Dream Tattoo Company | Powered by Blue Dream Budder</p>
                <p style="font-size: 12px; margin-top: 10px;">Heal-AId™ is a patent-pending AI technology by Dream Tattoo Company.</p>
                <p style="font-size: 12px; margin-top: 5px;">If you didn't request this activation code, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Activation code email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-activation-code-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
