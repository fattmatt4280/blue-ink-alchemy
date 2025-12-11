import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, data?: any) => {
  console.log(`[send-shipment-reminder] ${step}`, data || '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { reminderId } = await req.json();
    
    if (!reminderId) {
      throw new Error('Reminder ID is required');
    }

    logStep('Fetching reminder details', { reminderId });

    // Fetch reminder with related shipment and order data
    const { data: reminder, error: reminderError } = await supabase
      .from('shipment_reminders')
      .select(`
        *,
        shipments (
          *,
          orders (
            id,
            email,
            shipping_info,
            stripe_session_id
          )
        )
      `)
      .eq('id', reminderId)
      .single();

    if (reminderError || !reminder) {
      throw new Error(`Failed to fetch reminder: ${reminderError?.message}`);
    }

    if (reminder.status !== 'pending') {
      logStep('Reminder already processed', { status: reminder.status });
      return new Response(
        JSON.stringify({ message: 'Reminder already processed', status: reminder.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shipment = reminder.shipments;
    const order = shipment.orders;

    logStep('Building reminder email', { 
      trackingNumber: shipment.shippo_tracking_number,
      carrier: shipment.carrier 
    });

    // Build tracking URL
    const trackingUrl = shipment.tracking_url || 
      `https://vozstxchkgpxzetwdzow.supabase.co/functions/v1/track-shipment?tracking=${shipment.shippo_tracking_number}&carrier=${shipment.carrier}`;

    // Get email template from settings or use default
    const { data: templateSettings } = await supabase
      .from('reminder_settings')
      .select('setting_value')
      .eq('setting_key', 'reminder_email_template')
      .single();

    const template = templateSettings?.setting_value?.template || 
      'Your order is on the way! Track it here: {tracking_url}';
    
    const subject = templateSettings?.setting_value?.subject || 'Update on Your Order';

    // Replace template variables
    const emailBody = reminder.message_template || template.replace('{tracking_url}', trackingUrl);
    
    const shippingInfo = order.shipping_info as any;
    const customerName = shippingInfo?.name || 'Valued Customer';

    // Send email via Resend
    logStep('Sending email via Resend', { to: order.email });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .tracking-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #667eea; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Shipment Update</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>${emailBody}</p>
              
              <div class="tracking-box">
                <p><strong>Tracking Number:</strong> ${shipment.shippo_tracking_number}</p>
                <p><strong>Carrier:</strong> ${shipment.carrier}</p>
                <p><strong>Status:</strong> ${shipment.tracking_status}</p>
                ${shipment.shipped_at ? `<p><strong>Shipped:</strong> ${new Date(shipment.shipped_at).toLocaleDateString()}</p>` : ''}
              </div>

              <p style="text-align: center;">
                <a href="${trackingUrl}" class="button">Track Your Package</a>
              </p>

              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>Thank you for your order!</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'Dream Tattoo <noreply@updates.bluedreambudder.com>',
      to: [order.email],
      subject: subject,
      html: emailHtml,
    });

    if (emailError) {
      logStep('Email send failed', emailError);
      
      // Update reminder status to failed
      await supabase
        .from('shipment_reminders')
        .update({ 
          status: 'failed',
          metadata: { ...reminder.metadata, error: emailError.message }
        })
        .eq('id', reminderId);

      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    logStep('Email sent successfully', { emailId: emailResult.id });

    // Update reminder status to sent
    const { error: updateError } = await supabase
      .from('shipment_reminders')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { ...reminder.metadata, resend_id: emailResult.id }
      })
      .eq('id', reminderId);

    if (updateError) {
      logStep('Failed to update reminder status', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminder: { id: reminderId, status: 'sent' },
        email: { id: emailResult.id }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    logStep('Error', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
