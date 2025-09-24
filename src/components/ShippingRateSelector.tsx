import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    console.log("=== SHIPPING RATE SELECTOR DEBUG ===");
    console.log("Received shippingAddress:", JSON.stringify(shippingAddress, null, 2));
    console.log("Cart items:", JSON.stringify(cartItems, null, 2));
    
    // Check each field individually with detailed logging
    const fields = {
      street1: shippingAddress.street1,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zip,
      name: shippingAddress.name
    };
    
    console.log("Field values:", fields);
    
    const missingFields = Object.entries(fields)
      .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.log("Address validation failed - missing required fields:", missingFields);
      setRates([]);
      setError("");
      return;
    }
    
    console.log("Address validation passed - fetching rates...");

    setLoading(true);
    setError("");
    
    try {
      console.log("Calling supabase function with payload:");
      const payload = {
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
      };
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const { data, error } = await supabase.functions.invoke('get-shipping-rates', {
        body: payload
      });

      console.log("Supabase function response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }

      if (data?.success && data?.rates) {
        console.log("=== SHIPPING RATES SUCCESS ===");
        console.log("Rates received:", data.rates);
        console.log("Number of rates:", data.rates.length);
        
        setRates(data.rates);
        // Auto-select the cheapest rate
        if (data.rates.length > 0 && !selectedRate) {
          console.log("Auto-selecting cheapest rate:", data.rates[0]);
          onRateSelected(data.rates[0]);
        }
      } else {
        console.log("=== SHIPPING RATES ERROR RESPONSE ===");
        console.log("Response data:", data);
        const errorMsg = data?.error || "Failed to get shipping rates";
        console.error("Setting error:", errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("=== SHIPPING RATES CATCH ERROR ===");
      console.error("Error object:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch shipping rates";
      console.error("Final error message:", errorMessage);
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
        <div className="space-y-4">
          <Select
            value={selectedRate?.id || ""}
            onValueChange={(value) => {
              const rate = rates.find(r => r.id === value);
              if (rate && !disabled) {
                onRateSelected(rate);
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a shipping option" />
            </SelectTrigger>
            <SelectContent>
              {rates.map((rate) => (
                <SelectItem key={rate.id} value={rate.id}>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCarrierName(rate.carrier)} {rate.service_level}
                      </span>
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rate.estimated_days ? `${rate.estimated_days} days` : 'Varies'}
                      </span>
                    </div>
                    <span className="font-bold">${rate.amount.toFixed(2)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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