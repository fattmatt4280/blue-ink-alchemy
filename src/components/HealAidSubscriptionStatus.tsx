import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Subscription {
  tier: string;
  expiration_date: string;
  is_active: boolean;
}

const HealAidSubscriptionStatus = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("healaid_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSubscription(data);

        const now = new Date();
        const expiry = new Date(data.expiration_date);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysRemaining(diffDays);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // No subscription or not logged in
  if (!subscription) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Activate Heal-AId to get expert AI guidance on your tattoo healing journey.{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto" 
            onClick={() => navigate("/activate")}
          >
            Activate now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Subscription expired
  if (daysRemaining <= 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your Heal-AId access has expired.{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto text-destructive" 
            onClick={() => navigate("/dashboard")}
          >
            Upgrade to continue
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial ending soon (1 day free trial)
  if (daysRemaining <= 1 && subscription.tier === 'free_trial') {
    return (
      <Card className="mb-4 border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                Your 1-day trial expires soon! Only {daysRemaining < 1 ? 'hours' : '1 day'} remaining
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Upgrade now for unlimited access to AI-powered healing analysis
              </p>
              <Button 
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                View Plans - Starting at $0.99/week
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active subscription
  return (
    <Card className="mb-4 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Heal-AId {subscription.tier.replace('_', ' ')} • {daysRemaining} days remaining
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealAidSubscriptionStatus;