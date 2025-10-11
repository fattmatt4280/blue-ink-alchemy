import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, data?: any) => {
  console.log(`[check-stalled-shipments] ${step}`, data || '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    logStep('Starting stalled shipments check');

    // Check if auto-reminders are enabled
    const { data: autoRemindersSettings } = await supabase
      .from('reminder_settings')
      .select('setting_value')
      .eq('setting_key', 'auto_reminders_enabled')
      .single();

    const autoRemindersEnabled = autoRemindersSettings?.setting_value?.enabled ?? true;

    if (!autoRemindersEnabled) {
      logStep('Auto-reminders disabled');
      return new Response(
        JSON.stringify({ message: 'Auto-reminders are disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get stalled shipment threshold
    const { data: thresholdSettings } = await supabase
      .from('reminder_settings')
      .select('setting_value')
      .eq('setting_key', 'stalled_shipment_days')
      .single();

    const stalledDays = thresholdSettings?.setting_value?.days ?? 3;
    const stalledThreshold = new Date();
    stalledThreshold.setDate(stalledThreshold.getDate() - stalledDays);

    logStep('Checking for shipments stalled since', { 
      stalledDays, 
      threshold: stalledThreshold.toISOString() 
    });

    // Find shipments that haven't been updated in X days and aren't delivered
    const { data: stalledShipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select(`
        *,
        orders (
          id,
          email,
          shipping_info
        )
      `)
      .lt('updated_at', stalledThreshold.toISOString())
      .neq('tracking_status', 'DELIVERED')
      .neq('tracking_status', 'RETURNED')
      .in('tracking_status', ['IN_TRANSIT', 'UNKNOWN', 'PRE_TRANSIT']);

    if (shipmentsError) {
      throw new Error(`Failed to fetch stalled shipments: ${shipmentsError.message}`);
    }

    logStep('Found stalled shipments', { count: stalledShipments?.length || 0 });

    if (!stalledShipments || stalledShipments.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No stalled shipments found',
          checked: 0,
          reminders_created: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const remindersCreated = [];

    for (const shipment of stalledShipments) {
      // Check if there's already a pending stalled reminder for this shipment
      const { data: existingReminder } = await supabase
        .from('shipment_reminders')
        .select('id')
        .eq('shipment_id', shipment.id)
        .eq('reminder_type', 'stalled')
        .eq('status', 'pending')
        .single();

      if (existingReminder) {
        logStep('Reminder already exists for shipment', { shipmentId: shipment.id });
        continue;
      }

      // Create a pending reminder
      const { data: newReminder, error: reminderError } = await supabase
        .from('shipment_reminders')
        .insert({
          shipment_id: shipment.id,
          order_id: shipment.order_id,
          reminder_type: 'stalled',
          scheduled_for: new Date().toISOString(),
          email_recipient: shipment.orders.email,
          status: 'pending',
          metadata: {
            days_since_update: stalledDays,
            last_update: shipment.updated_at,
            tracking_status: shipment.tracking_status
          }
        })
        .select()
        .single();

      if (reminderError) {
        logStep('Failed to create reminder', { 
          shipmentId: shipment.id, 
          error: reminderError 
        });
        continue;
      }

      logStep('Created reminder', { 
        reminderId: newReminder.id, 
        shipmentId: shipment.id 
      });

      remindersCreated.push(newReminder.id);

      // Optionally send immediately (or let admin review first)
      // Uncomment to auto-send:
      // await supabase.functions.invoke('send-shipment-reminder', {
      //   body: { reminderId: newReminder.id }
      // });
    }

    logStep('Completed stalled shipments check', { 
      checked: stalledShipments.length,
      remindersCreated: remindersCreated.length 
    });

    return new Response(
      JSON.stringify({
        success: true,
        checked: stalledShipments.length,
        reminders_created: remindersCreated.length,
        reminder_ids: remindersCreated
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
