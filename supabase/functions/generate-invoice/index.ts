import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-INVOICE] ${timestamp} ${step}${detailsStr}`);
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

    const { orderId } = await req.json();
    logStep("Generating invoice", { orderId });

    // Get order details with product info
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select(`
        *,
        products (name, description, price, image_url),
        shipments (tracking_status, shippo_tracking_number, carrier)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    logStep("Order retrieved for invoice", { orderId: order.id, email: order.email });

    // Generate invoice number
    const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString();

    // Calculate totals
    const subtotal = order.amount / 100; // Convert from cents
    const shipping = order.shipments?.[0] ? 10.00 : 0; // Default shipping cost
    const total = subtotal + shipping;

    // Create HTML invoice
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 30px; }
          .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .totals { text-align: right; margin-bottom: 30px; }
          .footer { text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>Your Company Name</h2>
        </div>
        
        <div class="invoice-details">
          <strong>Invoice #:</strong> ${invoiceNumber}<br>
          <strong>Date:</strong> ${invoiceDate}<br>
          <strong>Status:</strong> ${order.status.toUpperCase()}
        </div>

        <div class="billing-info">
          <div>
            <h3>Bill To:</h3>
            <p>${order.email}</p>
            ${order.shipping_info ? `
              <p>
                ${order.shipping_info.name || ''}<br>
                ${order.shipping_info.street1 || ''}<br>
                ${order.shipping_info.city || ''}, ${order.shipping_info.state || ''} ${order.shipping_info.zip || ''}<br>
                ${order.shipping_info.country || 'US'}
              </p>
            ` : ''}
          </div>
          <div>
            <h3>Ship To:</h3>
            ${order.shipping_info ? `
              <p>
                ${order.shipping_info.name || ''}<br>
                ${order.shipping_info.street1 || ''}<br>
                ${order.shipping_info.city || ''}, ${order.shipping_info.state || ''} ${order.shipping_info.zip || ''}<br>
                ${order.shipping_info.country || 'US'}
              </p>
            ` : '<p>Same as billing address</p>'}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.products?.name || 'Product'}</td>
              <td>${order.products?.description || 'Product purchase'}</td>
              <td>1</td>
              <td>$${subtotal.toFixed(2)}</td>
              <td>$${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>
          <p><strong>Shipping: $${shipping.toFixed(2)}</strong></p>
          <p style="font-size: 18px;"><strong>Total: $${total.toFixed(2)}</strong></p>
        </div>

        ${order.shipments?.[0]?.shippo_tracking_number ? `
          <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px;">
            <h3>Tracking Information</h3>
            <p><strong>Tracking Number:</strong> ${order.shipments[0].shippo_tracking_number}</p>
            <p><strong>Carrier:</strong> ${order.shipments[0].carrier}</p>
            <p><strong>Status:</strong> ${order.shipments[0].tracking_status}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>If you have any questions about this invoice, please contact us.</p>
        </div>
      </body>
      </html>
    `;

    // Send invoice email
    const emailResponse = await resend.emails.send({
      from: "Your Store <orders@yourdomain.com>",
      to: [order.email],
      subject: `Invoice ${invoiceNumber} - Order Confirmation`,
      html: invoiceHtml,
    });

    if (emailResponse.error) {
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    logStep("Invoice email sent successfully", { orderId, invoiceNumber, email: order.email });

    return new Response(JSON.stringify({
      success: true,
      invoiceNumber,
      emailId: emailResponse.data?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-invoice", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});