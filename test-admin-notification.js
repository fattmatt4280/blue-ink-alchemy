// Test script to call send-admin-notification function
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vozstxchkgpxzetwdzow.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvenN0eGNoa2dweHpldHdkem93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDQyMjAsImV4cCI6MjA2Njc4MDIyMH0.Ti9dIcVzMY_jNzvbPHPz9n47f8p3xrmrT_mAMb5yG6M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminNotification() {
  try {
    console.log('Calling send-admin-notification function...');
    
    const { data, error } = await supabase.functions.invoke('send-admin-notification', {
      body: { orderId: '973cb4cf-d50f-47d1-8469-e4da3207004a' }
    });

    if (error) {
      console.error('Error calling function:', error);
    } else {
      console.log('Function response:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testAdminNotification();