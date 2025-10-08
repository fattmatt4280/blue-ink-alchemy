import { useEffect, useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface AIMetrics {
  avgResponseTime: number;
  errorRate: number;
  anomalyRate: number;
  fallbackUsage: number;
  totalRequests: number;
}

export const AIServiceMonitor = () => {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs } = await supabase
        .from('ai_response_logs')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!logs) {
        setMetrics(null);
        return;
      }

      const totalRequests = logs.length;
      const avgResponseTime = logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalRequests;
      const highAnomalies = logs.filter(log => (log.anomaly_score || 0) > 50).length;
      const fallbackUsed = logs.filter(log => log.fallback_used).length;

      setMetrics({
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: 0, // Will be calculated from error logs
        anomalyRate: (highAnomalies / totalRequests) * 100,
        fallbackUsage: (fallbackUsed / totalRequests) * 100,
        totalRequests
      });
    } catch (error) {
      console.error('Failed to fetch AI metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading AI metrics...</div>;
  }

  if (!metrics) {
    return <div className="text-sm text-muted-foreground">No AI metrics available</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
          <p className="text-xs text-muted-foreground">
            {metrics.avgResponseTime < 3000 ? (
              <span className="text-green-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" /> Excellent
              </span>
            ) : (
              <span className="text-yellow-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Needs monitoring
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anomaly Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.anomalyRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {metrics.anomalyRate < 5 ? (
              <span className="text-green-600">Normal</span>
            ) : (
              <span className="text-red-600">Elevated</span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fallback Usage</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.fallbackUsage.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {metrics.fallbackUsage < 10 ? 'Low' : 'High'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
};
