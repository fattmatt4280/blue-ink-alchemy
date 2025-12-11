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

// Base64 encoded logos will be embedded directly for email compatibility
const BW_LOGO_URL = "https://vozstxchkgpxzetwdzow.supabase.co/storage/v1/object/public/site-images/invoice-logo-bw.jpeg";
const WATERMARK_LOGO_URL = "https://vozstxchkgpxzetwdzow.supabase.co/storage/v1/object/public/site-images/invoice-logo-watermark.jpeg";

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
    const currentYear = new Date().getFullYear();

    // Calculate totals
    const subtotal = order.amount / 100; // Convert from cents
    const shipping = order.shipments?.[0] ? 10.00 : 0; // Default shipping cost
    const total = subtotal + shipping;

    // Create HTML invoice with branded design
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; position: relative; }
          .invoice-container { position: relative; min-height: 100%; max-width: 700px; margin: 0 auto; }
          .watermark { 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            opacity: 0.08; 
            width: 350px; 
            pointer-events: none; 
            z-index: 0; 
          }
          .content { position: relative; z-index: 1; }
          .header { display: flex; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header-logo { width: 80px; height: auto; margin-right: 20px; }
          .header-info { flex: 1; }
          .header-info h1 { margin: 0 0 5px 0; font-size: 24px; color: #333; }
          .header-info p { margin: 2px 0; font-size: 12px; color: #666; }
          .invoice-title { text-align: center; margin: 30px 0; }
          .invoice-title h2 { font-size: 28px; color: #333; letter-spacing: 2px; margin: 0; }
          .invoice-details { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .billing-info { margin-bottom: 30px; }
          .billing-row { display: table; width: 100%; }
          .billing-col { display: table-cell; width: 50%; vertical-align: top; padding-right: 20px; }
          .billing-col h3 { margin: 0 0 10px 0; font-size: 14px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .billing-col p { margin: 5px 0; font-size: 13px; color: #555; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #333; color: white; font-size: 12px; text-transform: uppercase; }
          .items-table td { font-size: 13px; }
          .totals { text-align: right; margin-bottom: 30px; }
          .totals p { margin: 5px 0; font-size: 14px; }
          .totals .total-line { font-size: 18px; color: #333; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
          .tracking-info { background-color: #f0f7ff; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #667eea; }
          .tracking-info h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; }
          .tracking-info p { margin: 5px 0; font-size: 13px; color: #555; }
          .disclaimer { background-color: #fafafa; padding: 20px; margin-top: 30px; border: 1px solid #eee; font-size: 11px; color: #666; }
          .disclaimer h3 { font-size: 14px; color: #333; margin: 0 0 15px 0; text-align: center; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .disclaimer h4 { font-size: 11px; color: #444; margin: 15px 0 5px 0; text-transform: uppercase; }
          .disclaimer p { margin: 5px 0 10px 0; line-height: 1.5; }
          .disclaimer a { color: #667eea; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <img src="${WATERMARK_LOGO_URL}" alt="" class="watermark" />
          
          <div class="content">
            <div class="header">
              <img src="${BW_LOGO_URL}" alt="Dream Tattoo Company" class="header-logo" />
              <div class="header-info">
                <h1>Dream Tattoo Company</h1>
                <p>Blue Dream Budder Premium Aftercare</p>
                <p>Email: support@dreamtattoocompany.com</p>
                <p>Website: www.bluedreambudder.com</p>
              </div>
            </div>
            
            <div class="invoice-title">
              <h2>INVOICE</h2>
            </div>
            
            <div class="invoice-details">
              <strong>Invoice #:</strong> ${invoiceNumber} &nbsp;&nbsp;|&nbsp;&nbsp;
              <strong>Date:</strong> ${invoiceDate} &nbsp;&nbsp;|&nbsp;&nbsp;
              <strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">${order.status?.toUpperCase() || 'PENDING'}</span>
            </div>

            <div class="billing-info">
              <div class="billing-row">
                <div class="billing-col">
                  <h3>Bill To:</h3>
                  <p><strong>${order.shipping_info?.name || 'Customer'}</strong></p>
                  <p>${order.email}</p>
                  ${order.shipping_info ? `
                    <p>${order.shipping_info.street1 || ''}</p>
                    <p>${order.shipping_info.city || ''}, ${order.shipping_info.state || ''} ${order.shipping_info.zip || ''}</p>
                    <p>${order.shipping_info.country || 'US'}</p>
                  ` : ''}
                </div>
                <div class="billing-col">
                  <h3>Ship To:</h3>
                  ${order.shipping_info ? `
                    <p><strong>${order.shipping_info.name || 'Customer'}</strong></p>
                    <p>${order.shipping_info.street1 || ''}</p>
                    <p>${order.shipping_info.city || ''}, ${order.shipping_info.state || ''} ${order.shipping_info.zip || ''}</p>
                    <p>${order.shipping_info.country || 'US'}</p>
                  ` : '<p>Same as billing address</p>'}
                </div>
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
              <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
              <p><strong>Shipping:</strong> $${shipping.toFixed(2)}</p>
              <p class="total-line"><strong>Total:</strong> $${total.toFixed(2)}</p>
            </div>

            ${order.shipments?.[0]?.shippo_tracking_number ? `
              <div class="tracking-info">
                <h3>📦 Tracking Information</h3>
                <p><strong>Tracking Number:</strong> ${order.shipments[0].shippo_tracking_number}</p>
                <p><strong>Carrier:</strong> ${order.shipments[0].carrier}</p>
                <p><strong>Status:</strong> ${order.shipments[0].tracking_status}</p>
              </div>
            ` : ''}

            <div class="disclaimer">
              <h3>Important Information</h3>
              
              <h4>Return Policy</h4>
              <p>For returns, exchanges, or any order-related inquiries, please contact us at: <a href="mailto:support@dreamtattoocompany.com">support@dreamtattoocompany.com</a></p>
              
              <h4>Medical Disclaimer</h4>
              <p>This product is not intended to diagnose, treat, cure, or prevent any disease. The statements made regarding this product have not been evaluated by the Food and Drug Administration. Always consult with a qualified healthcare professional before using any new skincare or aftercare product, especially if you have pre-existing medical conditions or are taking medications.</p>
              
              <h4>Allergy Warning</h4>
              <p>Please review all ingredients before use. If you have known allergies or sensitivities, perform a patch test on a small area of skin before full application. If you experience any adverse reactions including but not limited to redness, itching, swelling, or irritation, discontinue use immediately and consult a physician.</p>
              
              <h4>Limitation of Liability</h4>
              <p>Dream Tattoo Company and Blue Dream Budder are not responsible for any adverse reactions, damages, or injuries resulting from product use or misuse. By purchasing and using this product, you acknowledge that you have read and understood these terms and agree to use the product at your own risk and in accordance with provided instructions.</p>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
              <p>© ${currentYear} Dream Tattoo Company. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send invoice email
    const emailResponse = await resend.emails.send({
      from: "Blue Dream Budder <orders@updates.bluedreambudder.com>",
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
