import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  status: string;
  error_message: string | null;
  processing_time_ms: number | null;
  created_at: string;
  processed_at: string | null;
}

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'unhealthy';
  statusMessage: string;
  lastWebhookReceived: string | null;
  hoursSinceLastWebhook: number | null;
  pendingOrders: number;
  pendingOrdersList: Array<{
    id: string;
    email: string;
    amount: number;
    created_at: string;
  }>;
  recentEvents: {
    total: number;
    processed: number;
    failed: number;
    received: number;
    events: WebhookEvent[];
  };
}

export const WebhookHealthMonitor = () => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const WEBHOOK_URL = 'https://vozstxchkgpxzetwdzow.supabase.co/functions/v1/stripe-webhook';

  // Fetch recent webhook events directly from database
  const { data: webhookEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['webhook-events'],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('stripe_webhook_events')
        .select('*')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as WebhookEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch pending orders
  const { data: pendingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['pending-orders-check'],
    queryFn: async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('orders')
        .select('id, email, amount, created_at')
        .eq('status', 'pending')
        .lt('created_at', fifteenMinutesAgo)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  // Calculate health status
  const getHealthStatus = (): { status: 'healthy' | 'warning' | 'unhealthy'; message: string } => {
    const lastEvent = webhookEvents?.[0];
    const pendingCount = pendingOrders?.length || 0;

    if (!lastEvent) {
      return { 
        status: 'unhealthy', 
        message: 'No webhooks received. Check Stripe Dashboard configuration.' 
      };
    }

    const hoursSinceLastWebhook = (Date.now() - new Date(lastEvent.created_at).getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastWebhook > 24) {
      return { 
        status: 'unhealthy', 
        message: `No webhooks in ${Math.round(hoursSinceLastWebhook)} hours` 
      };
    }

    if (pendingCount > 0) {
      return { 
        status: 'warning', 
        message: `${pendingCount} orders stuck in pending` 
      };
    }

    if (hoursSinceLastWebhook > 6) {
      return { 
        status: 'warning', 
        message: `Last webhook ${Math.round(hoursSinceLastWebhook)} hours ago` 
      };
    }

    return { status: 'healthy', message: 'Webhooks are functioning normally' };
  };

  const healthStatus = getHealthStatus();

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-webhook-health');
      
      if (error) throw error;

      await refetchEvents();
      await refetchOrders();

      toast({
        title: 'Health Check Complete',
        description: data.health?.statusMessage || 'Check completed successfully',
      });
    } catch (error) {
      toast({
        title: 'Health Check Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const copyWebhookUrl = async () => {
    await navigator.clipboard.writeText(WEBHOOK_URL);
    toast({
      title: 'Copied!',
      description: 'Webhook URL copied to clipboard',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge variant="default" className="bg-green-500">Processed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'received':
        return <Badge variant="secondary">Received</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const processedCount = webhookEvents?.filter(e => e.status === 'processed').length || 0;
  const failedCount = webhookEvents?.filter(e => e.status === 'failed').length || 0;
  const lastEventTime = webhookEvents?.[0]?.created_at;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(healthStatus.status)}
            <div>
              <CardTitle>Stripe Webhook Health</CardTitle>
              <CardDescription>{healthStatus.message}</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runHealthCheck}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Run Check
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Last Webhook</div>
            <div className="font-medium">
              {lastEventTime 
                ? formatDistanceToNow(new Date(lastEventTime), { addSuffix: true })
                : 'Never'
              }
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Events (24h)</div>
            <div className="font-medium">{webhookEvents?.length || 0}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Processed</div>
            <div className="font-medium text-green-600">{processedCount}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Failed</div>
            <div className="font-medium text-red-600">{failedCount}</div>
          </div>
        </div>

        {/* Pending Orders Warning */}
        {pendingOrders && pendingOrders.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                {pendingOrders.length} Orders Stuck in Pending
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              These orders are older than 15 minutes and haven't been updated by the webhook.
            </p>
            <div className="space-y-1">
              {pendingOrders.slice(0, 5).map(order => (
                <div key={order.id} className="text-sm flex justify-between">
                  <span className="text-yellow-700 dark:text-yellow-300">{order.email}</span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    ${(order.amount / 100).toFixed(2)} - {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => window.location.href = '#order-backfill'}
            >
              Go to Order Backfill Tool
            </Button>
          </div>
        )}

        {/* Stripe Configuration Guide */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="font-medium">Stripe Dashboard Configuration</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Webhook URL:</span>
              <code className="bg-background px-2 py-1 rounded text-xs flex-1 truncate">
                {WEBHOOK_URL}
              </code>
              <Button variant="ghost" size="sm" onClick={copyWebhookUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Required Events: </span>
              <code className="bg-background px-2 py-1 rounded text-xs">checkout.session.completed</code>
              {' '}
              <code className="bg-background px-2 py-1 rounded text-xs">payment_intent.succeeded</code>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Stripe Dashboard
          </Button>
        </div>

        {/* Recent Events Table */}
        <div>
          <div className="font-medium mb-3">Recent Webhook Events</div>
          {eventsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading events...</div>
          ) : webhookEvents && webhookEvents.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Processing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookEvents.slice(0, 10).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-sm">
                        {event.event_type}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(event.status)}
                        {event.error_message && (
                          <div className="text-xs text-red-500 mt-1 truncate max-w-[200px]">
                            {event.error_message}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.created_at), 'MMM d, HH:mm:ss')}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.processing_time_ms ? `${event.processing_time_ms}ms` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-muted-foreground">No webhook events in the last 24 hours</div>
              <div className="text-sm text-muted-foreground mt-1">
                Check that your Stripe webhook is configured correctly
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookHealthMonitor;
