import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReminderPreferences {
  id?: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  snooze_duration_hours: number;
  timezone: string;
  reminder_types: {
    clean: boolean;
    moisturize: boolean;
    upload_photo: boolean;
    check_symptoms: boolean;
    avoid_activity: boolean;
  };
}

export const useReminderPreferences = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["reminder-preferences", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_reminder_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      // If no preferences exist, return defaults
      if (error && error.code === "PGRST116") {
        return {
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          quiet_hours_start: null,
          quiet_hours_end: null,
          timezone: "America/New_York",
          snooze_duration_hours: 2,
          reminder_types: {
            clean: true,
            moisturize: true,
            upload_photo: true,
            check_symptoms: true,
            avoid_activity: true,
          },
        } as ReminderPreferences;
      }

      if (error) throw error;
      
      return {
        ...data,
        reminder_types: data.reminder_types as any as ReminderPreferences['reminder_types']
      } as ReminderPreferences;
    },
    enabled: !!userId,
  });

  // Update preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<ReminderPreferences>) => {
      // Check if preferences exist
      const { data: existing, error: existingError } = await supabase
        .from("user_reminder_preferences")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("user_reminder_preferences")
          .update(updates)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("user_reminder_preferences")
          .insert({ user_id: userId, ...updates });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-preferences"] });
      toast({
        title: "Preferences updated",
        description: "Your reminder settings have been saved.",
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
    preferences,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
};
