import { HealingReminder } from "@/hooks/useHealingReminders";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Clock, CheckCircle, Bell } from "lucide-react";

interface ReminderNotificationCardProps {
  reminder: HealingReminder;
  onComplete: (id: string) => void;
  onSnooze: (id: string, hours: number) => void;
  isLoading?: boolean;
}

const REMINDER_ICONS: Record<string, string> = {
  clean: "🧼",
  moisturize: "💧",
  upload_photo: "📸",
  check_symptoms: "⚕️",
  avoid_activity: "🚫",
};

export function ReminderNotificationCard({ 
  reminder, 
  onComplete, 
  onSnooze,
  isLoading 
}: ReminderNotificationCardProps) {
  const icon = REMINDER_ICONS[reminder.reminder_type] || "🔔";
  const scheduledDate = new Date(reminder.scheduled_for);
  const isOverdue = scheduledDate < new Date();

  return (
    <Card className={`${isOverdue ? "border-orange-500" : "border-primary"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              {reminder.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              {isOverdue ? (
                <span className="text-orange-600 font-medium">Overdue - {scheduledDate.toLocaleString()}</span>
              ) : (
                <span>Scheduled for {scheduledDate.toLocaleString()}</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{reminder.message}</p>

        <div className="flex gap-2">
          <Button 
            onClick={() => onComplete(reminder.id)}
            className="flex-1"
            disabled={isLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Done
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => onSnooze(reminder.id, 2)}
            disabled={isLoading}
          >
            <Bell className="mr-2 h-4 w-4" />
            Snooze 2h
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
