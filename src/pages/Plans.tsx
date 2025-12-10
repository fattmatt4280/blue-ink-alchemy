import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, Clock, Crown, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AppHeader from "@/components/AppHeader";
import { useHealAidSubscription } from "@/hooks/useHealAidSubscription";

interface Subscription {
  tier: string;
  expiration_date: string;
  is_active: boolean;
  user_id: string;
}

const Plans = () => {
  const navigate = useNavigate();
  const subscriptionStatus = useHealAidSubscription();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("healaid_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
      }

      setSubscription(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to upgrade");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-healaid-upgrade', {
        body: { tier },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error(error.message || "Failed to start upgrade");
    }
  };

  if (isLoading || subscriptionStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading plans...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = subscriptionStatus.daysRemaining;
  const progressPercent = subscription ? Math.max(0, Math.min(100, (daysRemaining / 90) * 100)) : 0;

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      'free_trial': 'Free Trial',
      'basic_weekly': 'Basic Weekly',
      'basic_monthly': 'Basic Monthly',
      'pro_weekly': 'Pro Weekly',
      'pro_monthly': 'Pro Monthly',
      'shop_monthly': 'Shop / Artist'
    };
    return labels[tier] || tier.replace('_', ' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <AppHeader />
      
      <div className="p-4 md:p-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select the plan that fits your healing journey</p>
          </div>

          {/* Current Plan Summary */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Your Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">{getTierLabel(subscription.tier)}</p>
                      <p className="text-sm text-muted-foreground">
                        {daysRemaining > 0 
                          ? `Expires ${formatDistanceToNow(new Date(subscription.expiration_date), { addSuffix: true })}`
                          : 'Expired'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {daysRemaining > 0 ? daysRemaining : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">days remaining</p>
                    </div>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  
                  {/* Current Plan Benefits */}
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Your benefits:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {subscription.tier === 'free_trial' && (
                        <>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 1 analysis included</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> AI healing assessment</li>
                        </>
                      )}
                      {(subscription.tier === 'basic_weekly' || subscription.tier === 'basic_monthly') && (
                        <>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 2 uploads per day</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> AI summary view</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Product recommendations</li>
                        </>
                      )}
                      {(subscription.tier === 'pro_weekly' || subscription.tier === 'pro_monthly') && (
                        <>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Unlimited analyses</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Downloadable reports</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Medical documentation</li>
                        </>
                      )}
                      {subscription.tier === 'shop_monthly' && (
                        <>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Client dashboard</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Bulk QR activations</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Advanced analytics</li>
                        </>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">You don't have an active plan yet.</p>
                  <Button onClick={() => navigate('/activate')}>
                    Activate a Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Options */}
          <div className="space-y-6">
            {/* Basic Plans */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Basic Plans</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Basic Weekly</CardTitle>
                    <CardDescription>2 uploads/day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-3">$0.99<span className="text-sm font-normal text-muted-foreground">/week</span></p>
                    <ul className="text-sm space-y-2 mb-4 text-muted-foreground">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> AI summary view</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 7-day history</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Product recommendations</li>
                    </ul>
                    <Button className="w-full" onClick={() => handleUpgrade('basic_weekly')}>
                      Subscribe
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Basic Monthly</CardTitle>
                    <CardDescription>2 uploads/day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-3">$2.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <ul className="text-sm space-y-2 mb-4 text-muted-foreground">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> All Basic Weekly features</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 30-day history</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Better value</li>
                    </ul>
                    <Button className="w-full" onClick={() => handleUpgrade('basic_monthly')}>
                      Subscribe
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Pro Plans */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Pro Plans</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2 border-primary hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Pro Weekly</CardTitle>
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <CardDescription>Unlimited uploads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-3">$1.99<span className="text-sm font-normal text-muted-foreground">/week</span></p>
                    <ul className="text-sm space-y-2 mb-4 text-muted-foreground">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Unlimited analyses</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Downloadable reports</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Medical documentation</li>
                    </ul>
                    <Button className="w-full" onClick={() => handleUpgrade('pro_weekly')}>
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary hover:shadow-lg transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    Best Value
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Pro Monthly</CardTitle>
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <CardDescription>Unlimited uploads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-3">$4.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <ul className="text-sm space-y-2 mb-4 text-muted-foreground">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> All Pro Weekly features</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Custom aftercare planner</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Priority support</li>
                    </ul>
                    <Button className="w-full" onClick={() => handleUpgrade('pro_monthly')}>
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Studio Plan */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">For Professionals</h3>
              <Card className="border-2 border-accent hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Shop / Artist</CardTitle>
                  <CardDescription>Client management & analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-3">$24.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <ul className="text-sm space-y-2 mb-4 text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Client dashboard</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Bulk QR activations</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Studio branding</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Advanced analytics</li>
                  </ul>
                  <Button className="w-full" variant="secondary" onClick={() => handleUpgrade('shop_monthly')}>
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
