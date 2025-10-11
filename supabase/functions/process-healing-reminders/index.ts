import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Processing pending healing reminders...')

    // Get all pending reminders that are due now
    const { data: reminders, error: reminderError } = await supabase
      .from('healing_reminders')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(50) // Process 50 at a time

    if (reminderError) {
      throw reminderError
    }

    console.log(`Found ${reminders?.length || 0} reminders to process`)

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No reminders to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process each reminder
    const results = {
      total: reminders.length,
      sent: 0,
      failed: 0,
      errors: [] as any[],
    }

    for (const reminder of reminders) {
      try {
        console.log(`Processing reminder ${reminder.id} for user ${reminder.user_id}`)
        
        // Call send-healing-reminder function
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-healing-reminder`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reminderId: reminder.id }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          results.sent++
          console.log(`✓ Reminder ${reminder.id} sent successfully`)
        } else {
          results.failed++
          results.errors.push({ reminderId: reminder.id, error: result.error || 'Unknown error' })
          console.error(`✗ Failed to send reminder ${reminder.id}:`, result.error)
          
          // Update reminder status to failed
          await supabase
            .from('healing_reminders')
            .update({ 
              status: 'failed',
              metadata: { error: result.error || 'Unknown error' }
            })
            .eq('id', reminder.id)
        }
      } catch (error) {
        results.failed++
        results.errors.push({ reminderId: reminder.id, error: error.message })
        console.error(`Error processing reminder ${reminder.id}:`, error)
        
        // Update reminder status to failed
        await supabase
          .from('healing_reminders')
          .update({ 
            status: 'failed',
            metadata: { error: error.message }
          })
          .eq('id', reminder.id)
      }
    }

    console.log('Processing complete:', results)

    return new Response(
      JSON.stringify({ 
        success: true,
        total: results.total,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing reminders:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
