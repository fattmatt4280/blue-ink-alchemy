import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Droplets, Camera, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReminderOptInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  healingProgressId: string;
  tattooAge: number;
  userName?: string;
}

export function ReminderOptInDialog({
  open,
  onOpenChange,
  userId,
  healingProgressId,
  tattooAge,
  userName,
}: ReminderOptInDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reminderTypes, setReminderTypes] = useState({
    clean: true,
    moisturize: true,
    upload_photo: true,
    check_symptoms: false,
  });

  const handleEnableReminders = async () => {
    setIsSubmitting(true);
    try {
      // Save user preferences
      const { error: prefsError } = await supabase
        .from("user_reminder_preferences")
        .upsert({
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          reminder_types: reminderTypes,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

      if (prefsError) throw prefsError;

      // Generate reminders
      const { error: genError } = await supabase.functions.invoke(
        "generate-healing-reminders",
        {
          body: {
            userId,
            healingProgressId,
            tattooAge,
            userName,
          },
        }
      );

      if (genError) throw genError;

      toast({
        title: "Reminders enabled!",
        description: "You'll receive notifications to help with your aftercare routine.",
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error enabling reminders:", error);
      toast({
        title: "Failed to enable reminders",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Enable Healing Reminders?
          </DialogTitle>
          <DialogDescription>
            Get timely notifications to help you stay on track with your tattoo aftercare routine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <Label htmlFor="clean" className="text-sm font-medium">
                Cleaning reminders
              </Label>
            </div>
            <Switch
              id="clean"
              checked={reminderTypes.clean}
              onCheckedChange={(checked) =>
                setReminderTypes((prev) => ({ ...prev, clean: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Droplets className="w-4 h-4 text-green-500" />
              </div>
              <Label htmlFor="moisturize" className="text-sm font-medium">
                Moisturizing reminders
              </Label>
            </div>
            <Switch
              id="moisturize"
              checked={reminderTypes.moisturize}
              onCheckedChange={(checked) =>
                setReminderTypes((prev) => ({ ...prev, moisturize: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Camera className="w-4 h-4 text-purple-500" />
              </div>
              <Label htmlFor="photo" className="text-sm font-medium">
                Progress photo reminders
              </Label>
            </div>
            <Switch
              id="photo"
              checked={reminderTypes.upload_photo}
              onCheckedChange={(checked) =>
                setReminderTypes((prev) => ({ ...prev, upload_photo: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/10">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <Label htmlFor="symptoms" className="text-sm font-medium">
                Symptom check reminders
              </Label>
            </div>
            <Switch
              id="symptoms"
              checked={reminderTypes.check_symptoms}
              onCheckedChange={(checked) =>
                setReminderTypes((prev) => ({ ...prev, check_symptoms: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Maybe Later
          </Button>
          <Button onClick={handleEnableReminders} disabled={isSubmitting}>
            {isSubmitting ? "Enabling..." : "Enable Reminders"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
