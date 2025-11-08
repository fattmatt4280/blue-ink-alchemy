import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BackfillResults {
  summary: {
    total: number;
    processed: number;
    cancelled: number;
    skipped: number;
    errors: number;
  };
  details: {
    processed: Array<{
      orderId: string;
      email: string;
      amount: number;
      activationCode?: string;
      hasShipping: boolean;
    }>;
    cancelled: Array<{
      orderId: string;
      email: string;
      reason: string;
    }>;
    skipped: Array<{
      orderId: string;
      email: string;
      reason: string;
    }>;
    errors: Array<{
      orderId: string;
      email: string;
      error: string;
    }>;
  };
}

export const OrderBackfillManager = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BackfillResults | null>(null);
  const { toast } = useToast();

  const runBackfill = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('backfill-paid-orders');

      if (error) throw error;

      setResults(data);
      
      toast({
        title: "Backfill Complete",
        description: `Processed ${data.summary.processed} orders, cancelled ${data.summary.cancelled} abandoned checkouts`,
      });
    } catch (error: any) {
      toast({
        title: "Backfill Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!results) return;

    const reportText = `
Order Backfill Report
Generated: ${new Date().toLocaleString()}

=== SUMMARY ===
Total Pending Orders: ${results.summary.total}
Successfully Processed: ${results.summary.processed}
Cancelled (Abandoned): ${results.summary.cancelled}
Skipped: ${results.summary.skipped}
Errors: ${results.summary.errors}

=== PROCESSED ORDERS ===
${results.details.processed.map(o => 
  `Order ID: ${o.orderId}
Email: ${o.email}
Amount: $${o.amount}
Activation Code: ${o.activationCode || 'N/A'}
Has Shipping: ${o.hasShipping ? 'Yes' : 'No'}
---`
).join('\n')}

=== CANCELLED ORDERS ===
${results.details.cancelled.map(o => 
  `Order ID: ${o.orderId}
Email: ${o.email}
Reason: ${o.reason}
---`
).join('\n')}

=== ERRORS ===
${results.details.errors.map(o => 
  `Order ID: ${o.orderId}
Email: ${o.email}
Error: ${o.error}
---`
).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-backfill-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Order Backfill System
        </CardTitle>
        <CardDescription>
          Check Stripe for pending orders, process paid ones, and cancel abandoned checkouts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will check all pending orders against Stripe. Paid orders will be processed (emails sent, shipping initiated, activation codes generated). Abandoned checkouts will be marked as cancelled.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={runBackfill} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Orders...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Backfill
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Results</h3>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-2xl font-bold">{results.summary.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.summary.processed}</div>
                <div className="text-xs text-muted-foreground">Processed</div>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{results.summary.cancelled}</div>
                <div className="text-xs text-muted-foreground">Cancelled</div>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.summary.skipped}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div className="bg-red-500/10 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.summary.errors}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>

            {results.details.processed.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Processed Orders ({results.details.processed.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.details.processed.map((order) => (
                    <div key={order.orderId} className="bg-green-500/5 p-3 rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs">{order.orderId}</span>
                        <Badge variant="outline" className="text-green-600">
                          ${order.amount}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">{order.email}</div>
                      {order.activationCode && (
                        <div className="mt-1 font-mono text-xs bg-background p-1 rounded">
                          Code: {order.activationCode}
                        </div>
                      )}
                      {order.hasShipping && (
                        <Badge variant="secondary" className="mt-1">Shipping Initiated</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.details.cancelled.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  Cancelled Orders ({results.details.cancelled.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.details.cancelled.map((order) => (
                    <div key={order.orderId} className="bg-yellow-500/5 p-3 rounded-lg text-sm">
                      <div className="font-mono text-xs">{order.orderId}</div>
                      <div className="text-muted-foreground">{order.email}</div>
                      <div className="text-xs text-yellow-600 mt-1">{order.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.details.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Errors ({results.details.errors.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.details.errors.map((order) => (
                    <div key={order.orderId} className="bg-red-500/5 p-3 rounded-lg text-sm">
                      <div className="font-mono text-xs">{order.orderId}</div>
                      <div className="text-muted-foreground">{order.email}</div>
                      <div className="text-xs text-red-600 mt-1">{order.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
