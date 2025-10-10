import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, Clock, ArrowRight, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AppHeader from "@/components/AppHeader";
import { useHealAidSubscription } from "@/hooks/useHealAidSubscription";

interface Subscription {
  tier: string;
  expiration_date: string;
  is_active: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const subscriptionStatus = useHealAidSubscription();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
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

      if (!data) {
        toast.error("No subscription found. Please activate first.");
        navigate("/activate");
        return;
      }

      setSubscription(data);

      // Fetch total analyses count
      const { count } = await supabase
        .from('healing_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setTotalAnalyses(count || 0);
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
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = subscriptionStatus.daysRemaining;
  const isActive = subscriptionStatus.isActive;
  const progressPercent = subscription ? Math.max(0, Math.min(100, (daysRemaining / 90) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <AppHeader />
      <div className="p-4 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Heal-AId Dashboard</h1>
          <p className="text-muted-foreground">powered by Blue Dream Budder</p>
        </div>

        {/* Subscription Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Your Access Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription && daysRemaining > 0 ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time Remaining</span>
                    <span className="font-semibold">
                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    Your {subscription.tier.replace('_', ' ')} access expires{' '}
                    {formatDistanceToNow(new Date(subscription.expiration_date), { addSuffix: true })}
                  </p>
                </div>

                {daysRemaining <= 2 && subscription.tier === 'free_trial' && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      Your trial is ending soon! Upgrade now to continue using Heal-AId.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive">
                  Your access has expired. Please upgrade to continue using Heal-AId.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        <Card>
          <CardHeader>
            <CardTitle>Extend Your Access</CardTitle>
            <CardDescription>
              Choose a plan that works for you
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">7 Days</CardTitle>
                <CardDescription>Perfect for quick healing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">$0.99</p>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade('7_days')}
                >
                  Extend <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">30 Days</CardTitle>
                <CardDescription>Most popular choice</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">$2.99</p>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade('30_days')}
                >
                  Extend <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">90 Days Pro</CardTitle>
                <CardDescription>Best value for healing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">$7.99</p>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade('90_days')}
                >
                  Upgrade <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent">
              <CardHeader>
                <CardTitle className="text-lg">Studio Unlimited</CardTitle>
                <CardDescription>For tattoo professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">$39.99<span className="text-sm font-normal">/mo</span></p>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => handleUpgrade('studio')}
                >
                  Subscribe <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Usage Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Your Healing Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-sm">Total Analyses Performed</span>
              <span className="text-2xl font-bold">{totalAnalyses}</span>
            </div>
            {isActive && daysRemaining > 0 ? (
              <p className="text-sm text-muted-foreground">
                Your Heal-AId is active - track your healing progress now!
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your access has expired, but you can still view your healing history and upgrade anytime.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isActive && daysRemaining > 0 && (
              <Button
                className="w-full justify-between"
                variant="outline"
                onClick={() => navigate("/healing-tracker")}
              >
                Open Heal-AId Tracker
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button
              className="w-full justify-between"
              variant="outline"
              onClick={() => navigate("/healing-history")}
            >
              View Healing History
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;