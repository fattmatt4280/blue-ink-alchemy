import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Gift, Sparkles } from 'lucide-react';

interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export const CustomAbandonedCartManager = () => {
  const [email, setEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [discountCode, setDiscountCode] = useState('COMEBACK10');
  const [healaidDays, setHealaidDays] = useState('3');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!email || !productName || !productPrice) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const price = parseFloat(productPrice);
      const qty = parseInt(quantity);
      const cartItems: CartItem[] = [{
        name: productName,
        quantity: qty,
        price: price,
      }];

      const originalTotal = price * qty;

      const { data, error } = await supabase.functions.invoke('send-custom-abandoned-cart', {
        body: {
          email,
          customerName: customerName || undefined,
          cartItems,
          originalTotal,
          discountPercent: parseInt(discountPercent),
          discountCode,
          healaidTrialDays: parseInt(healaidDays),
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent successfully! 🎉",
        description: `Sent to ${email} with ${discountPercent}% discount and ${healaidDays}-day HealAid trial`,
      });

      // Log the activation code
      console.log('Generated activation code:', data.activationCode);

      // Reset form
      setEmail('');
      setCustomerName('');
      setProductName('');
      setProductPrice('');
      setQuantity('1');
    } catch (error: any) {
      console.error('Error sending custom abandoned cart email:', error);
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Custom Abandoned Cart Recovery
        </CardTitle>
        <CardDescription>
          Send personalized abandoned cart emails with discount codes and HealAid trial offers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Customer Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product Name *</Label>
            <Input
              id="product"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Blue Dream Budder 8oz"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Product Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="45.36"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Gift className="w-4 h-4" />
              Offer Details
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Discount Code</Label>
                <Input
                  id="code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="COMEBACK10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healaid" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                HealAid Trial Days
              </Label>
              <Input
                id="healaid"
                type="number"
                min="1"
                max="30"
                value={healaidDays}
                onChange={(e) => setHealaidDays(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSendEmail} 
            disabled={sending}
            className="w-full"
          >
            {sending ? 'Sending...' : 'Send Custom Abandoned Cart Email'}
          </Button>
        </div>

        {productPrice && quantity && discountPercent && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium">Preview:</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Original Total:</span>
                <span className="line-through">${(parseFloat(productPrice) * parseInt(quantity)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>{discountPercent}% Discount:</span>
                <span>-${((parseFloat(productPrice) * parseInt(quantity)) * (parseInt(discountPercent) / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>New Total:</span>
                <span>${((parseFloat(productPrice) * parseInt(quantity)) * (1 - parseInt(discountPercent) / 100)).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t text-primary">
                <Sparkles className="w-4 h-4" />
                <span>+ {healaidDays}-day HealAid trial included</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
