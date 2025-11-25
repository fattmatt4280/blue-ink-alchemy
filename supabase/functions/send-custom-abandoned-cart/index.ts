import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomAbandonedCartRequest {
  email: string;
  customerName?: string;
  orderId?: string;
  cartItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  originalTotal: number;
  discountPercent: number;
  discountCode: string;
  healaidTrialDays: number;
}

const generateUniqueCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      customerName,
      orderId,
      cartItems,
      originalTotal,
      discountPercent,
      discountCode,
      healaidTrialDays,
    }: CustomAbandonedCartRequest = await req.json();

    console.log("Processing custom abandoned cart email for:", email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate HealAid activation code
    let activationCode: string;
    let codeExists = true;

    while (codeExists) {
      activationCode = generateUniqueCode();
      const { data } = await supabase
        .from('healaid_activation_codes')
        .select('code')
        .eq('code', activationCode)
        .maybeSingle();
      codeExists = !!data;
    }

    // Calculate expiration (90 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 90);

    // Insert activation code into database
    const { error: insertError } = await supabase
      .from('healaid_activation_codes')
      .insert({
        code: activationCode!,
        duration_days: healaidTrialDays,
        tier: 'trial',
        email: email,
        code_expiration_date: expirationDate.toISOString(),
        redeemed: false,
      });

    if (insertError) {
      console.error("Error inserting activation code:", insertError);
      throw new Error("Failed to generate HealAid trial code");
    }

    console.log("Generated HealAid activation code:", activationCode);

    // Create or get abandoned cart record
    const { data: existingCart } = await supabase
      .from('abandoned_carts')
      .select('id')
      .eq('email', email)
      .eq('converted', false)
      .maybeSingle();

    let cartId = existingCart?.id;
    
    if (!cartId) {
      const { data: newCart, error: cartError } = await supabase
        .from('abandoned_carts')
        .insert({
          email,
          cart_items: cartItems,
          cart_value: originalTotal,
          converted: false
        })
        .select('id')
        .single();

      if (cartError || !newCart) {
        console.error('Error creating abandoned cart:', cartError);
      } else {
        cartId = newCart.id;
      }
    }

    console.log('Cart ID for restoration:', cartId);

    // Calculate discount
    const discountAmount = originalTotal * (discountPercent / 100);
    const newTotal = originalTotal - discountAmount;

    // Create Stripe checkout session
    let stripeCheckoutUrl = '';
    
    try {
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (stripeSecretKey) {
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2023-10-16',
        });

        // Get or create Stripe customer
        const customers = await stripe.customers.list({ email, limit: 1 });
        let customerId = customers.data[0]?.id;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email,
            name: customerName || undefined,
          });
          customerId = customer.id;
        }

        // Create line items with discount pre-applied
        const lineItems = cartItems.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round((item.price * (1 - discountPercent / 100)) * 100),
          },
          quantity: item.quantity,
        }));

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: `https://bluedreambudder.com/checkout?success=true`,
          cancel_url: `https://bluedreambudder.com/checkout?cancelled=true`,
          metadata: {
            discount_code: discountCode,
            healaid_code: activationCode!,
            cart_id: cartId || '',
          },
        });

        stripeCheckoutUrl = session.url || '';
        console.log('Created Stripe session:', session.id);
      }
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      // Continue without Stripe link
    }

    // Generate cart restoration URL
    const cartRestoreUrl = cartId 
      ? `https://bluedreambudder.com/checkout?restore=${cartId}&discount=${discountCode}`
      : `https://bluedreambudder.com/shop`;

    // Build cart items HTML
    const cartItemsHtml = cartItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.name} x ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const firstName = customerName?.split(' ')[0] || 'there';

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Dream Tattoo Company <onboarding@resend.dev>",
      to: [email],
      subject: `🎁 ${firstName}, Your Cart Awaits + FREE ${healaidTrialDays}-Day HealAid Trial!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Your Cart Is Waiting! 🎁</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi ${firstName}!</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                We noticed you left some amazing items in your cart. We'd love to help you complete your order! 
              </p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">Your Cart Items:</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  ${cartItemsHtml}
                  <tr>
                    <td style="padding: 15px 10px 10px 10px; font-size: 14px; color: #888;">
                      Original Total:
                    </td>
                    <td style="padding: 15px 10px 10px 10px; text-align: right; text-decoration: line-through; color: #888;">
                      $${originalTotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 10px; font-weight: bold; color: #27ae60; font-size: 16px;">
                      ${discountPercent}% OFF:
                    </td>
                    <td style="padding: 5px 10px; text-align: right; font-weight: bold; color: #27ae60; font-size: 16px;">
                      -$${discountAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 10px 15px 10px; font-weight: bold; font-size: 20px; border-top: 2px solid #667eea; color: #667eea;">
                      New Total:
                    </td>
                    <td style="padding: 5px 10px 15px 10px; text-align: right; font-weight: bold; font-size: 20px; border-top: 2px solid #667eea; color: #667eea;">
                      $${newTotal.toFixed(2)}
                    </td>
                  </tr>
                </table>

                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 20px; border-radius: 4px;">
                  <p style="margin: 0; font-weight: bold; color: #856404;">Use code at checkout:</p>
                  <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #856404; letter-spacing: 2px;">${discountCode}</p>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 22px;">🎉 BONUS: FREE ${healaidTrialDays}-Day HealAid Trial!</h2>
                <p style="margin: 10px 0; font-size: 16px;">
                  Track your tattoo healing progress with our AI-powered Heal-AId system!
                </p>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 6px; margin-top: 15px;">
                  <p style="margin: 0 0 5px 0; font-size: 14px; opacity: 0.9;">Your activation code:</p>
                  <p style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 2px;">${activationCode}</p>
                </div>
              </div>

              ${stripeCheckoutUrl ? `
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <h3 style="margin: 0 0 10px 0; font-size: 22px;">⚡ One-Click Checkout Available!</h3>
                <p style="margin: 0; font-size: 16px;">Your ${discountPercent}% discount is already applied. Just click below to complete your order instantly!</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${stripeCheckoutUrl || cartRestoreUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 48px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  ${stripeCheckoutUrl ? `🛒 Complete My Order - ${discountPercent}% OFF Applied!` : '🛍️ Complete My Order'}
                </a>
                ${stripeCheckoutUrl ? `
                <p style="margin-top: 20px;">
                  <a href="${cartRestoreUrl}" style="color: #667eea; text-decoration: underline; font-size: 14px;">
                    Or click here to view/modify your cart before checkout
                  </a>
                </p>
                ` : `
                <p style="margin-top: 16px; font-size: 14px; color: #7f8c8d;">
                  Use code <strong style="color: #e74c3c; font-size: 16px;">${discountCode}</strong> at checkout
                </p>
                `}
              </div>

              <div style="background: #fff3cd; border-radius: 6px; padding: 15px; margin-top: 25px; text-align: center;">
                <p style="margin: 0; color: #856404; font-weight: bold;">⏰ Offer expires in 48 hours</p>
              </div>

              <p style="font-size: 14px; color: #888; margin-top: 30px; text-align: center;">
                Questions? Reply to this email or visit our <a href="https://bluedreambudder.com/contact" style="color: #667eea;">contact page</a>.
              </p>
            </div>

            <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
              <p>Dream Tattoo Company | Premium Tattoo Aftercare</p>
              <p>You received this email because you left items in your cart.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Custom abandoned cart email sent successfully",
        activationCode: activationCode!,
        discountCode,
        newTotal: newTotal.toFixed(2),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-custom-abandoned-cart function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
