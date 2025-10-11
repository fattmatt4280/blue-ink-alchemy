import { useState } from "react";
import { useShipmentReminders, ShipmentWithReminders } from "@/hooks/useShipmentReminders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Send, AlertCircle, Package, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ShipmentReminderManager = () => {
  const {
    shipments,
    isLoading,
    sendReminder,
    createReminder,
    refreshTracking,
    checkStalledShipments,
    isSendingReminder,
    isRefreshingTracking,
    isCheckingStalled,
  } = useShipmentReminders();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<ShipmentWithReminders | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "IN_TRANSIT":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PRE_TRANSIT":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "RETURNED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getDaysSinceUpdate = (updatedAt: string) => {
    const days = Math.floor(
      (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const isStalled = (shipment: ShipmentWithReminders) => {
    const days = getDaysSinceUpdate(shipment.updated_at);
    return (
      days >= 3 &&
      shipment.tracking_status !== "DELIVERED" &&
      shipment.tracking_status !== "RETURNED"
    );
  };

  const filteredShipments = shipments?.filter((shipment) => {
    const matchesSearch =
      shipment.shippo_tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orders.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "stalled" && isStalled(shipment)) ||
      shipment.tracking_status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleSendReminder = (shipment: ShipmentWithReminders) => {
    setSelectedShipment(shipment);
  };

  const handleSendCustomReminder = () => {
    if (!selectedShipment) return;

    createReminder({
      shipmentId: selectedShipment.id,
      orderId: selectedShipment.order_id,
      email: selectedShipment.orders.email,
      message: customMessage || undefined,
    });

    setSelectedShipment(null);
    setCustomMessage("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Shipment Tracking & Reminders
        </CardTitle>
        <CardDescription>
          Monitor shipments, send tracking reminders, and manage customer notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-2 flex-1">
              <Input
                placeholder="Search by tracking # or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shipments</SelectItem>
                  <SelectItem value="stalled">Stalled (3+ days)</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="pre_transit">Pre-Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => checkStalledShipments()}
              disabled={isCheckingStalled}
              variant="outline"
              size="sm"
            >
              {isCheckingStalled ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              Check Stalled Shipments
            </Button>
          </div>

          {/* Shipments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments && filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => {
                    const daysSinceUpdate = getDaysSinceUpdate(shipment.updated_at);
                    const pendingReminders = shipment.shipment_reminders?.filter(
                      (r) => r.status === "pending"
                    ).length || 0;

                    return (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-mono text-sm">
                          {shipment.shippo_tracking_number}
                        </TableCell>
                        <TableCell className="text-sm">{shipment.orders.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{shipment.carrier}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(shipment.tracking_status)}>
                            {shipment.tracking_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {daysSinceUpdate} day{daysSinceUpdate !== 1 ? "s" : ""} ago
                            </span>
                            {isStalled(shipment) && (
                              <Badge variant="destructive" className="text-xs">
                                Stalled
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {pendingReminders > 0 && (
                            <Badge variant="secondary">
                              {pendingReminders} pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => refreshTracking(shipment.id)}
                              disabled={isRefreshingTracking}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendReminder(shipment)}
                              disabled={isSendingReminder}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No shipments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Send Reminder Dialog */}
        <Dialog
          open={!!selectedShipment}
          onOpenChange={(open) => !open && setSelectedShipment(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send Tracking Reminder
              </DialogTitle>
              <DialogDescription>
                Send a tracking update email to {selectedShipment?.orders.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Tracking #:</span>{" "}
                  {selectedShipment?.shippo_tracking_number}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Status:</span>{" "}
                  {selectedShipment?.tracking_status}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Custom Message (Optional)
                </label>
                <Textarea
                  placeholder="Add a custom message to the reminder email..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedShipment(null)}>
                Cancel
              </Button>
              <Button onClick={handleSendCustomReminder} disabled={isSendingReminder}>
                {isSendingReminder ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ShipmentReminderManager;
