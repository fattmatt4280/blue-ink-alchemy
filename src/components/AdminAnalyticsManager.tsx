import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Eye, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

interface OrderHistory {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: string | null;
  notes: string | null;
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
  page_url: string | null;
  session_id: string | null;
}

export const AdminAnalyticsManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchAnalyticsEvents()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
    setOrders(data || []);
  };

  const fetchOrderHistory = async (orderId: string) => {
    const { data, error } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("changed_at", { ascending: false });

    if (error) {
      console.error("Error fetching order history:", error);
      return;
    }
    setOrderHistory(data || []);
  };

  const fetchAnalyticsEvents = async () => {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching analytics events:", error);
      throw error;
    }
    setAnalyticsEvents(data || []);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Analytics data has been updated",
    });
  };

  const handleOrderSelect = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderHistory(order.id);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Manager</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders & Transactions</TabsTrigger>
          <TabsTrigger value="events">Analytics Events</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Orders ({orders.length})
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <Badge variant="secondary">
                      {orders.filter(o => o.status === 'pending').length} pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No orders found. This might indicate an issue with payment processing.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id ? 'bg-accent' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleOrderSelect(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.email}</p>
                            <p className="text-sm text-muted-foreground">
                              ${(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                            {order.stripe_session_id && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Stripe: {order.stripe_session_id.slice(-8)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedOrder ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Order ID:</p>
                        <p className="text-muted-foreground">{selectedOrder.id}</p>
                      </div>
                      <div>
                        <p className="font-medium">Status:</p>
                        <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">Amount:</p>
                        <p className="text-muted-foreground">
                          ${(selectedOrder.amount / 100).toFixed(2)} {selectedOrder.currency.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Customer:</p>
                        <p className="text-muted-foreground">{selectedOrder.email}</p>
                      </div>
                      <div>
                        <p className="font-medium">Created:</p>
                        <p className="text-muted-foreground">
                          {format(new Date(selectedOrder.created_at), 'MMM dd, yyyy HH:mm:ss')}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Updated:</p>
                        <p className="text-muted-foreground">
                          {format(new Date(selectedOrder.updated_at), 'MMM dd, yyyy HH:mm:ss')}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.stripe_session_id && (
                      <div>
                        <p className="font-medium text-sm">Stripe Session ID:</p>
                        <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                          {selectedOrder.stripe_session_id}
                        </p>
                      </div>
                    )}

                    {/* Order History */}
                    <div>
                      <h4 className="font-medium mb-2">Status History</h4>
                      {orderHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No status changes recorded</p>
                      ) : (
                        <div className="space-y-2">
                          {orderHistory.map((history) => (
                            <div key={history.id} className="text-sm border-l-2 border-muted pl-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {history.old_status || 'new'} → {history.new_status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(history.changed_at), 'MMM dd, HH:mm:ss')}
                                </span>
                              </div>
                              {history.notes && (
                                <p className="text-muted-foreground">{history.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select an order to view details</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Analytics Events ({analyticsEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsEvents.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No analytics events found. Check if tracking is working properly.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analyticsEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{event.event_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.created_at), 'MMM dd, HH:mm:ss')}
                        </span>
                      </div>
                      {event.page_url && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Page: {event.page_url}
                        </p>
                      )}
                      {event.session_id && (
                        <p className="text-xs text-muted-foreground">
                          Session: {event.session_id.slice(-8)}
                        </p>
                      )}
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer hover:text-primary">
                          Event Data
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(event.event_data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};