import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Check, X, Droplets, Camera, AlertTriangle, Settings, Play, Loader2 } from "lucide-react";
import { useHealingReminders } from "@/hooks/useHealingReminders";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Neon colors
const NEON_CYAN = "#00f5ff";
const NEON_BLUE = "#3b82f6";
const NEON_PURPLE = "#8b5cf6";
const NEON_GREEN = "#22c55e";
const NEON_AMBER = "#fbbf24";

interface UpcomingRemindersCardProps {
  userId: string;
}

const REMINDER_ICONS: Record<string, React.ReactNode> = {
  clean: <Droplets className="w-4 h-4" style={{ color: NEON_BLUE }} />,
  moisturize: <Droplets className="w-4 h-4" style={{ color: NEON_GREEN }} />,
  upload_photo: <Camera className="w-4 h-4" style={{ color: NEON_PURPLE }} />,
  check_symptoms: <AlertTriangle className="w-4 h-4" style={{ color: NEON_AMBER }} />,
};

export function UpcomingRemindersCard({ userId }: UpcomingRemindersCardProps) {
  const navigate = useNavigate();
  const [isTesting, setIsTesting] = useState(false);
  const {
    upcomingReminders,
    isLoading,
    completeReminder,
    cancelReminder,
    isCompleting,
    refetch,
  } = useHealingReminders(userId);

  const handleTestReminder = async () => {
    if (upcomingReminders.length === 0) {
      toast.error("No pending reminders to test");
      return;
    }

    const nextReminder = upcomingReminders[0];
    setIsTesting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-healing-reminder', {
        body: { reminderId: nextReminder.id }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Test reminder sent! Check your ${nextReminder.delivery_method === 'email' ? 'email' : 'notifications'}.`);
        refetch();
      } else {
        throw new Error(data?.error || 'Failed to send test reminder');
      }
    } catch (error: any) {
      console.error("Test reminder error:", error);
      toast.error(error.message || "Failed to send test reminder");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="neon-card bg-slate-900/80 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-cyan-300">
            <Bell className="w-5 h-5" style={{ color: NEON_CYAN }} />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-12 bg-slate-800/50 animate-pulse rounded-lg border border-cyan-500/10" />
            <div className="h-12 bg-slate-800/50 animate-pulse rounded-lg border border-cyan-500/10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayReminders = upcomingReminders.slice(0, 5);

  return (
    <Card className="neon-card bg-slate-900/80 border-cyan-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-cyan-300">
            <Bell className="w-5 h-5" style={{ color: NEON_CYAN }} />
            Upcoming Reminders
          </CardTitle>
          <div className="flex items-center gap-1">
            {displayReminders.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestReminder}
                disabled={isTesting}
                className="text-xs bg-slate-800/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50"
              >
                {isTesting ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" style={{ color: NEON_CYAN }} />
                ) : (
                  <Play className="w-3 h-3 mr-1" style={{ color: NEON_CYAN }} />
                )}
                Test
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard?tab=reminders")}
              className="text-cyan-300 hover:bg-cyan-500/20"
            >
              <Settings className="w-4 h-4" style={{ color: NEON_CYAN }} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayReminders.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: `${NEON_CYAN}50` }} />
            <p className="text-sm text-cyan-300/70">No upcoming reminders</p>
            <p className="text-xs mt-1 text-cyan-300/50">
              Complete a healing analysis to set up reminders
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-cyan-500/20"
                style={{ boxShadow: `0 0 10px ${NEON_CYAN}08` }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-full border"
                    style={{ 
                      background: 'rgba(15, 23, 42, 0.8)',
                      borderColor: `${NEON_CYAN}30`
                    }}
                  >
                    {REMINDER_ICONS[reminder.reminder_type] || (
                      <Bell className="w-4 h-4" style={{ color: NEON_CYAN }} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cyan-100">{reminder.title}</p>
                    <p className="text-xs flex items-center gap-1 text-cyan-300/60">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(reminder.scheduled_for), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-green-500/20"
                    onClick={() => completeReminder(reminder.id)}
                    disabled={isCompleting}
                  >
                    <Check className="w-4 h-4" style={{ color: NEON_GREEN }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-500/20"
                    onClick={() => cancelReminder(reminder.id)}
                  >
                    <X className="w-4 h-4 text-cyan-300/50" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}