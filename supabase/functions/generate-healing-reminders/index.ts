import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRemindersRequest {
  userId: string
  healingProgressId: string
  tattooAge: number // days since tattoo was done
  userName?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { userId, healingProgressId, tattooAge, userName }: GenerateRemindersRequest = await req.json()

    console.log('Generating reminders for user:', userId, 'tattooAge:', tattooAge)

    // Get user preferences
    const { data: prefs, error: prefsError } = await supabase
      .from('user_reminder_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (prefsError && prefsError.code !== 'PGRST116') {
      throw prefsError
    }

    // Use defaults if no preferences exist
    const preferences = prefs || {
      email_enabled: true,
      push_enabled: true,
      timezone: 'America/New_York',
      reminder_types: {
        clean: true,
        moisturize: true,
        upload_photo: true,
        check_symptoms: true,
        avoid_activity: true,
      },
    }

    // Get active reminder templates
    const { data: templates, error: templateError } = await supabase
      .from('reminder_templates')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false })

    if (templateError) {
      throw templateError
    }

    // Calculate tattoo birth date
    const tattooDate = new Date()
    tattooDate.setDate(tattooDate.getDate() - tattooAge)

    const remindersToCreate = []

    for (const template of templates) {
      // Check if user wants this type of reminder
      if (!preferences.reminder_types[template.reminder_type]) {
        console.log('Skipping', template.reminder_type, '- user disabled')
        continue
      }

      // Calculate scheduled time
      const scheduledTime = new Date(tattooDate)
      scheduledTime.setHours(scheduledTime.getHours() + template.hours_after_tattoo)

      // Skip if already passed
      if (scheduledTime < new Date()) {
        console.log('Skipping', template.template_name, '- already passed')
        continue
      }

      // Adjust for quiet hours if needed
      // TODO: Implement quiet hours logic based on prefs.quiet_hours_start/end

      // Replace template variables
      const message = template.message_template
        .replace(/{{user_name}}/g, userName || 'there')
        .replace(/{{hours}}/g, String(template.hours_after_tattoo))
        .replace(/{{days}}/g, String(Math.floor(template.hours_after_tattoo / 24)))

      // Determine delivery method
      let deliveryMethod = 'email'
      if (preferences.email_enabled && preferences.push_enabled) {
        deliveryMethod = 'both'
      } else if (preferences.push_enabled) {
        deliveryMethod = 'push'
      }

      remindersToCreate.push({
        user_id: userId,
        healing_progress_id: healingProgressId,
        reminder_type: template.reminder_type,
        title: template.title,
        message: message,
        scheduled_for: scheduledTime.toISOString(),
        delivery_method: deliveryMethod,
        action_url: '/healing-tracker',
        metadata: {
          template_id: template.id,
          template_name: template.template_name,
        },
      })
    }

    // Insert reminders
    const { data: created, error: insertError } = await supabase
      .from('healing_reminders')
      .insert(remindersToCreate)
      .select()

    if (insertError) {
      throw insertError
    }

    console.log(`Created ${created.length} reminders for user ${userId}`)

    return new Response(
      JSON.stringify({ success: true, remindersCreated: created.length, reminders: created }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating reminders:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
