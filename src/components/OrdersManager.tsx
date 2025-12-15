import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Eye, AlertTriangle, Trash2, Package, CheckCircle, Clock, XCircle, FileText, Truck, ShoppingCart } from "lucide-react";
import { PackingSlipDialog } from "./PackingSlipDialog";
import ShippingQueueManager from "./ShippingQueueManager";
import ShipmentReminderManager from "./ShipmentReminderManager";
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
  shipping_info: any;
}

interface ShippingAddress {
  id: string;
  name: string;
  company: string | null;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string | null;
  email: string | null;
}

interface Shipment {
  id: string;
  carrier: string | null;
  service_level: string | null;
  tracking_status: string | null;
  tracking_url: string | null;
  shippo_tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface OrderHistory {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: string | null;
  notes: string | null;
}

export const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Orders data has been updated",
    });
  };

  const handleOrderSelect = async (order: Order) => {
    setSelectedOrder(order);
    await Promise.all([
      fetchOrderHistory(order.id),
      fetchShippingInfo(order.id)
    ]);
  };

  const fetchShippingInfo = async (orderId: string) => {
    try {
      const { data: addressData, error: addressError } = await supabase
        .from("shipping_addresses")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (addressError) {
        console.error("Error fetching shipping address:", addressError);
      } else {
        setShippingAddress(addressData);
      }

      const { data: shipmentData, error: shipmentError } = await supabase
        .from("shipments")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (shipmentError) {
        console.error("Error fetching shipment:", shipmentError);
      } else {
        setShipment(shipmentData);
      }
    } catch (error) {
      console.error("Error fetching shipping info:", error);
    }
  };

  const deleteSelectedOrders = async () => {
    if (selectedOrders.size === 0) return;
    
    setDeletingSelected(true);
    try {
      const orderIds = Array.from(selectedOrders);
      
      await supabase.from("order_status_history").delete().in("order_id", orderIds);
      await supabase.from("shipping_addresses").delete().in("order_id", orderIds);
      await supabase.from("shipments").delete().in("order_id", orderIds);
      await supabase.from("shipping_rates").delete().in("order_id", orderIds);
      await supabase.from("orders").delete().in("id", orderIds);
      
      toast({
        title: "Success",
        description: `${selectedOrders.size} order(s) deleted successfully`,
      });
      
      setSelectedOrders(new Set());
      setSelectedOrder(null);
      setShippingAddress(null);
      setShipment(null);
      await fetchOrders();
    } catch (error) {
      console.error("Error deleting selected orders:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingSelected(false);
    }
  };

  const clearAllOrders = async () => {
    setClearing(true);
    try {
      await supabase.from("order_status_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("shipping_addresses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("shipments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("shipping_rates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      toast({
        title: "Success",
        description: "All orders cleared successfully",
      });
      
      await fetchOrders();
      setSelectedOrder(null);
      setSelectedOrders(new Set());
      setShippingAddress(null);
      setShipment(null);
    } catch (error) {
      console.error("Error clearing orders:", error);
      toast({
        title: "Error",
        description: "Failed to clear orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  const handleOrderCheckbox = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(orders.map(order => order.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });

      await fetchOrders();
      
      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const triggerAutomation = async (orderId: string, triggerStep: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('order-automation-workflow', {
        body: { orderId, triggerStep }
      });

      if (error) throw error;

      toast({
        title: "Automation Triggered",
        description: `${triggerStep} automation started successfully`,
      });
      
      setTimeout(() => fetchOrders(), 2000);
    } catch (error) {
      console.error('Error triggering automation:', error);
      toast({
        title: "Error",
        description: `Failed to trigger ${triggerStep} automation`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'destructive';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <XCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      case 'shipped': return <Package className="h-3 w-3" />;
      case 'delivered': return <CheckCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getOrderBorderClass = (status: string) => {
    switch (status) {
      case 'paid': return 'border-green-300 bg-green-50/50';
      case 'shipped': return 'border-blue-300 bg-blue-50/50';
      case 'delivered': return 'border-emerald-300 bg-emerald-50/50';
      case 'pending': return 'border-orange-300 bg-orange-50/50';
      case 'failed': return 'border-red-300 bg-red-50/50';
      case 'cancelled': return 'border-gray-300 bg-gray-50/50';
      default: return 'border-muted';
    }
  };

  const orderStats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length,
    cancelled: orders.filter(o => o.status === 'cancelled' || o.status === 'failed').length,
    revenue: orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + o.amount, 0) / 100,
  };

  const getFilteredOrders = () => {
    switch (statusFilter) {
      case 'paid': return orders.filter(o => o.status === 'paid');
      case 'shipped': return orders.filter(o => o.status === 'shipped' || o.status === 'delivered');
      case 'pending': return orders.filter(o => o.status === 'pending');
      case 'cancelled': return orders.filter(o => o.status === 'cancelled' || o.status === 'failed');
      default: return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Orders Manager
        </h2>
        <div className="flex gap-2">
          {selectedOrders.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deletingSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedOrders.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Orders?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedOrders.size} selected order(s) and their related data. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={deleteSelectedOrders}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Selected
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={clearing}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Orders?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all orders and their related data. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={clearAllOrders}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Order Management
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping Queue
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Shipment Reminders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Order Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{orderStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </Card>
            <Card className="p-3 border-green-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{orderStats.paid}</p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
            </Card>
            <Card className="p-3 border-blue-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{orderStats.shipped}</p>
                <p className="text-xs text-muted-foreground">Shipped</p>
              </div>
            </Card>
            <Card className="p-3 border-emerald-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{orderStats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </Card>
            <Card className="p-3 border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">{orderStats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </Card>
            <Card className="p-3 border-primary/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">${orderStats.revenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    Orders ({filteredOrders.length})
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="shipped">Shipped/Delivered</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled/Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    {orders.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedOrders.size === orders.length && orders.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all orders"
                        />
                        <span className="text-sm text-muted-foreground">All</span>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {orders.length === 0 
                        ? "No orders found." 
                        : "No orders match the selected filter."}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-3 border rounded-lg transition-colors ${getOrderBorderClass(order.status)} ${
                          selectedOrder?.id === order.id ? 'ring-2 ring-primary' : 'hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={(checked) => handleOrderCheckbox(order.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select order ${order.id}`}
                          />
                          <div 
                            className="flex-1 cursor-pointer"
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
                                <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
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
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="flex items-center gap-1">
                            {getStatusIcon(selectedOrder.status)}
                            {selectedOrder.status}
                          </Badge>
                          <Select onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}>
                            <SelectTrigger className="w-24 h-6">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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

                    {/* Automation Actions */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        🤖 Post-Sale Automation
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerAutomation(selectedOrder.id, 'invoice')}
                          disabled={selectedOrder.status !== 'paid'}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          📄 Send Invoice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerAutomation(selectedOrder.id, 'shipping')}
                          disabled={selectedOrder.status !== 'paid' || !selectedOrder.shipping_info}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          🚚 Create Label
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerAutomation(selectedOrder.id, 'notification')}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                        >
                          📧 Send Update
                        </Button>
                        <PackingSlipDialog 
                          order={selectedOrder}
                          shippingAddress={shippingAddress}
                          shipment={shipment}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Packing Slip
                            </Button>
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status === 'paid' ? 'shipped' : 'paid')}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                        >
                          ⚡ Quick Update
                        </Button>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    {(shippingAddress || shipment) && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Shipping Information
                        </h4>
                        <div className="space-y-3 text-sm">
                          {shippingAddress && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="font-medium">Shipping Address:</p>
                              <p>{shippingAddress.name}</p>
                              {shippingAddress.company && <p>{shippingAddress.company}</p>}
                              <p>{shippingAddress.street1}</p>
                              {shippingAddress.street2 && <p>{shippingAddress.street2}</p>}
                              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                              <p>{shippingAddress.country}</p>
                              {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                            </div>
                          )}
                          
                          {shipment && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="font-medium">Shipment Details:</p>
                              {shipment.carrier && <p>Carrier: {shipment.carrier}</p>}
                              {shipment.service_level && <p>Service: {shipment.service_level}</p>}
                              {shipment.tracking_status && (
                                <p>Status: <Badge variant="outline">{shipment.tracking_status}</Badge></p>
                              )}
                              {shipment.shippo_tracking_number && (
                                <p>Tracking: {shipment.shippo_tracking_number}</p>
                              )}
                              {shipment.tracking_url && (
                                <a 
                                  href={shipment.tracking_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Track Package
                                </a>
                              )}
                              {shipment.shipped_at && (
                                <p>Shipped: {format(new Date(shipment.shipped_at), 'MMM dd, yyyy HH:mm')}</p>
                              )}
                              {shipment.delivered_at && (
                                <p>Delivered: {format(new Date(shipment.delivered_at), 'MMM dd, yyyy HH:mm')}</p>
                              )}
                            </div>
                          )}
                        </div>
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

        <TabsContent value="shipping">
          <ShippingQueueManager />
        </TabsContent>

        <TabsContent value="reminders">
          <ShipmentReminderManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersManager;
