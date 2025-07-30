import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Truck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShippingRate {
  id: string;
  carrier: string;
  service_level: string;
  amount: number;
  currency: string;
  estimated_days: number;
  duration_terms?: string;
}

interface ShippingRateSelectorProps {
  cartItems: any[];
  shippingAddress: {
    name: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  onRateSelected: (rate: ShippingRate) => void;
  selectedRate?: ShippingRate;
  disabled?: boolean;
}

const ShippingRateSelector = ({ 
  cartItems, 
  shippingAddress, 
  onRateSelected, 
  selectedRate,
  disabled = false
}: ShippingRateSelectorProps) => {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchShippingRates = async () => {
    if (!shippingAddress.street1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const { data, error } = await supabase.functions.invoke('get-shipping-rates', {
        body: {
          cartItems: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            weight: 0.5 // Default weight per item in lbs
          })),
          toAddress: {
            name: shippingAddress.name,
            street1: shippingAddress.street1,
            street2: shippingAddress.street2 || "",
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zip,
            country: shippingAddress.country || "US",
            phone: shippingAddress.phone || "",
            email: shippingAddress.email || ""
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success && data?.rates) {
        setRates(data.rates);
        // Auto-select the cheapest rate
        if (data.rates.length > 0 && !selectedRate) {
          onRateSelected(data.rates[0]);
        }
      } else {
        throw new Error(data?.error || "Failed to get shipping rates");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch shipping rates";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingRates();
  }, [shippingAddress.street1, shippingAddress.city, shippingAddress.state, shippingAddress.zip]);

  const formatCarrierName = (carrier: string) => {
    switch (carrier.toLowerCase()) {
      case 'usps': return 'USPS';
      case 'ups': return 'UPS';
      case 'fedex': return 'FedEx';
      default: return carrier.toUpperCase();
    }
  };

  const getCarrierColor = (carrier: string) => {
    switch (carrier.toLowerCase()) {
      case 'usps': return 'text-blue-600';
      case 'ups': return 'text-amber-600';
      case 'fedex': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Getting Shipping Rates...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Calculating shipping options...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Truck className="w-5 h-5" />
            Shipping Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchShippingRates} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (rates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Enter your complete shipping address to see available shipping options.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rates.map((rate) => (
          <div
            key={rate.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedRate?.id === rate.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onRateSelected(rate)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold ${getCarrierColor(rate.carrier)}`}>
                    {formatCarrierName(rate.carrier)}
                  </span>
                  <span className="text-gray-600">{rate.service_level}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    {rate.estimated_days ? `${rate.estimated_days} business days` : 'Delivery time varies'}
                  </span>
                </div>
                {rate.duration_terms && (
                  <p className="text-xs text-gray-400 mt-1">{rate.duration_terms}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${rate.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{rate.currency.toUpperCase()}</p>
              </div>
            </div>
          </div>
        ))}
        
        {rates.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              * Shipping rates are calculated in real-time based on your location and package weight.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingRateSelector;