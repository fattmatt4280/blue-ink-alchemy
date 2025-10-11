import { useState, useEffect } from "react";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Mail, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ReminderSettingsPanel = () => {
  const { settings, isLoading, getSetting, updateSetting, isUpdating, stats } =
    useReminderSettings();

  const [autoRemindersEnabled, setAutoRemindersEnabled] = useState(true);
  const [stalledDays, setStalledDays] = useState(3);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");

  useEffect(() => {
    if (settings) {
      const autoSetting = getSetting("auto_reminders_enabled");
      const stalledSetting = getSetting("stalled_shipment_days");
      const templateSetting = getSetting("reminder_email_template");

      if (autoSetting) {
        setAutoRemindersEnabled(autoSetting.setting_value.enabled);
      }
      if (stalledSetting) {
        setStalledDays(stalledSetting.setting_value.days);
      }
      if (templateSetting) {
        setEmailSubject(templateSetting.setting_value.subject || "");
        setEmailTemplate(templateSetting.setting_value.template || "");
      }
    }
  }, [settings]);

  const handleSaveSettings = () => {
    updateSetting({
      key: "auto_reminders_enabled",
      value: { enabled: autoRemindersEnabled },
    });

    updateSetting({
      key: "stalled_shipment_days",
      value: { days: stalledDays },
    });

    updateSetting({
      key: "reminder_email_template",
      value: { subject: emailSubject, template: emailTemplate },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Sent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.sentToday || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Stalled Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{stats?.stalled || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Reminder Settings
          </CardTitle>
          <CardDescription>
            Configure automatic reminder rules and email templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Reminders Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reminders">Enable Automatic Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send reminders for stalled shipments
              </p>
            </div>
            <Switch
              id="auto-reminders"
              checked={autoRemindersEnabled}
              onCheckedChange={setAutoRemindersEnabled}
            />
          </div>

          {/* Stalled Shipment Threshold */}
          <div className="space-y-2">
            <Label htmlFor="stalled-days">Stalled Shipment Threshold (Days)</Label>
            <Input
              id="stalled-days"
              type="number"
              min="1"
              max="30"
              value={stalledDays}
              onChange={(e) => setStalledDays(parseInt(e.target.value))}
              disabled={!autoRemindersEnabled}
            />
            <p className="text-sm text-muted-foreground">
              Send reminder if shipment hasn't updated in this many days
            </p>
          </div>

          {/* Email Template */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Email Subject</Label>
              <Input
                id="email-subject"
                placeholder="Update on Your Order"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-template">Email Template</Label>
              <Textarea
                id="email-template"
                placeholder="Your order is on the way! Track it here: {tracking_url}"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                rows={6}
              />
              <p className="text-sm text-muted-foreground">
                Available variables: {"{tracking_url}"}, {"{customer_name}"}, {"{tracking_number}"}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSaveSettings} disabled={isUpdating} className="w-full">
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderSettingsPanel;
