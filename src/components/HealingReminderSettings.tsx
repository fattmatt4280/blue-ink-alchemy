import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReminderPreferences } from "@/hooks/useReminderPreferences";
import { Loader2 } from "lucide-react";

interface HealingReminderSettingsProps {
  userId: string;
}

export function HealingReminderSettings({ userId }: HealingReminderSettingsProps) {
  const { preferences, isLoading, updatePreferences, isUpdating } = useReminderPreferences(userId);
  
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState("");
  const [quietEnd, setQuietEnd] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [reminderTypes, setReminderTypes] = useState({
    clean: true,
    moisturize: true,
    upload_photo: true,
    check_symptoms: true,
    avoid_activity: true,
  });

  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.email_enabled);
      setPushEnabled(preferences.push_enabled);
      setQuietStart(preferences.quiet_hours_start || "");
      setQuietEnd(preferences.quiet_hours_end || "");
      setTimezone(preferences.timezone);
      setReminderTypes(preferences.reminder_types);
    }
  }, [preferences]);

  const handleSave = () => {
    updatePreferences({
      email_enabled: emailEnabled,
      push_enabled: pushEnabled,
      quiet_hours_start: quietStart || null,
      quiet_hours_end: quietEnd || null,
      timezone,
      reminder_types: reminderTypes,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Healing Reminder Settings</CardTitle>
        <CardDescription>
          Customize how and when you receive healing aftercare reminders
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Notification Methods */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders via email
              </p>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4">
          <div>
            <Label>Quiet Hours</Label>
            <p className="text-sm text-muted-foreground mb-2">
              No notifications during these hours
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-start" className="text-xs">Start</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quiet-end" className="text-xs">End</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reminder Types */}
        <div className="space-y-4">
          <Label>Reminder Types</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">🧼 Cleaning Reminders</span>
              <Switch
                checked={reminderTypes.clean}
                onCheckedChange={(checked) =>
                  setReminderTypes({ ...reminderTypes, clean: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">💧 Moisturizing Reminders</span>
              <Switch
                checked={reminderTypes.moisturize}
                onCheckedChange={(checked) =>
                  setReminderTypes({ ...reminderTypes, moisturize: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">📸 Photo Upload Reminders</span>
              <Switch
                checked={reminderTypes.upload_photo}
                onCheckedChange={(checked) =>
                  setReminderTypes({ ...reminderTypes, upload_photo: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">⚕️ Symptom Checks</span>
              <Switch
                checked={reminderTypes.check_symptoms}
                onCheckedChange={(checked) =>
                  setReminderTypes({ ...reminderTypes, check_symptoms: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">🚫 Activity Warnings</span>
              <Switch
                checked={reminderTypes.avoid_activity}
                onCheckedChange={(checked) =>
                  setReminderTypes({ ...reminderTypes, avoid_activity: checked })
                }
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
