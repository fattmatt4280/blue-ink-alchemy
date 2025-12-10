import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface HealingReminder {
  id: string;
  user_id: string;
  healing_progress_id: string;
  reminder_type: string;
  scheduled_for: string;
  sent_at: string | null;
  status: string;
  delivery_method: string;
  title: string;
  message: string;
  action_url: string | null;
  metadata: any;
  created_at: string;
}

export const useHealingReminders = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all reminders for user
  const { data: reminders, isLoading, refetch } = useQuery({
    queryKey: ["healing-reminders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("healing_reminders")
        .select("*")
        .eq("user_id", userId)
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data as HealingReminder[];
    },
    enabled: !!userId,
  });

  // Get upcoming reminders (not sent yet)
  const upcomingReminders = reminders?.filter(
    (r) => r.status === "pending" && new Date(r.scheduled_for) > new Date()
  );

  // Get overdue reminders (should have been sent but weren't)
  const overdueReminders = reminders?.filter(
    (r) => r.status === "pending" && new Date(r.scheduled_for) <= new Date()
  );

  // Get completed reminders (sent)
  const completedReminders = reminders?.filter((r) => r.status === "sent");

  // Snooze a reminder
  const snoozeReminderMutation = useMutation({
    mutationFn: async ({ reminderId, hours = 2 }: { reminderId: string; hours?: number }) => {
      const reminder = reminders?.find((r) => r.id === reminderId);
      if (!reminder) throw new Error("Reminder not found");

      const newScheduledTime = new Date(reminder.scheduled_for);
      newScheduledTime.setHours(newScheduledTime.getHours() + hours);

      const { error } = await supabase
        .from("healing_reminders")
        .update({
          scheduled_for: newScheduledTime.toISOString(),
          status: "snoozed",
        })
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healing-reminders"] });
      toast({
        title: "Reminder snoozed",
        description: "We'll remind you again later!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete/dismiss a reminder
  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("healing_reminders")
        .update({ status: "sent" })
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healing-reminders"] });
      toast({
        title: "Great job!",
        description: "Task completed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel a reminder
  const cancelReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("healing_reminders")
        .update({ status: "cancelled" })
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["healing-reminders"] });
      toast({
        title: "Reminder cancelled",
        description: "You won't receive this reminder.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    reminders,
    upcomingReminders,
    overdueReminders,
    completedReminders,
    isLoading,
    refetch,
    snoozeReminder: snoozeReminderMutation.mutate,
    completeReminder: completeReminderMutation.mutate,
    cancelReminder: cancelReminderMutation.mutate,
    isSnoozing: snoozeReminderMutation.isPending,
    isCompleting: completeReminderMutation.isPending,
  };
};
