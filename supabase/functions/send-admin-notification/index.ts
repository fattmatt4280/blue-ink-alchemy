import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  console.log(`[Admin Notification] ${new Date().toISOString()}: ${step}`, details || '');
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting admin notification');

    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Parse request body
    const { orderId } = await req.json();
    logStep('Processing order ID', orderId);

    // Fetch order details with product information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          price,
          description,
          image_url
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      logStep('Error fetching order', orderError);
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    // Get admin notification email from site content
    const { data: siteContent } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'admin_notification_email')
      .single();

    const adminEmail = siteContent?.value || 'orders@bluedreambudder.com';
    logStep('Admin email', adminEmail);

    // Format order amount
    const orderAmount = (order.amount / 100).toFixed(2);

    // Create admin notification email
    const emailSubject = `🎉 New Sale! Order #${order.id.slice(-8)} - $${orderAmount}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Sale Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">🎉 New Sale!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Blue Dream Budder</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> #${order.id.slice(-8)}</p>
            <p><strong>Customer Email:</strong> ${order.email}</p>
            <p><strong>Amount:</strong> $${orderAmount} ${order.currency?.toUpperCase()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          </div>

          ${order.products ? `
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">Product Information</h3>
            <p><strong>Product:</strong> ${order.products.name}</p>
            <p><strong>Price:</strong> $${(order.products.price / 100).toFixed(2)}</p>
            ${order.products.description ? `<p><strong>Description:</strong> ${order.products.description}</p>` : ''}
          </div>
          ` : ''}

          ${order.shipping_info ? `
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">Shipping Information</h3>
            <p><strong>Name:</strong> ${order.shipping_info.name}</p>
            ${order.shipping_info.address ? `
              <p><strong>Address:</strong><br>
              ${order.shipping_info.address.line1}<br>
              ${order.shipping_info.address.line2 ? order.shipping_info.address.line2 + '<br>' : ''}
              ${order.shipping_info.address.city}, ${order.shipping_info.address.state} ${order.shipping_info.address.postal_code}<br>
              ${order.shipping_info.address.country}</p>
            ` : ''}
          </div>
          ` : ''}

          <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">📊 Quick Stats</h3>
            <p style="margin: 5px 0;">💰 Revenue: $${orderAmount}</p>
            <p style="margin: 5px 0;">🛍️ Order Status: ${order.status}</p>
            <p style="margin: 5px 0;">📅 Date: ${new Date(order.created_at).toLocaleString()}</p>
          </div>

          <div style="text-align: center; padding: 20px;">
            <p style="color: #6c757d; font-size: 14px; margin: 0;">
              This is an automated notification from Blue Dream Budder<br>
              Order management system
            </p>
          </div>
        </body>
      </html>
    `;

    // Send admin notification
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: 'Blue Dream Budder <orders@updates.bluedreambudder.com>',
      to: [adminEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailError) {
      logStep('Error sending admin email', emailError);
      throw new Error(`Failed to send admin notification: ${emailError.message}`);
    }

    logStep('Admin notification sent successfully', emailResponse?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin notification sent successfully',
        emailId: emailResponse?.id,
        adminEmail: adminEmail
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    logStep('Error in admin notification', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});