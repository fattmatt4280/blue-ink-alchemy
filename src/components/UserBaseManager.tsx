import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Users, TrendingUp, Calendar, Activity, ChevronDown, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface UserData {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_activity?: string;
  total_events?: number;
  orders_count?: number;
  healing_sessions?: number;
  has_subscription?: boolean;
}

interface UserStats {
  total_users: number;
  new_this_week: number;
  new_this_month: number;
}

interface ActivityEvent {
  event_type: string;
  created_at: string;
  event_data: any;
}

export const UserBaseManager = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats>({ total_users: 0, new_this_week: 0, new_this_month: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userActivity, setUserActivity] = useState<Record<string, ActivityEvent[]>>({});
  const { toast } = useToast();

  const fetchUserStats = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at');

    if (error) {
      console.error('Error fetching user stats:', error);
      return;
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newThisWeek = data.filter(u => new Date(u.created_at) > weekAgo).length;
    const newThisMonth = data.filter(u => new Date(u.created_at) > monthAgo).length;

    setStats({
      total_users: data.length,
      new_this_week: newThisWeek,
      new_this_month: newThisMonth
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch activity counts
      const { data: activities, error: activitiesError } = await supabase
        .from('analytics_events')
        .select('user_id, created_at');

      // Fetch order counts
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id');

      // Fetch healing sessions
      const { data: healingSessions, error: healingError } = await supabase
        .from('healing_progress')
        .select('user_id');

      // Fetch subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('healyn_subscriptions')
        .select('user_id, is_active');

      // Combine all data
      const enrichedUsers: UserData[] = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const userActivities = activities?.filter(a => a.user_id === profile.id) || [];
        const userOrders = orders?.filter(o => o.user_id === profile.id) || [];
        const userHealing = healingSessions?.filter(h => h.user_id === profile.id) || [];
        const userSub = subscriptions?.find(s => s.user_id === profile.id && s.is_active);
        
        const lastActivity = userActivities.length > 0
          ? userActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : undefined;

        return {
          id: profile.id,
          email: profile.email || 'No email',
          role: userRole?.role || 'user',
          created_at: profile.created_at,
          last_activity: lastActivity,
          total_events: userActivities.length,
          orders_count: userOrders.length,
          healing_sessions: userHealing.length,
          has_subscription: !!userSub
        };
      }) || [];

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userId: string) => {
    if (userActivity[userId]) return; // Already fetched

    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, created_at, event_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching user activity:', error);
      return;
    }

    setUserActivity(prev => ({ ...prev, [userId]: data || [] }));
  };

  const handleExpandUser = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      fetchUserActivity(userId);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchUsers(), fetchUserStats()]);
    toast({
      title: "Refreshed",
      description: "User data has been updated"
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new_this_week}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new_this_month}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Base</CardTitle>
              <CardDescription>Manage and monitor all registered users</CardDescription>
            </div>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">Loading users...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">No users found</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <Collapsible key={user.id} asChild open={expandedUser === user.id}>
                      <>
                        <TableRow>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {user.last_activity 
                              ? format(new Date(user.last_activity), 'MMM d, yyyy')
                              : 'No activity'
                            }
                          </TableCell>
                          <TableCell>{user.total_events || 0}</TableCell>
                          <TableCell>{user.orders_count || 0}</TableCell>
                          <TableCell>
                            <Badge variant={user.has_subscription ? 'default' : 'outline'}>
                              {user.has_subscription ? 'Active' : 'None'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExpandUser(user.id)}
                              >
                                <Activity className="h-4 w-4 mr-2" />
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedUser === user.id ? 'rotate-180' : ''}`} />
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/50">
                              <div className="p-4">
                                <h4 className="font-semibold mb-3">Recent Activity</h4>
                                <ScrollArea className="h-[200px]">
                                  {userActivity[user.id]?.length > 0 ? (
                                    <div className="space-y-2">
                                      {userActivity[user.id].map((activity, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm">
                                          <Badge variant="outline" className="shrink-0">
                                            {activity.event_type}
                                          </Badge>
                                          <span className="text-muted-foreground">
                                            {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No recent activity</p>
                                  )}
                                </ScrollArea>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
