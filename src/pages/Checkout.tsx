
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus, Trash2, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ShippingRateSelector from "@/components/ShippingRateSelector";
import SubscriptionUpgradeDialog from "@/components/SubscriptionUpgradeDialog";

const Checkout = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    state: 'CA', // Default to CA
  });
  const [selectedShippingRate, setSelectedShippingRate] = useState<any>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [subscriptionProducts, setSubscriptionProducts] = useState<{
    freeTrial: any | null;
    sevenDay: any | null;
    thirtyDay: any | null;
  }>({ freeTrial: null, sevenDay: null, thirtyDay: null });

  // Fetch subscription products
  useEffect(() => {
    const fetchSubscriptionProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('name', ['Heal-AId 3-Day Free Trial', 'Heal-AId 7-Day Upgrade', 'Heal-AId 30-Day Upgrade']);
      
      if (data) {
        setSubscriptionProducts({
          freeTrial: data.find(p => p.name.includes('3-Day')) || null,
          sevenDay: data.find(p => p.name.includes('7-Day')) || null,
          thirtyDay: data.find(p => p.name.includes('30-Day')) || null,
        });
      }
    };
    fetchSubscriptionProducts();
  }, []);

  useEffect(() => {
    if (success === 'true') {
      toast.success("Order completed successfully!");
      clearCart();
    } else if (cancelled === 'true') {
      toast.info("Order was cancelled.");
    }
  }, [success, cancelled]); // Removed clearCart from dependencies to prevent infinite loop

  const subtotal = getTotalPrice();
  const shipping = selectedShippingRate ? selectedShippingRate.amount : 0;

  const handleCompleteOrder = async () => {
    console.log("=== STARTING CHECKOUT PROCESS ===");
    
    // Validate shipping info
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'zipCode'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]?.trim());
    
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (items.length === 0) {
      console.log("Cart is empty");
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    toast.info("Creating checkout session...");
    
    try {
      console.log("=== PREPARING FUNCTION CALL ===");
      console.log("Items to send:", items);
      console.log("Shipping info:", shippingInfo);

      // Validate shipping rate is selected
      if (!selectedShippingRate) {
        toast.error("Please select a shipping option");
        return;
      }

      // Prepare the payload
      const payload = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image_url: item.image_url || null
        })),
        shippingInfo: {
          firstName: String(shippingInfo.firstName).trim(),
          lastName: String(shippingInfo.lastName).trim(),
          email: String(shippingInfo.email).trim().toLowerCase(),
          address: String(shippingInfo.address).trim(),
          city: String(shippingInfo.city).trim(), 
          zipCode: String(shippingInfo.zipCode).trim(),
          state: String(shippingInfo.state).trim()
        },
        shippingRate: {
          id: selectedShippingRate.id,
          carrier: selectedShippingRate.carrier,
          service_level: selectedShippingRate.service_level,
          amount: selectedShippingRate.amount,
          currency: selectedShippingRate.currency,
          estimated_days: selectedShippingRate.estimated_days
        }
      };

      console.log("=== CALLING CREATE-PAYMENT FUNCTION ===");
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: payload
      });

      console.log("=== FUNCTION RESPONSE ===");
      console.log("Response data:", data);
      console.log("Response error:", error);

      if (error) {
        console.error("Supabase function error:", error);
        toast.error(`Checkout failed: ${error.message || 'Function call failed'}`);
        return;
      }

      if (data?.error) {
        console.error("Payment function returned error:", data.error);
        toast.error(`Payment error: ${data.error}`);
        return;
      }

      if (data?.url) {
        console.log("SUCCESS - Redirecting to Stripe checkout");
        console.log("Stripe URL:", data.url);
        
        // Show progress message
        toast.success("Redirecting to Stripe checkout...");
        
        // Simple, reliable redirect
        window.location.href = data.url;
      } else {
        console.error("No URL returned from payment function", data);
        toast.error("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (field: keyof typeof shippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  if (success === 'true') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AppHeader showCart={false} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-green-800">Order Completed!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order! You'll receive an email confirmation shortly with your order details and tracking information.
            </p>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cancelled === 'true') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AppHeader showCart={false} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4 text-orange-800">Order Cancelled</h1>
            <p className="text-gray-600 mb-8">
              Your order was cancelled. No charges were made. 
              You can try again anytime!
            </p>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AppHeader showCart={false} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-8">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some products to your cart to get started!</p>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AppHeader showCart={false} />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cart Items */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Your Items</h2>
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img 
                        src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=100&h=100&fit=crop&crop=center"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-lg font-bold text-blue-600">${item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 text-red-600 hover:text-red-700"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Shipping Information & Checkout Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="First Name" 
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                    <Input 
                      placeholder="Last Name" 
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <Input 
                    placeholder="Email" 
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  <Input 
                    placeholder="Address" 
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                   <div className="grid grid-cols-3 gap-4">
                     <Input 
                       placeholder="City" 
                       value={shippingInfo.city}
                       onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                       required
                     />
                     <select
                       value={shippingInfo.state}
                       onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                       className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       required
                     >
                        <option value="">State</option>
                        <option value="AL">AL</option>
                        <option value="AR">AR</option>
                        <option value="AZ">AZ</option>
                        <option value="CA">CA</option>
                        <option value="CO">CO</option>
                        <option value="CT">CT</option>
                        <option value="DC">DC</option>
                        <option value="DE">DE</option>
                        <option value="FL">FL</option>
                        <option value="GA">GA</option>
                        <option value="IA">IA</option>
                        <option value="ID">ID</option>
                        <option value="IL">IL</option>
                        <option value="IN">IN</option>
                        <option value="KS">KS</option>
                        <option value="KY">KY</option>
                        <option value="LA">LA</option>
                        <option value="MA">MA</option>
                        <option value="MD">MD</option>
                        <option value="ME">ME</option>
                        <option value="MI">MI</option>
                        <option value="MN">MN</option>
                        <option value="MO">MO</option>
                        <option value="MS">MS</option>
                        <option value="MT">MT</option>
                        <option value="NC">NC</option>
                        <option value="ND">ND</option>
                        <option value="NE">NE</option>
                        <option value="NH">NH</option>
                        <option value="NJ">NJ</option>
                        <option value="NM">NM</option>
                        <option value="NV">NV</option>
                        <option value="NY">NY</option>
                        <option value="OH">OH</option>
                        <option value="OK">OK</option>
                        <option value="OR">OR</option>
                        <option value="PA">PA</option>
                        <option value="RI">RI</option>
                        <option value="SC">SC</option>
                        <option value="SD">SD</option>
                        <option value="TN">TN</option>
                        <option value="TX">TX</option>
                        <option value="UT">UT</option>
                        <option value="VA">VA</option>
                        <option value="VT">VT</option>
                        <option value="WA">WA</option>
                        <option value="WI">WI</option>
                        <option value="WV">WV</option>
                        <option value="WY">WY</option>
                     </select>
                     <Input 
                       placeholder="ZIP Code" 
                       value={shippingInfo.zipCode}
                       onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                       required
                     />
                   </div>
                </CardContent>
               </Card>

               {/* Shipping Rate Selector */}
               {shippingInfo.firstName && shippingInfo.lastName && shippingInfo.address && 
                shippingInfo.city && shippingInfo.state && shippingInfo.zipCode && (
                 <ShippingRateSelector
                   cartItems={items}
                   shippingAddress={{
                     name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                     street1: shippingInfo.address,
                     city: shippingInfo.city,
                     state: shippingInfo.state,
                     zip: shippingInfo.zipCode,
                     email: shippingInfo.email
                   }}
                   onRateSelected={setSelectedShippingRate}
                   selectedRate={selectedShippingRate}
                   disabled={loading}
                 />
               )}

               {/* Subscription Upgrade Section */}
               {selectedShippingRate && items.some(item => item.name.includes('Heal-AId')) && (
                 <Card className="border-primary/50 bg-primary/5">
                   <CardHeader>
                     <CardTitle className="text-lg">Heal-AId Subscription</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                       Your order includes Heal-AId access. Want to extend your trial?
                     </p>
                     <Button 
                       onClick={() => setUpgradeDialogOpen(true)}
                       variant="outline"
                       className="w-full"
                     >
                       View Upgrade Options
                     </Button>
                   </CardContent>
                 </Card>
               )}

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between">
                     <span>Shipping:</span>
                     <span className="font-semibold">
                       {selectedShippingRate 
                         ? `$${selectedShippingRate.amount.toFixed(2)}` 
                         : 'Select shipping method'
                       }
                     </span>
                   </div>
                   {selectedShippingRate && (
                     <div className="text-sm text-gray-600">
                       {selectedShippingRate.carrier.toUpperCase()} - {selectedShippingRate.service_level}
                       {selectedShippingRate.estimated_days && 
                         ` (${selectedShippingRate.estimated_days} business days)`
                       }
                     </div>
                   )}
                   <div className="border-t pt-4">
                     <div className="flex justify-between text-lg font-bold">
                       <span>Total:</span>
                       <span>${(subtotal + shipping).toFixed(2)}</span>
                     </div>
                     <p className="text-sm text-gray-500 mt-2">
                       Final total and taxes will be calculated by Stripe
                     </p>
                   </div>
                </CardContent>
              </Card>

               <div className="space-y-4">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  size="lg"
                  onClick={handleCompleteOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Order with Stripe"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearCart}
                  disabled={loading}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Upgrade Dialog */}
      <SubscriptionUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        freeTrialProduct={subscriptionProducts.freeTrial}
        sevenDayProduct={subscriptionProducts.sevenDay}
        thirtyDayProduct={subscriptionProducts.thirtyDay}
      />
    </div>
  );
};

export default Checkout;
