import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, Clock, Activity } from "lucide-react";

interface AIMetrics {
  avgResponseTime: number;
  errorRate: number;
  anomalyCount: number;
  totalRequests: number;
  healingStageDistribution: Record<string, number>;
}

export const AIResponseMonitor = () => {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [recentAnomalies, setRecentAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      // Get metrics from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: logs, error } = await supabase
        .from('ai_response_logs')
        .select('*')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (logs && logs.length > 0) {
        // Calculate metrics
        const avgResponseTime = logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length;
        const anomalyCount = logs.filter(log => (log.anomaly_score || 0) > 0.7).length;
        const errorRate = 0; // We'll enhance this later with error tracking

        // Healing stage distribution
        const stageDistribution: Record<string, number> = {};
        logs.forEach(log => {
          const stage = log.healing_stage || 'Unknown';
          stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
        });

        setMetrics({
          avgResponseTime,
          errorRate,
          anomalyCount,
          totalRequests: logs.length,
          healingStageDistribution: stageDistribution
        });

        // Get recent high anomaly scores
        const anomalies = logs.filter(log => (log.anomaly_score || 0) > 0.7).slice(0, 5);
        setRecentAnomalies(anomalies);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading AI metrics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading AI metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avgResponseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics && metrics.avgResponseTime < 3000 ? '✅ Healthy' : '⚠️ Degraded'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.anomalyCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics && metrics.anomalyCount > 0 ? '⚠️ Review needed' : '✅ Normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Target: &lt;5%</p>
          </CardContent>
        </Card>
      </div>

      {recentAnomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Anomalies (Score &gt; 0.7)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnomalies.map((anomaly) => (
                <Alert key={anomaly.id}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Healing Stage: {anomaly.healing_stage}</p>
                        <p className="text-sm text-muted-foreground">
                          Risk Level: {anomaly.risk_level} | 
                          Time: {new Date(anomaly.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        Score: {(anomaly.anomaly_score || 0).toFixed(2)}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Healing Stage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics && Object.entries(metrics.healingStageDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm">{stage}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(count / metrics.totalRequests) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
