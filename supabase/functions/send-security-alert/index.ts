import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  alertType: 'auth_failure' | 'rate_limit' | 'ai_error' | 'anomaly' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    message: string;
    context?: any;
    timestamp?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alertType, severity, details }: SecurityAlertRequest = await req.json();

    const severityEmoji = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    const alertTypeLabel = {
      auth_failure: 'Authentication Failure',
      rate_limit: 'Rate Limit Violation',
      ai_error: 'AI Service Error',
      anomaly: 'Anomalous AI Response',
      suspicious_activity: 'Suspicious Activity'
    };

    const emailResponse = await resend.emails.send({
      from: "Security Alerts <onboarding@resend.dev>",
      to: ["matt@dreamtattoocompany.com"],
      subject: `${severityEmoji[severity]} ${alertTypeLabel[alertType]} - ${severity.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${severity === 'critical' ? '#dc2626' : severity === 'high' ? '#ea580c' : '#3b82f6'};">
            Security Alert: ${alertTypeLabel[alertType]}
          </h1>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Severity</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #111827;">
              ${severityEmoji[severity]} ${severity.toUpperCase()}
            </p>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; font-size: 16px; color: #111827;">Details</h2>
            <p style="color: #374151; line-height: 1.6;">${details.message}</p>
            
            ${details.context ? `
              <div style="margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 6px; font-family: monospace; font-size: 12px; overflow-x: auto;">
                <pre style="margin: 0;">${JSON.stringify(details.context, null, 2)}</pre>
              </div>
            ` : ''}
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>⚠️ Recommended Action:</strong>
              ${getRecommendedAction(alertType)}
            </p>
          </div>

          <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
            Time: ${details.timestamp || new Date().toISOString()}<br>
            This is an automated security alert from your HealAid system.
          </p>
        </div>
      `,
    });

    console.log("Security alert sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending security alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getRecommendedAction(alertType: string): string {
  switch (alertType) {
    case 'auth_failure':
      return 'Review failed login attempts in admin dashboard. Consider blocking suspicious IP addresses.';
    case 'rate_limit':
      return 'Check rate_limit_violations table for patterns. Consider extending block duration for repeat offenders.';
    case 'ai_error':
      return 'Check AI service health and credit balance. Review error logs in Supabase.';
    case 'anomaly':
      return 'Review flagged AI response in admin dashboard. May require manual expert assessment.';
    case 'suspicious_activity':
      return 'Investigate user activity patterns. Consider flagging account for review.';
    default:
      return 'Review the security logs and take appropriate action.';
  }
}

serve(handler);
