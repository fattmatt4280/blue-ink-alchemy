import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReminderSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
}

export const useReminderSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all reminder settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["reminder-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_settings")
        .select("*");

      if (error) throw error;
      return data as ReminderSetting[];
    },
  });

  // Get a specific setting value
  const getSetting = (key: string) => {
    return settings?.find((s) => s.setting_key === key);
  };

  // Update a setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: any;
    }) => {
      const { error } = await supabase
        .from("reminder_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
      toast({
        title: "Settings updated",
        description: "Reminder settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get statistics
  const { data: stats } = useQuery({
    queryKey: ["reminder-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count reminders sent today
      const { count: sentToday } = await supabase
        .from("shipment_reminders")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent")
        .gte("sent_at", today.toISOString());

      // Count pending reminders
      const { count: pending } = await supabase
        .from("shipment_reminders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Count stalled shipments (not updated in 3+ days, not delivered)
      const stalledThreshold = new Date();
      stalledThreshold.setDate(stalledThreshold.getDate() - 3);

      const { count: stalled } = await supabase
        .from("shipments")
        .select("*", { count: "exact", head: true })
        .lt("updated_at", stalledThreshold.toISOString())
        .neq("tracking_status", "DELIVERED")
        .neq("tracking_status", "RETURNED");

      return {
        sentToday: sentToday || 0,
        pending: pending || 0,
        stalled: stalled || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    settings,
    isLoading,
    getSetting,
    updateSetting: updateSettingMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
    stats,
  };
};
