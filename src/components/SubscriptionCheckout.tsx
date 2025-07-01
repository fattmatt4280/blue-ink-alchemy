
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Crown, User, UserPlus } from "lucide-react";

interface SubscriptionCheckoutProps {
  productId: string;
  productName: string;
  originalPrice: number;
  onClose: () => void;
}

const SubscriptionCheckout = ({ productId, productName, originalPrice, onClose }: SubscriptionCheckoutProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [isGuest, setIsGuest] = useState(!user);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const subscriptionPrice = originalPrice * 0.95; // 5% discount
  const savings = originalPrice - subscriptionPrice;

  const handleSubscriptionCheckout = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (isGuest && (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address)) {
      toast.error("Please fill in all required shipping information");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          productId,
          email,
          isGuest,
          shippingInfo: isGuest ? shippingInfo : null,
        },
        headers: user ? {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        } : {},
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        onClose();
      }
    } catch (error) {
      console.error('Subscription checkout error:', error);
      toast.error("Failed to create subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscribe & Save 5%
          </CardTitle>
          <p className="text-blue-100">Monthly delivery of {productName}</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Pricing Display */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Regular Price:</span>
              <span className="text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Subscription Price:</span>
              <span className="text-2xl font-bold text-green-600">${subscriptionPrice.toFixed(2)}/month</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-700">You Save:</span>
              <span className="font-semibold text-green-700">${savings.toFixed(2)} every month!</span>
            </div>
          </div>

          {/* Account vs Guest Options */}
          <div className="space-y-4">
            {!user ? (
              <div className="space-y-4">
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-3 mb-3">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Create Account (Recommended)</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Create an account to easily manage your subscription, view order history, and update your preferences.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Create Account & Subscribe
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox 
                      checked={isGuest} 
                      onCheckedChange={(checked) => setIsGuest(checked as boolean)}
                      id="guest-checkout"
                    />
                    <label htmlFor="guest-checkout" className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Continue as Guest
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Logged in as:</span>
                </div>
                <p className="text-blue-700">{user.email}</p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          {(isGuest || !user) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {isGuest && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Shipping Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name *</label>
                      <Input
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name *</label>
                      <Input
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address *</label>
                    <Input
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <Input
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                      <Input
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubscriptionCheckout}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Subscribe for $${subscriptionPrice.toFixed(2)}/month`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionCheckout;
