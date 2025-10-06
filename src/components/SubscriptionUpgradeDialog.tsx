import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface SubscriptionUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freeTrialProduct: { id: string; name: string; price: number; image_url: string | null } | null;
  sevenDayProduct: { id: string; name: string; price: number; image_url: string | null } | null;
  thirtyDayProduct: { id: string; name: string; price: number; image_url: string | null } | null;
}

const SubscriptionUpgradeDialog = ({
  open,
  onOpenChange,
  freeTrialProduct,
  sevenDayProduct,
  thirtyDayProduct,
}: SubscriptionUpgradeDialogProps) => {
  const { items, addToCart, removeFromCart } = useCart();
  const [selectedTier, setSelectedTier] = useState<'free' | '7day' | '30day'>('free');

  const hasFreeTrial = freeTrialProduct && items.some(item => item.id === freeTrialProduct.id);
  const hasSevenDay = sevenDayProduct && items.some(item => item.id === sevenDayProduct.id);
  const hasThirtyDay = thirtyDayProduct && items.some(item => item.id === thirtyDayProduct.id);

  const handleUpgrade = (tier: '7day' | '30day') => {
    // Remove current subscription products from cart
    if (freeTrialProduct && hasFreeTrial) {
      removeFromCart(freeTrialProduct.id);
    }
    if (sevenDayProduct && hasSevenDay) {
      removeFromCart(sevenDayProduct.id);
    }
    if (thirtyDayProduct && hasThirtyDay) {
      removeFromCart(thirtyDayProduct.id);
    }

    // Add the selected tier
    if (tier === '7day' && sevenDayProduct) {
      addToCart(sevenDayProduct);
      setSelectedTier('7day');
    } else if (tier === '30day' && thirtyDayProduct) {
      addToCart(thirtyDayProduct);
      setSelectedTier('30day');
    }
  };

  const handleKeepFreeTrial = () => {
    // Remove any upgrades, keep only free trial
    if (sevenDayProduct && hasSevenDay) {
      removeFromCart(sevenDayProduct.id);
    }
    if (thirtyDayProduct && hasThirtyDay) {
      removeFromCart(thirtyDayProduct.id);
    }
    
    // Ensure free trial is in cart
    if (freeTrialProduct && !hasFreeTrial) {
      addToCart(freeTrialProduct);
    }
    setSelectedTier('free');
  };

  const handleContinue = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade Your Heal-AId Trial?</DialogTitle>
          <DialogDescription>
            Your order includes a free 3-day trial. Upgrade now for extended access to AI-powered healing analysis!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Free Trial Option */}
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTier === 'free' || hasFreeTrial && !hasSevenDay && !hasThirtyDay
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={handleKeepFreeTrial}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  3-Day Free Trial
                  {(selectedTier === 'free' || (hasFreeTrial && !hasSevenDay && !hasThirtyDay)) && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Included FREE with your order
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    AI-powered photo analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Healing progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Basic recommendations
                  </li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">FREE</p>
              </div>
            </div>
          </div>

          {/* 7-Day Upgrade */}
          {sevenDayProduct && (
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedTier === '7day' || hasSevenDay
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleUpgrade('7day')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    7-Day Upgrade
                    {(selectedTier === '7day' || hasSevenDay) && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                    <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">POPULAR</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Extended healing guidance
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Everything in Free Trial
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      7 days of unlimited analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Advanced healing insights
                    </li>
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${sevenDayProduct.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">one-time</p>
                </div>
              </div>
            </div>
          )}

          {/* 30-Day Upgrade */}
          {thirtyDayProduct && (
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedTier === '30day' || hasThirtyDay
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleUpgrade('30day')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    30-Day Pro Upgrade
                    {(selectedTier === '30day' || hasThirtyDay) && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded">BEST VALUE</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete healing journey support
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Everything in 7-Day
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      30 days of expert AI guidance
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Personalized healing timeline
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Product recommendations
                    </li>
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${thirtyDayProduct.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">one-time</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={handleContinue}>
            Continue to Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionUpgradeDialog;

