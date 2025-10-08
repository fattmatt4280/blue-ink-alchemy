import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Ban } from "lucide-react";

interface SecurityAlert {
  id: string;
  type: 'rate_limit' | 'auth_failure' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  details?: any;
}

export const SecurityAlertsWidget = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const alerts: SecurityAlert[] = [];
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Check rate limit violations
      const { data: violations } = await supabase
        .from('rate_limit_violations')
        .select('*')
        .gte('last_violation_at', oneHourAgo)
        .order('last_violation_at', { ascending: false })
        .limit(10);

      if (violations) {
        violations.forEach(v => {
          alerts.push({
            id: v.id,
            type: 'rate_limit',
            severity: v.violation_count > 10 ? 'high' : v.violation_count > 5 ? 'medium' : 'low',
            message: `Rate limit violation: ${v.action_type}`,
            timestamp: v.last_violation_at,
            details: {
              identifier: v.identifier,
              count: v.violation_count,
              blocked_until: v.blocked_until
            }
          });
        });
      }

      // Check AI anomalies
      const { data: anomalies } = await supabase
        .from('ai_response_logs')
        .select('*')
        .gte('created_at', oneHourAgo)
        .gt('anomaly_score', 0.7)
        .order('created_at', { ascending: false })
        .limit(5);

      if (anomalies) {
        anomalies.forEach(a => {
          alerts.push({
            id: a.id,
            type: 'anomaly',
            severity: a.anomaly_score > 0.9 ? 'critical' : a.anomaly_score > 0.8 ? 'high' : 'medium',
            message: `Anomalous AI response detected`,
            timestamp: a.created_at,
            details: {
              healing_stage: a.healing_stage,
              risk_level: a.risk_level,
              anomaly_score: a.anomaly_score
            }
          });
        });
      }

      // Sort by severity and timestamp
      alerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setAlerts(alerts.slice(0, 10)); // Show top 10
      setLoading(false);
    } catch (error) {
      console.error('Error loading security alerts:', error);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rate_limit': return <Ban className="h-4 w-4" />;
      case 'auth_failure': return <Shield className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div>Loading security alerts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Alerts (Last Hour)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              ✅ No security alerts in the last hour. All systems operating normally.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id}>
                {getAlertIcon(alert.type)}
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                      {alert.details && (
                        <div className="text-xs mt-2 p-2 bg-muted rounded">
                          {Object.entries(alert.details).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
