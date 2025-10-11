import { HealingReminder } from "@/hooks/useHealingReminders";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface HealingReminderTimelineProps {
  reminders: HealingReminder[];
}

const REMINDER_ICONS: Record<string, string> = {
  clean: "🧼",
  moisturize: "💧",
  upload_photo: "📸",
  check_symptoms: "⚕️",
  avoid_activity: "🚫",
};

export function HealingReminderTimeline({ reminders }: HealingReminderTimelineProps) {
  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Healing Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {sortedReminders.map((reminder, index) => {
            const isCompleted = reminder.status === "sent";
            const isFailed = reminder.status === "failed";
            const isPending = reminder.status === "pending";
            const scheduledDate = new Date(reminder.scheduled_for);
            const isPast = scheduledDate < new Date();

            return (
              <div key={reminder.id} className="relative pl-12">
                {/* Status Icon */}
                <div className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ${
                  isCompleted ? "bg-green-500" : 
                  isFailed ? "bg-red-500" : 
                  isPast ? "bg-orange-500" : 
                  "bg-gray-300"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : isFailed ? (
                    <XCircle className="h-4 w-4 text-white" />
                  ) : (
                    <Clock className="h-4 w-4 text-white" />
                  )}
                </div>

                <div className="pt-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{REMINDER_ICONS[reminder.reminder_type] || "🔔"}</span>
                    <span className="font-medium">{reminder.title}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {reminder.message.substring(0, 100)}...
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString()}</span>
                    <Badge variant={isCompleted ? "default" : isPast ? "destructive" : "secondary"}>
                      {isCompleted ? "Completed" : isFailed ? "Failed" : isPast ? "Overdue" : "Upcoming"}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}

          {sortedReminders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No reminders scheduled yet. Upload a photo to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
