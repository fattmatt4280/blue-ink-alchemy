import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, AlertTriangle, MessageSquare, Activity } from "lucide-react";
import { ArtistChatList } from "./ArtistChatList";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalClients: number;
  activeAlerts: number;
  unreadMessages: number;
  recentActivity: number;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  alert_title: string;
  status: string;
  created_at: string;
  client_name: string;
  client_user_id: string;
}

export const ArtistDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeAlerts: 0,
    unreadMessages: 0,
    recentActivity: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch total clients
        const { count: clientCount } = await supabase
          .from("client_artist_relationships" as any)
          .select("*", { count: "exact", head: true })
          .eq("artist_user_id", user.id)
          .eq("relationship_status", "active");

        // Fetch active alerts
        const { count: alertCount, data: alertsData } = await supabase
          .from("artist_alerts" as any)
          .select("*, profiles!artist_alerts_client_user_id_fkey(first_name, last_name, email)", { count: "exact" })
          .eq("artist_user_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        // Fetch recent activity (healing progress entries from clients)
        // TODO: Join with client_artist_relationships to get actual client activity
        const activityCount = 0;

        setStats({
          totalClients: clientCount || 0,
          activeAlerts: alertCount || 0,
          unreadMessages: 0, // TODO: Calculate from chat_messages
          recentActivity: activityCount || 0,
        });

        // Process alerts with client names
        const enrichedAlerts = (alertsData || []).map((alert: any) => ({
          id: alert.id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          alert_title: alert.alert_title,
          status: alert.status,
          created_at: alert.created_at,
          client_user_id: alert.client_user_id,
          client_name: alert.profiles?.first_name
            ? `${alert.profiles.first_name} ${alert.profiles.last_name || ""}`
            : alert.profiles?.email || "Unknown Client",
        }));

        setRecentAlerts(enrichedAlerts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Subscribe to real-time alerts
    const channel = supabase
      .channel("artist-dashboard")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "artist_alerts",
          filter: `artist_user_id=eq.${user.id}`,
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Artist Dashboard</h1>
        <p className="text-muted-foreground">Manage your clients and track healing progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {recentAlerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active alerts
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <Link
                      key={alert.id}
                      to={`/artist/clients/${alert.client_user_id}`}
                      className="block border rounded-lg p-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <p className="text-sm font-medium">{alert.client_name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.alert_title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages */}
        <ArtistChatList />
      </div>
    </div>
  );
};
