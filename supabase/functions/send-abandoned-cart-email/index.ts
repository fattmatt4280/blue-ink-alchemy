import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface AbandonedCartEmailRequest {
  email: string;
  cartItems: CartItem[];
  cartValue: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, cartItems, cartValue }: AbandonedCartEmailRequest = await req.json();

    console.log(`Sending abandoned cart email to: ${email}`);

    const discountAmount = (cartValue * 0.1).toFixed(2);
    const finalPrice = (cartValue * 0.9).toFixed(2);

    const cartItemsHtml = cartItems.map(item => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">` : ''}
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <span style="color: #666;">Quantity: ${item.quantity}</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Order - 10% Off!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">You Left Something Behind! 🛒</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Complete your order and save 10%</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hi there! 👋
                      </p>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        We noticed you left some items in your cart. Don't worry, we've saved them for you! 
                        As a special thank you, we'd like to offer you <strong>10% off</strong> your entire order.
                      </p>

                      <!-- Discount Code Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; text-align: center;">
                            <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Exclusive Code</p>
                            <p style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">CART10</p>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">10% off your order</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Cart Items -->
                      <h2 style="color: #333; font-size: 20px; margin: 0 0 20px 0;">Your Cart Items:</h2>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin: 0 0 20px 0;">
                        ${cartItemsHtml}
                        <tr>
                          <td colspan="2" style="padding: 20px; text-align: right; background-color: #f9f9f9;">
                            <strong style="font-size: 16px; color: #333;">Subtotal:</strong>
                          </td>
                          <td style="padding: 20px; text-align: right; background-color: #f9f9f9;">
                            <strong style="font-size: 16px; color: #333;">$${cartValue.toFixed(2)}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 15px 20px; text-align: right; background-color: #f0f9ff; border-top: 2px solid #667eea;">
                            <span style="font-size: 16px; color: #667eea;"><strong>Your Discount (10%):</strong></span>
                          </td>
                          <td style="padding: 15px 20px; text-align: right; background-color: #f0f9ff; border-top: 2px solid #667eea;">
                            <span style="font-size: 16px; color: #667eea;"><strong>-$${discountAmount}</strong></span>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 20px; text-align: right; background-color: #fafafa;">
                            <strong style="font-size: 18px; color: #333;">New Total:</strong>
                          </td>
                          <td style="padding: 20px; text-align: right; background-color: #fafafa;">
                            <strong style="font-size: 20px; color: #667eea;">$${finalPrice}</strong>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="https://bluedreambudder.com/checkout" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                              Complete My Order →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                        This offer is valid for 48 hours. Your cart items are reserved.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                      <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
                        Dream Tattoo Company<br>
                        Premium Tattoo Aftercare Products
                      </p>
                      <p style="color: #999; font-size: 12px; margin: 0;">
                        Questions? <a href="https://bluedreambudder.com/contact" style="color: #667eea; text-decoration: none;">Contact us</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Dream Tattoo Company <onboarding@resend.dev>",
      to: [email],
      subject: "🎁 Complete Your Order - Enjoy 10% Off!",
      html: emailHtml,
    });

    console.log("Abandoned cart email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-abandoned-cart-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
