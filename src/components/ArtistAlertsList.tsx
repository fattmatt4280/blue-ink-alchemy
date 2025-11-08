import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Alert {
  id: string;
  client_user_id: string;
  alert_type: string;
  severity: string;
  alert_title: string;
  alert_message: string;
  status: string;
  risk_factors: any;
  artist_notes?: string;
  created_at: string;
  client_name: string;
}

export const ArtistAlertsList = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<"pending" | "acknowledged" | "resolved">("pending");
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from("artist_alerts")
        .select("*, profiles!artist_alerts_client_user_id_fkey(first_name, last_name, email)")
        .eq("artist_user_id", user.id)
        .eq("status", filter)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching alerts:", error);
        setLoading(false);
        return;
      }

      const enrichedAlerts = (data || []).map((alert: any) => ({
        ...alert,
        client_name: alert.profiles?.first_name
          ? `${alert.profiles.first_name} ${alert.profiles.last_name || ""}`
          : alert.profiles?.email || "Unknown Client",
      }));

      setAlerts(enrichedAlerts);
      setLoading(false);
    };

    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("artist-alerts-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "artist_alerts",
          filter: `artist_user_id=eq.${user.id}`,
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, filter]);

  const handleUpdateAlert = async (alertId: string, status: string, notes?: string) => {
    try {
      const updates: any = {
        status,
        ...(status === "acknowledged" && { acknowledged_at: new Date().toISOString() }),
        ...(status === "resolved" && { resolved_at: new Date().toISOString() }),
        ...(notes && { artist_notes: notes }),
      };

      const { error } = await supabase
        .from("artist_alerts")
        .update(updates)
        .eq("id", alertId);

      if (error) throw error;

      toast.success(`Alert ${status}`);
      setSelectedAlert(null);
      setNotes("");
    } catch (error) {
      console.error("Error updating alert:", error);
      toast.error("Failed to update alert");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Client Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-4">
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <p className="text-muted-foreground text-center py-8">Loading alerts...</p>
                ) : alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No {filter} alerts
                  </p>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.alert_type.replace(/_/g, " ")}</Badge>
                              <Link
                                to={`/artist/clients/${alert.client_user_id}`}
                                className="text-sm font-medium hover:underline"
                              >
                                {alert.client_name}
                              </Link>
                            </div>
                            <h3 className="font-semibold">{alert.alert_title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {alert.alert_message}
                            </p>
                            {alert.risk_factors && Array.isArray(alert.risk_factors) && (
                              <div className="flex flex-wrap gap-1">
                                {alert.risk_factors.map((factor: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                            {alert.artist_notes && (
                              <div className="mt-2 p-2 bg-muted rounded">
                                <p className="text-xs font-medium">Your Notes:</p>
                                <p className="text-sm">{alert.artist_notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {filter === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAlert(alert);
                                    setNotes(alert.artist_notes || "");
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Acknowledge
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAlert(alert);
                                    setNotes(alert.artist_notes || "");
                                  }}
                                >
                                  Resolve
                                </Button>
                              </>
                            )}
                            {filter === "acknowledged" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateAlert(alert.id, "resolved")}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </div>

                        {selectedAlert?.id === alert.id && (
                          <div className="space-y-3 border-t pt-3">
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add notes about this alert..."
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  handleUpdateAlert(
                                    alert.id,
                                    filter === "pending" ? "acknowledged" : "resolved",
                                    notes
                                  )
                                }
                              >
                                Save & {filter === "pending" ? "Acknowledge" : "Resolve"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedAlert(null);
                                  setNotes("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
