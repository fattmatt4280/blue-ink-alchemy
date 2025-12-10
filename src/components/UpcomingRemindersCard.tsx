import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Check, X, Droplets, Camera, AlertTriangle, Settings } from "lucide-react";
import { useHealingReminders } from "@/hooks/useHealingReminders";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface UpcomingRemindersCardProps {
  userId: string;
}

const REMINDER_ICONS: Record<string, React.ReactNode> = {
  clean: <Droplets className="w-4 h-4 text-blue-500" />,
  moisturize: <Droplets className="w-4 h-4 text-green-500" />,
  upload_photo: <Camera className="w-4 h-4 text-purple-500" />,
  check_symptoms: <AlertTriangle className="w-4 h-4 text-amber-500" />,
};

export function UpcomingRemindersCard({ userId }: UpcomingRemindersCardProps) {
  const navigate = useNavigate();
  const {
    upcomingReminders,
    isLoading,
    completeReminder,
    cancelReminder,
    isCompleting,
  } = useHealingReminders(userId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-5 h-5" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayReminders = upcomingReminders.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-5 h-5" />
            Upcoming Reminders
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard?tab=reminders")}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayReminders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming reminders</p>
            <p className="text-xs mt-1">
              Complete a healing analysis to set up reminders
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-background">
                    {REMINDER_ICONS[reminder.reminder_type] || (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
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
                    className="h-8 w-8"
                    onClick={() => completeReminder(reminder.id)}
                    disabled={isCompleting}
                  >
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => cancelReminder(reminder.id)}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
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
