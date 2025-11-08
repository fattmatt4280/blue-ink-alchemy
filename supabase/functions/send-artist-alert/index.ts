import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArtistAlertRequest {
  artistUserId: string;
  clientUserId: string;
  healingProgressId?: string;
  alertType: 'high_risk' | 'infection_suspected' | 'allergic_reaction' | 'follow_up_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertTitle: string;
  alertMessage: string;
  riskFactors?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const alertData: ArtistAlertRequest = await req.json();
    
    console.log('Creating artist alert:', alertData);

    // Create alert record
    const { data: alert, error: alertError } = await supabase
      .from('artist_alerts')
      .insert({
        artist_user_id: alertData.artistUserId,
        client_user_id: alertData.clientUserId,
        healing_progress_id: alertData.healingProgressId,
        alert_type: alertData.alertType,
        severity: alertData.severity,
        alert_title: alertData.alertTitle,
        alert_message: alertData.alertMessage,
        risk_factors: alertData.riskFactors,
      })
      .select()
      .single();

    if (alertError) throw alertError;

    // Get artist and client details
    const { data: artist } = await supabase
      .from('artist_profiles')
      .select('business_name, contact_email, user_id')
      .eq('user_id', alertData.artistUserId)
      .single();

    const { data: artistUser } = await supabase.auth.admin.getUserById(alertData.artistUserId);

    const { data: client } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', alertData.clientUserId)
      .single();

    if (!artist || !client) {
      throw new Error('Artist or client not found');
    }

    const clientName = client.first_name 
      ? `${client.first_name} ${client.last_name || ''}`
      : client.email;

    const artistEmail = artist.contact_email || artistUser.user.email;

    // Send email notification
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white;">
            <h1 style="margin: 0;">⚠️ Client Healing Alert</h1>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p><strong>Alert Type:</strong> ${alertData.alertType.replace(/_/g, ' ').toUpperCase()}</p>
            <p><strong>Severity:</strong> <span style="color: ${
              alertData.severity === 'critical' ? '#dc2626' :
              alertData.severity === 'high' ? '#ea580c' :
              alertData.severity === 'medium' ? '#f59e0b' : '#84cc16'
            }; font-weight: bold;">${alertData.severity.toUpperCase()}</span></p>
            
            <h2>${alertData.alertTitle}</h2>
            <p>${alertData.alertMessage}</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Client: ${clientName}</h3>
              <p style="margin: 5px 0;">Email: ${client.email}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://vozstxchkgpxzetwdzow.supabase.co/artist/clients/${alertData.clientUserId}" 
                 style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Client Profile
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              This is an automated alert from Heal-AId. Please review and respond to your client promptly.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Heal-AId Alerts <alerts@dreamtattooco.com>',
        to: [artistEmail],
        subject: `⚠️ ${alertData.severity.toUpperCase()}: ${alertData.alertTitle}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log('Email sent:', emailResult);

    // Send push notification if enabled
    try {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: alertData.artistUserId,
          title: alertData.alertTitle,
          body: alertData.alertMessage,
          data: {
            type: 'artist_alert',
            alert_id: alert.id,
            client_user_id: alertData.clientUserId,
            severity: alertData.severity,
          },
        },
      });
    } catch (pushError) {
      console.error('Push notification failed:', pushError);
    }

    return new Response(
      JSON.stringify({ success: true, alert }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending artist alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
