import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Activity, AlertTriangle, Clock } from "lucide-react";
import { HealingHistoryEntry, useHealingHistory } from "@/hooks/useHealingHistory";
import { HealingHistoryCard } from "./HealingHistoryCard";
import { toast } from "sonner";

interface ClientProfileViewProps {
  clientUserId: string;
  relationshipId: string;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  alert_title: string;
  alert_message: string;
  status: string;
  created_at: string;
}

export const ClientProfileView = ({ clientUserId, relationshipId }: ClientProfileViewProps) => {
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [artistNotes, setArtistNotes] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [savingNotes, setSavingNotes] = useState(false);
  
  const { data: healingHistory, isLoading: historyLoading } = useHealingHistory(clientUserId);

  useEffect(() => {
    const fetchClientData = async () => {
      // Fetch client profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clientUserId)
        .single();

      setClientProfile(profile);

      // Fetch relationship notes
      const { data: relationship } = await supabase
        .from("client_artist_relationships")
        .select("notes")
        .eq("id", relationshipId)
        .single();

      setArtistNotes(relationship?.notes || "");

      // Fetch alerts
      const { data: alertsData } = await supabase
        .from("artist_alerts")
        .select("*")
        .eq("client_user_id", clientUserId)
        .order("created_at", { ascending: false })
        .limit(20);

      setAlerts(alertsData || []);
    };

    fetchClientData();
  }, [clientUserId, relationshipId]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("client_artist_relationships")
        .update({ notes: artistNotes })
        .eq("id", relationshipId);

      if (error) throw error;
      toast.success("Notes saved successfully");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("artist_alerts")
        .update({
          status: "acknowledged",
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: "acknowledged" }
            : alert
        )
      );

      toast.success("Alert acknowledged");
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      toast.error("Failed to acknowledge alert");
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

  if (!clientProfile) {
    return <div>Loading client profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl">
                {clientProfile.first_name} {clientProfile.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">{clientProfile.email}</p>
            </div>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Client
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">
            <Activity className="w-4 h-4 mr-2" />
            Healing History
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="notes">
            <Clock className="w-4 h-4 mr-2" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healing Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {historyLoading ? (
                  <p className="text-muted-foreground">Loading history...</p>
                ) : healingHistory && healingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {healingHistory.map((entry) => (
                      <HealingHistoryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No healing history yet
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healing Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No alerts for this client
                  </p>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{alert.alert_title}</h3>
                              <Badge variant={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alert.alert_message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                          {alert.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Artist Notes (Private)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={artistNotes}
                onChange={(e) => setArtistNotes(e.target.value)}
                placeholder="Add private notes about this client..."
                className="min-h-[400px]"
              />
              <Button onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
