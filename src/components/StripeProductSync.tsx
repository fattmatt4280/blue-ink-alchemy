import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  success: boolean;
  totalProducts: number;
  updated: number;
  errors: string[];
  changes: Array<{
    product: string;
    field: string;
    oldValue: number;
    newValue: number;
  }>;
}

const StripeProductSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('sync-stripe-products');

      if (error) {
        throw error;
      }

      setLastSync(new Date());
      setSyncResult(data);

      if (data.success) {
        toast({
          title: 'Sync Complete',
          description: `Updated ${data.updated} product(s) from Stripe`,
        });
      } else {
        toast({
          title: 'Sync Failed',
          description: data.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync with Stripe',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Stripe Product Sync</CardTitle>
            <CardDescription>
              Sync product prices from Stripe to update your local database
            </CardDescription>
          </div>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sync from Stripe
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastSync && (
          <p className="text-sm text-muted-foreground">
            Last synced: {lastSync.toLocaleString()}
          </p>
        )}

        {syncResult && (
          <div className="space-y-3">
            {syncResult.success && syncResult.updated > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully updated {syncResult.updated} out of {syncResult.totalProducts} products
                </AlertDescription>
              </Alert>
            )}

            {syncResult.success && syncResult.updated === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All {syncResult.totalProducts} products are already up to date
                </AlertDescription>
              </Alert>
            )}

            {syncResult.changes.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">Changes Made:</h4>
                {syncResult.changes.map((change, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{change.product}</span>: 
                    Price updated from ${change.oldValue} to ${change.newValue}
                  </div>
                ))}
              </div>
            )}

            {syncResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Errors occurred:</div>
                  {syncResult.errors.map((error, index) => (
                    <div key={index} className="text-sm">{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StripeProductSync;
