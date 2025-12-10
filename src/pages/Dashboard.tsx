import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, Clock, ArrowRight, History, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AppHeader from "@/components/AppHeader";
import { useHealAidSubscription } from "@/hooks/useHealAidSubscription";
import { DashboardWelcomeDialog } from "@/components/DashboardWelcomeDialog";
import { HealingInsightsDashboard } from "@/components/HealingInsightsDashboard";
import { UpcomingRemindersCard } from "@/components/UpcomingRemindersCard";
import { PushNotificationManager } from "@/components/PushNotificationManager";

interface Subscription {
  tier: string;
  expiration_date: string;
  is_active: boolean;
  user_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const subscriptionStatus = useHealAidSubscription();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

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
        // Show welcome dialog instead of redirecting
        setShowWelcomeDialog(true);
        setIsLoading(false);
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

  const handleActivateTrial = async () => {
    setIsActivating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in first");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke('start-free-trial', {
        body: { 
          email: user.email,
          userId: user.id 
        }
      });

      if (error) throw error;

      toast.success("Free trial activated! Check your email for your activation code.");
      setShowWelcomeDialog(false);
      
      // Refresh subscription data
      await checkSubscription();
    } catch (error: any) {
      console.error("Trial activation error:", error);
      toast.error(error.message || "Failed to activate trial");
    } finally {
      setIsActivating(false);
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
      
      <DashboardWelcomeDialog
        isOpen={showWelcomeDialog}
        onActivateTrial={handleActivateTrial}
        onViewPlans={() => setShowWelcomeDialog(false)}
        isActivating={isActivating}
      />
      
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

        {/* Upgrade Button */}
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => navigate("/plans")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          View Plans & Upgrade
        </Button>

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
              <span className="text-sm">
                {subscription?.tier === 'free_trial' ? 'Analyses Used' : 'Total Analyses'}
              </span>
              <span className="text-2xl font-bold">
                {subscription?.tier === 'free_trial' 
                  ? `${totalAnalyses}/1` 
                  : totalAnalyses}
              </span>
            </div>
            {(subscription?.tier === 'basic_weekly' || subscription?.tier === 'basic_monthly') && (
              <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
                Daily limit: 2 uploads per day
              </div>
            )}
            {(subscription?.tier === 'pro_weekly' || subscription?.tier === 'pro_monthly' || subscription?.tier === 'shop_monthly') && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Unlimited Access
              </div>
            )}
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

        {/* Healing Insights */}
        {totalAnalyses > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Healing Insights</CardTitle>
              <CardDescription>Analytics from your healing journey</CardDescription>
            </CardHeader>
            <CardContent>
              <HealingInsightsDashboard userId={subscription?.user_id} />
            </CardContent>
          </Card>
        )}

        {/* Upcoming Reminders */}
        {subscription?.user_id && (
          <UpcomingRemindersCard userId={subscription.user_id} />
        )}

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Enable push notifications to receive healing reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <PushNotificationManager />
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