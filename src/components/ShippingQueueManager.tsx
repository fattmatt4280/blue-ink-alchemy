import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle, 
  Truck,
  Download,
  ExternalLink,
  Clock,
  DollarSign
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShippingQueueItem {
  id: string;
  order_id: string;
  status: string;
  fetched_rates: any[];
  shippo_shipment_id: string | null;
  selected_rate_id: string | null;
  selected_carrier: string | null;
  selected_service: string | null;
  selected_amount: number | null;
  label_url: string | null;
  tracking_number: string | null;
  notes: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  orders: {
    id: string;
    email: string;
    amount: number;
    status: string;
    shipping_info: any;
    created_at: string;
  };
}

const statusColors: Record<string, string> = {
  pending_rates: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  fetching_rates: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ready_for_review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  skipped: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  manual: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const statusLabels: Record<string, string> = {
  pending_rates: "Pending Rates",
  fetching_rates: "Fetching...",
  ready_for_review: "Ready for Review",
  approved: "Approved",
  failed: "Failed",
  skipped: "Skipped",
  manual: "Manual",
};

export default function ShippingQueueManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<ShippingQueueItem | null>(null);
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: queueItems, isLoading } = useQuery({
    queryKey: ['shipping-queue', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('shipping_queue')
        .select('*, orders(*)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShippingQueueItem[];
    }
  });

  const fetchRatesMutation = useMutation({
    mutationFn: async (queueItem: ShippingQueueItem) => {
      const order = queueItem.orders;
      const shippingInfo = order.shipping_info;

      if (!shippingInfo) {
        throw new Error('No shipping info for this order');
      }

      // Update status to fetching
      await supabase
        .from('shipping_queue')
        .update({ status: 'fetching_rates' })
        .eq('id', queueItem.id);

      // Fetch rates from Shippo
      const { data, error } = await supabase.functions.invoke('get-shipping-rates', {
        body: {
          orderId: order.id,
          cartItems: [{ weight: 8 }], // Default weight - you may want to get this from order items
          address: {
            name: shippingInfo.name,
            street1: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip: shippingInfo.zip,
            country: shippingInfo.country || 'US'
          }
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch rates');

      // Update queue with rates
      await supabase
        .from('shipping_queue')
        .update({ 
          status: 'ready_for_review',
          fetched_rates: data.rates,
          shippo_shipment_id: data.shipmentId,
          error_message: null
        })
        .eq('id', queueItem.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-queue'] });
      toast({ title: "Rates fetched successfully" });
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ['shipping-queue'] });
      toast({ 
        title: "Failed to fetch rates", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const approveLabelMutation = useMutation({
    mutationFn: async ({ queueId, rateId }: { queueId: string; rateId: string }) => {
      const { data, error } = await supabase.functions.invoke('approve-shipping-label', {
        body: { queueId, selectedRateId: rateId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create label');

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipping-queue'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedItem(null);
      toast({ 
        title: "Label created successfully!",
        description: `Tracking: ${data.tracking_number}`
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to create label", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ queueId, status, notes }: { queueId: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('shipping_queue')
        .update({ status, notes: notes || null })
        .eq('id', queueId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-queue'] });
      setSelectedItem(null);
      toast({ title: "Status updated" });
    }
  });

  const pendingCount = queueItems?.filter(i => 
    ['pending_rates', 'ready_for_review'].includes(i.status)
  ).length || 0;

  const formatAddress = (info: any) => {
    if (!info) return 'No address';
    return `${info.name}, ${info.city}, ${info.state} ${info.zip}`;
  };

  const handleOpenDetail = (item: ShippingQueueItem) => {
    setSelectedItem(item);
    setSelectedRateId(item.selected_rate_id || "");
    setNotes(item.notes || "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipping Queue
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingCount} pending
              </Badge>
            )}
          </h2>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_rates">Pending Rates</SelectItem>
            <SelectItem value="ready_for_review">Ready for Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading queue...</div>
      ) : !queueItems?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders in shipping queue</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {queueItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleOpenDetail(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">
                        Order #{item.order_id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.orders.email}
                      </div>
                    </div>
                    <Badge className={statusColors[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatAddress(item.orders.shipping_info)}</span>
                    <span>${(item.orders.amount / 100).toFixed(2)}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {item.error_message && (
                  <div className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {item.error_message}
                  </div>
                )}
                {item.tracking_number && (
                  <div className="mt-2 text-sm text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Tracking: {item.tracking_number}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Order #{selectedItem.order_id.slice(0, 8)}</span>
                  <Badge className={statusColors[selectedItem.status]}>
                    {statusLabels[selectedItem.status]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Customer</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="font-medium">{selectedItem.orders.shipping_info?.name}</p>
                      <p className="text-muted-foreground">{selectedItem.orders.email}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Ship To</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p>{selectedItem.orders.shipping_info?.address}</p>
                      <p>{selectedItem.orders.shipping_info?.city}, {selectedItem.orders.shipping_info?.state} {selectedItem.orders.shipping_info?.zip}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Rates Section */}
                {selectedItem.status === 'pending_rates' && (
                  <div className="text-center py-4">
                    <Button
                      onClick={() => fetchRatesMutation.mutate(selectedItem)}
                      disabled={fetchRatesMutation.isPending}
                    >
                      {fetchRatesMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Fetch Shipping Rates
                    </Button>
                  </div>
                )}

                {selectedItem.fetched_rates && selectedItem.fetched_rates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Available Rates</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchRatesMutation.mutate(selectedItem)}
                          disabled={fetchRatesMutation.isPending}
                        >
                          <RefreshCw className={`h-4 w-4 ${fetchRatesMutation.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Carrier</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Est. Days</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedItem.fetched_rates.map((rate: any) => (
                            <TableRow 
                              key={rate.object_id}
                              className={`cursor-pointer ${selectedRateId === rate.object_id ? 'bg-primary/10' : ''}`}
                              onClick={() => setSelectedRateId(rate.object_id)}
                            >
                              <TableCell>
                                <input
                                  type="radio"
                                  checked={selectedRateId === rate.object_id}
                                  onChange={() => setSelectedRateId(rate.object_id)}
                                  className="h-4 w-4"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{rate.provider}</TableCell>
                              <TableCell>{rate.servicelevel?.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {rate.estimated_days || rate.duration_terms || '—'}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {rate.amount}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Approved Info */}
                {selectedItem.status === 'approved' && selectedItem.label_url && (
                  <Card className="border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Label Created
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Tracking:</span>
                        <span className="font-mono">{selectedItem.tracking_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Carrier:</span>
                        <span>{selectedItem.selected_carrier} - {selectedItem.selected_service}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span>${selectedItem.selected_amount?.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 flex gap-2">
                        <Button asChild>
                          <a href={selectedItem.label_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download Label
                          </a>
                        </Button>
                        <Button variant="outline" asChild>
                          <a 
                            href={`https://parcelsapp.com/en/tracking/${selectedItem.tracking_number}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Track Package
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal notes..."
                    className="h-20"
                  />
                </div>

                {/* Actions */}
                {selectedItem.status !== 'approved' && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ 
                          queueId: selectedItem.id, 
                          status: 'skipped',
                          notes 
                        })}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Skip
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ 
                          queueId: selectedItem.id, 
                          status: 'manual',
                          notes 
                        })}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Mark Manual
                      </Button>
                    </div>
                    <Button
                      disabled={!selectedRateId || approveLabelMutation.isPending}
                      onClick={() => approveLabelMutation.mutate({ 
                        queueId: selectedItem.id, 
                        rateId: selectedRateId 
                      })}
                    >
                      {approveLabelMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve & Create Label
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
