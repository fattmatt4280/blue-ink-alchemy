import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ORDER-NOTIFICATIONS] ${timestamp} ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { orderId, notificationType } = await req.json();
    logStep("Sending order notification", { orderId, notificationType });

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select(`
        *,
        products (name, description, price, image_url),
        shipments (tracking_status, shippo_tracking_number, carrier, tracking_url)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    let emailSubject = "";
    let emailHtml = "";

    switch (notificationType) {
      case 'order_confirmation':
        emailSubject = `Order Confirmation - Thank You for Your Purchase!`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Thank You for Your Order!</h1>
            <p>Hi there,</p>
            <p>We've received your order and are processing it now. Here are the details:</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${order.id.slice(-8).toUpperCase()}</p>
              <p><strong>Product:</strong> ${order.products?.name || 'Product'}</p>
              <p><strong>Amount:</strong> $${(order.amount / 100).toFixed(2)}</p>
              <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
            </div>

            ${order.shipping_info ? `
              <div style="background-color: #f0f8ff; padding: 20px; margin: 20px 0;">
                <h3>Shipping Address</h3>
                <p>
                  ${order.shipping_info.name}<br>
                  ${order.shipping_info.street1}<br>
                  ${order.shipping_info.city}, ${order.shipping_info.state} ${order.shipping_info.zip}<br>
                  ${order.shipping_info.country}
                </p>
              </div>
            ` : ''}

            <p>You'll receive another email with tracking information once your order ships.</p>
            <p>Thank you for choosing us!</p>
            
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
          </div>
        `;
        break;

      case 'shipping_confirmation':
        emailSubject = `Your Order Has Shipped! 📦`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Your Order is on the Way! 🚛</h1>
            <p>Great news! Your order has been shipped and is on its way to you.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
              <h2>Shipping Details</h2>
              <p><strong>Order ID:</strong> ${order.id.slice(-8).toUpperCase()}</p>
              <p><strong>Tracking Number:</strong> ${order.shipments?.[0]?.shippo_tracking_number || 'Processing'}</p>
              <p><strong>Carrier:</strong> ${order.shipments?.[0]?.carrier || 'TBD'}</p>
              <p><strong>Status:</strong> ${order.shipments?.[0]?.tracking_status || 'In Transit'}</p>
            </div>

            ${order.shipments?.[0]?.tracking_url ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${order.shipments[0].tracking_url}" 
                   style="background-color: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Track Your Package
                </a>
              </div>
            ` : ''}

            <p>We'll send you another update when your package is delivered.</p>
            
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
              <p>Thanks for your business!</p>
            </div>
          </div>
        `;
        break;

      case 'delivery_confirmation':
        emailSubject = `Your Order Has Been Delivered! 🎉`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Package Delivered! 🎉</h1>
            <p>Your order has been successfully delivered!</p>
            
            <div style="background-color: #f0f8ff; padding: 20px; margin: 20px 0;">
              <h2>Delivery Confirmation</h2>
              <p><strong>Order ID:</strong> ${order.id.slice(-8).toUpperCase()}</p>
              <p><strong>Delivered:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Product:</strong> ${order.products?.name || 'Product'}</p>
            </div>

            <p>We hope you love your purchase! If you have any issues or questions, please don't hesitate to reach out.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px;">⭐ We'd love to hear about your experience! ⭐</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
              <p>Thank you for choosing us!</p>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${notificationType}`);
    }

    // Send notification email
    const emailResponse = await resend.emails.send({
      from: "Your Store <orders@yourdomain.com>",
      to: [order.email],
      subject: emailSubject,
      html: emailHtml,
    });

    if (emailResponse.error) {
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    logStep("Order notification sent successfully", { 
      orderId, 
      notificationType, 
      email: order.email,
      emailId: emailResponse.data?.id 
    });

    return new Response(JSON.stringify({
      success: true,
      notificationType,
      emailId: emailResponse.data?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR in send-order-notifications", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});