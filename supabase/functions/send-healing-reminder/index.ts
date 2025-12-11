import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "https://esm.sh/resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendReminderRequest {
  reminderId: string
}

const logStep = (step: string, details?: any) => {
  console.log(`[send-healing-reminder] ${step}`, details ? JSON.stringify(details) : '')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    const resend = new Resend(resendKey)

    const { reminderId }: SendReminderRequest = await req.json()
    logStep('Processing reminder', { reminderId })

    // Get reminder details (separate query, no join)
    const { data: reminder, error: reminderError } = await supabase
      .from('healing_reminders')
      .select('*')
      .eq('id', reminderId)
      .single()

    if (reminderError) {
      logStep('Error fetching reminder', { error: reminderError })
      throw reminderError
    }

    if (!reminder) {
      throw new Error('Reminder not found')
    }

    logStep('Reminder found', { 
      title: reminder.title, 
      status: reminder.status, 
      user_id: reminder.user_id,
      delivery_method: reminder.delivery_method 
    })

    if (reminder.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Reminder already processed', status: reminder.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user email from profiles table (separate query)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', reminder.user_id)
      .single()

    if (profileError) {
      logStep('Error fetching user profile', { error: profileError })
      throw new Error(`Could not fetch user profile: ${profileError.message}`)
    }

    if (!profile?.email) {
      throw new Error('User email not found in profile')
    }

    const userEmail = profile.email
    logStep('User email found', { email: userEmail })

    const results: { email?: any; push?: any } = {}
    const siteUrl = Deno.env.get('SITE_URL') || 'https://dreamtattooco.com'

    // Send email if needed
    if (reminder.delivery_method === 'email' || reminder.delivery_method === 'both') {
      logStep('Sending email', { to: userEmail, subject: reminder.title })
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${reminder.title}</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                ${reminder.message}
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${siteUrl}${reminder.action_url || '/healing-tracker'}" 
                   style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Open Healing Tracker
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center;">
                <p>You're receiving this because you signed up for healing reminders with HealAid.</p>
                <p style="margin-top: 10px;">
                  <a href="${siteUrl}/healing-tracker" style="color: #667eea; text-decoration: none;">
                    Manage your reminder preferences
                  </a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `

      try {
        const emailResponse = await resend.emails.send({
          from: 'HealAid <noreply@updates.bluedreambudder.com>',
          to: [userEmail],
          subject: reminder.title,
          html: emailHtml,
        })

        results.email = emailResponse
        logStep('Email sent successfully', { response: emailResponse })
      } catch (emailError: any) {
        logStep('Email send error', { error: emailError.message })
        results.email = { error: emailError.message }
      }
    }

    // Send push notification if needed
    if (reminder.delivery_method === 'push' || reminder.delivery_method === 'both') {
      logStep('Sending push notification', { userId: reminder.user_id })
      
      try {
        const pushResponse = await supabase.functions.invoke('send-push-notification', {
          body: {
            userId: reminder.user_id,
            title: reminder.title,
            body: reminder.message,
            data: {
              type: 'healing_reminder',
              reminder_id: reminderId,
              action_url: reminder.action_url,
            },
          },
        })

        results.push = pushResponse.data
        logStep('Push notification result', { response: results.push })
      } catch (pushError: any) {
        logStep('Push notification error', { error: pushError.message })
        results.push = { error: pushError.message }
      }
    }

    // Update reminder status
    const { error: updateError } = await supabase
      .from('healing_reminders')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { ...reminder.metadata, results },
      })
      .eq('id', reminderId)

    if (updateError) {
      logStep('Error updating reminder status', { error: updateError })
      throw updateError
    }

    logStep('Reminder completed successfully', { reminderId, results })

    return new Response(
      JSON.stringify({ success: true, reminderId, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    logStep('Error sending reminder', { error: error.message })
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
