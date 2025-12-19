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

// Neon color definitions for the dashboard
const NEON_CYAN = "#00f5ff";
const NEON_BLUE = "#3b82f6";

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
      <div className="min-h-screen flex items-center justify-center futuristic-bg">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: NEON_CYAN }} />
          <p className="text-cyan-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = subscriptionStatus.daysRemaining;
  const isActive = subscriptionStatus.isActive;
  const progressPercent = subscription ? Math.max(0, Math.min(100, (daysRemaining / 90) * 100)) : 0;

  return (
    <div className="min-h-screen futuristic-bg relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="neon-orb large absolute top-20 left-10 animate-float-1" style={{ background: `radial-gradient(circle, rgba(0, 245, 255, 0.1) 0%, transparent 70%)` }} />
        <div className="neon-orb medium absolute top-40 right-20 animate-float-2" style={{ background: `radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)` }} />
        <div className="neon-orb small absolute bottom-40 left-1/4 animate-float-3" style={{ background: `radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)` }} />
        <div className="neon-orb medium absolute bottom-20 right-1/3 animate-float-4" style={{ background: `radial-gradient(circle, rgba(0, 245, 255, 0.08) 0%, transparent 70%)` }} />
      </div>
      
      <AppHeader />
      
      <DashboardWelcomeDialog
        isOpen={showWelcomeDialog}
        onActivateTrial={handleActivateTrial}
        onViewPlans={() => setShowWelcomeDialog(false)}
        isActivating={isActivating}
      />
      
      <div className="p-4 md:p-8 pt-24 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent cyber-text font-rajdhani tracking-wide">
            Heal-AId™ Dashboard
          </h1>
          <p className="text-cyan-300/70">powered by Blue Dream Budder</p>
        </div>

        {/* Subscription Status Card */}
        <Card className="neon-card bg-slate-900/80 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <Clock className="w-5 h-5" style={{ color: NEON_CYAN }} />
              Your Access Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription && daysRemaining > 0 ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-cyan-100">
                    <span>Time Remaining</span>
                    <span className="font-semibold" style={{ color: NEON_CYAN, textShadow: `0 0 10px ${NEON_CYAN}` }}>
                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progressPercent}%`,
                        background: `linear-gradient(90deg, ${NEON_CYAN}, ${NEON_BLUE})`,
                        boxShadow: `0 0 20px ${NEON_CYAN}80`
                      }}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                  <p className="text-sm text-cyan-100">
                    Your {subscription.tier.replace('_', ' ')} access expires{' '}
                    {formatDistanceToNow(new Date(subscription.expiration_date), { addSuffix: true })}
                  </p>
                </div>

                {daysRemaining <= 2 && subscription.tier === 'free_trial' && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg" style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)' }}>
                    <p className="text-sm font-medium text-amber-400">
                      Your trial is ending soon! Upgrade now to continue using Heal-AId.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg" style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}>
                <p className="text-sm font-medium text-red-400">
                  Your access has expired. Please upgrade to continue using Heal-AId.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Button */}
        <Button 
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/30 text-white font-semibold"
          style={{ boxShadow: `0 0 20px ${NEON_CYAN}40` }}
          onClick={() => navigate("/plans")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          View Plans & Upgrade
        </Button>

        {/* Usage Summary */}
        <Card className="neon-card bg-slate-900/80 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <History className="w-5 h-5" style={{ color: NEON_CYAN }} />
              Your Healing Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
              <span className="text-sm text-cyan-100">
                {subscription?.tier === 'free_trial' ? 'Analyses Used' : 'Total Analyses'}
              </span>
              <span 
                className="text-3xl font-bold font-rajdhani"
                style={{ color: NEON_CYAN, textShadow: `0 0 20px ${NEON_CYAN}` }}
              >
                {subscription?.tier === 'free_trial' 
                  ? `${totalAnalyses}/1` 
                  : totalAnalyses}
              </span>
            </div>
            {(subscription?.tier === 'basic_weekly' || subscription?.tier === 'basic_monthly') && (
              <div className="text-xs text-cyan-300/70 p-3 bg-slate-800/30 rounded border border-cyan-500/10">
                Daily limit: 2 uploads per day
              </div>
            )}
            {(subscription?.tier === 'pro_weekly' || subscription?.tier === 'pro_monthly' || subscription?.tier === 'shop_monthly') && (
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{ 
                  background: `linear-gradient(135deg, ${NEON_CYAN}20, ${NEON_BLUE}20)`,
                  borderColor: `${NEON_CYAN}40`,
                  color: NEON_CYAN,
                  boxShadow: `0 0 15px ${NEON_CYAN}30`
                }}
              >
                <Sparkles className="w-4 h-4" />
                Unlimited Access
              </div>
            )}
            {isActive && daysRemaining > 0 ? (
              <p className="text-sm text-cyan-300/70">
                Your Heal-AId is active - track your healing progress now!
              </p>
            ) : (
              <p className="text-sm text-cyan-300/70">
                Your access has expired, but you can still view your healing history and upgrade anytime.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Healing Insights */}
        {totalAnalyses > 0 && (
          <Card className="neon-card bg-slate-900/80 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">Healing Insights</CardTitle>
              <CardDescription className="text-cyan-300/60">Analytics from your healing journey</CardDescription>
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
        <Card className="neon-card bg-slate-900/80 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <Bell className="w-5 h-5" style={{ color: NEON_CYAN }} />
              Notification Settings
            </CardTitle>
            <CardDescription className="text-cyan-300/60">Enable push notifications to receive healing reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <PushNotificationManager />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="neon-card bg-slate-900/80 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-300">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isActive && daysRemaining > 0 && (
              <Button
                className="w-full justify-between bg-slate-800/50 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50"
                variant="outline"
                onClick={() => navigate("/healing-tracker")}
              >
                Open Heal-AId Tracker
                <ArrowRight className="w-4 h-4" style={{ color: NEON_CYAN }} />
              </Button>
            )}
            <Button
              className="w-full justify-between bg-slate-800/50 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50"
              variant="outline"
              onClick={() => navigate("/healing-history")}
            >
              View Healing History
              <ArrowRight className="w-4 h-4" style={{ color: NEON_CYAN }} />
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;