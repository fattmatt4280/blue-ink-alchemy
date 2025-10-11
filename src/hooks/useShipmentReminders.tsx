import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShipmentWithReminders {
  id: string;
  order_id: string;
  shippo_tracking_number: string;
  carrier: string;
  tracking_status: string;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  updated_at: string;
  orders: {
    id: string;
    email: string;
    shipping_info: any;
  };
  shipment_reminders: Array<{
    id: string;
    reminder_type: string;
    status: string;
    sent_at: string | null;
    scheduled_for: string;
  }>;
}

export const useShipmentReminders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all shipments with reminders
  const { data: shipments, isLoading } = useQuery({
    queryKey: ["shipments-with-reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select(`
          *,
          orders (
            id,
            email,
            shipping_info
          ),
          shipment_reminders (
            id,
            reminder_type,
            status,
            sent_at,
            scheduled_for
          )
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as ShipmentWithReminders[];
    },
  });

  // Send a reminder
  const sendReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { data, error } = await supabase.functions.invoke(
        "send-shipment-reminder",
        {
          body: { reminderId },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments-with-reminders"] });
      toast({
        title: "Reminder sent",
        description: "The shipment reminder email has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create a manual reminder
  const createReminderMutation = useMutation({
    mutationFn: async ({
      shipmentId,
      orderId,
      email,
      message,
    }: {
      shipmentId: string;
      orderId: string;
      email: string;
      message?: string;
    }) => {
      const { data, error } = await supabase
        .from("shipment_reminders")
        .insert({
          shipment_id: shipmentId,
          order_id: orderId,
          reminder_type: "custom",
          scheduled_for: new Date().toISOString(),
          email_recipient: email,
          status: "pending",
          message_template: message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shipments-with-reminders"] });
      // Automatically send the reminder
      sendReminderMutation.mutate(data.id);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Refresh tracking for a shipment
  const refreshTrackingMutation = useMutation({
    mutationFn: async (shipmentId: string) => {
      const shipment = shipments?.find((s) => s.id === shipmentId);
      if (!shipment) throw new Error("Shipment not found");

      const { data, error } = await supabase.functions.invoke("track-shipment", {
        body: { shipmentId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments-with-reminders"] });
      toast({
        title: "Tracking refreshed",
        description: "Shipment tracking information has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to refresh tracking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel a pending reminder
  const cancelReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("shipment_reminders")
        .update({ status: "cancelled" })
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments-with-reminders"] });
      toast({
        title: "Reminder cancelled",
        description: "The reminder has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel reminder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check for stalled shipments
  const checkStalledShipmentsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "check-stalled-shipments"
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shipments-with-reminders"] });
      toast({
        title: "Stalled shipments checked",
        description: `Found ${data.checked} shipments, created ${data.reminders_created} reminders.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to check stalled shipments",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    shipments,
    isLoading,
    sendReminder: sendReminderMutation.mutate,
    createReminder: createReminderMutation.mutate,
    refreshTracking: refreshTrackingMutation.mutate,
    cancelReminder: cancelReminderMutation.mutate,
    checkStalledShipments: checkStalledShipmentsMutation.mutate,
    isSendingReminder: sendReminderMutation.isPending,
    isCreatingReminder: createReminderMutation.isPending,
    isRefreshingTracking: refreshTrackingMutation.isPending,
    isCancellingReminder: cancelReminderMutation.isPending,
    isCheckingStalled: checkStalledShipmentsMutation.isPending,
  };
};
