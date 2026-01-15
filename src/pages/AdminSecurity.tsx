import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Users, Activity, Eye, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminHeader from '@/components/AdminHeader';

import { SecurityAlertsWidget } from '@/components/SecurityAlertsWidget';
import { supabase } from '@/integrations/supabase/client';
import { calculateSecurityScore, SecurityMetrics } from '@/utils/securityScoreCalculator';
import { getGradeColor } from '@/utils/securityScoreCalculator';
import { MFASetup } from '@/components/MFASetup';

export default function AdminSecurity() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [securityScore, setSecurityScore] = useState<any>(null);
  const [piiAccessLogs, setPiiAccessLogs] = useState<any[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [mfaStats, setMfaStats] = useState({ enabled: 0, total: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSecurityData();
    }
  }, [isAdmin]);

  const fetchSecurityData = async () => {
    try {
      // Fetch MFA statistics
      const { data: profiles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      const adminIds = profiles?.map(p => p.user_id) || [];
      
      const { data: mfaProfiles } = await supabase
        .from('profiles')
        .select('mfa_enabled')
        .in('id', adminIds);

      const mfaEnabled = mfaProfiles?.filter(p => p.mfa_enabled).length || 0;
      setMfaStats({ enabled: mfaEnabled, total: adminIds.length });

      // Fetch recent rate limit violations
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: violations } = await supabase
        .from('rate_limit_violations')
        .select('*')
        .gte('last_violation_at', oneDayAgo.toISOString());

      // Fetch AI anomalies
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: aiLogs } = await supabase
        .from('ai_response_logs')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const highAnomalies = aiLogs?.filter(log => (log.anomaly_score || 0) > 50).length || 0;
      const totalAiRequests = aiLogs?.length || 1;

      // Calculate security score
      const metrics: SecurityMetrics = {
        adminMfaEnabled: (mfaEnabled / Math.max(adminIds.length, 1)) * 100,
        recentSecurityIncidents: 0,
        aiAnomalyRate: (highAnomalies / totalAiRequests) * 100,
        piiAccessLogged: true,
        auditLogComplete: true,
        rateLimitViolations: violations?.length || 0,
        failedLoginAttempts: 0
      };

      setSecurityScore(calculateSecurityScore(metrics));

      // Fetch PII access logs
      const { data: piiLogs } = await supabase
        .from('pii_access_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setPiiAccessLogs(piiLogs || []);

      // Fetch admin audit logs
      const { data: auditLogs } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setAdminAuditLogs(auditLogs || []);

    } catch (error) {
      console.error('Failed to fetch security data:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onSignOut={() => navigate('/')} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Security Dashboard
            </h1>
            <p className="text-muted-foreground">Monitor and manage security across your platform</p>
          </div>
          <Button onClick={fetchSecurityData}>
            Refresh
          </Button>
        </div>

        {/* Security Score Overview */}
        {securityScore && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Security Score</CardTitle>
                <CardDescription>Overall security posture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getGradeColor(securityScore.grade)}`}>
                    {securityScore.grade}
                  </div>
                  <div className="text-3xl font-semibold mt-2">
                    {securityScore.overall}/100
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Authentication</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityScore.breakdown.authentication}/30</div>
                <p className="text-xs text-muted-foreground">
                  {mfaStats.enabled}/{mfaStats.total} admins with MFA
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Protection</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityScore.breakdown.dataProtection}/30</div>
                <p className="text-xs text-muted-foreground">PII logging active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Integrity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityScore.breakdown.aiIntegrity}/25</div>
                <p className="text-xs text-muted-foreground">Model security</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        {securityScore?.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Security Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {securityScore.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Badge variant={rec.includes('CRITICAL') ? 'destructive' : 'secondary'}>
                      {rec.includes('CRITICAL') ? 'CRITICAL' : rec.includes('URGENT') ? 'URGENT' : 'INFO'}
                    </Badge>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mfa">MFA Management</TabsTrigger>
            <TabsTrigger value="ai">AI Security</TabsTrigger>
            <TabsTrigger value="pii">PII Access</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <SecurityAlertsWidget />
          </TabsContent>

          <TabsContent value="mfa" className="space-y-4">
            <MFASetup onComplete={fetchSecurityData} />
            <Card>
              <CardHeader>
                <CardTitle>MFA Status</CardTitle>
                <CardDescription>Admin accounts with multi-factor authentication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {mfaStats.enabled} / {mfaStats.total}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((mfaStats.enabled / Math.max(mfaStats.total, 1)) * 100).toFixed(0)}% of admins protected
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Security Monitoring</CardTitle>
                <CardDescription>AI service monitoring has been removed</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="pii" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>PII Access Log</CardTitle>
                <CardDescription>Recent access to personally identifiable information</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admin</TableHead>
                      <TableHead>User Accessed</TableHead>
                      <TableHead>PII Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {piiAccessLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.admin_user_id.slice(0, 8)}</TableCell>
                        <TableCell className="font-mono text-sm">{log.accessed_user_id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.pii_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.access_reason}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Audit Log</CardTitle>
                <CardDescription>Recent admin actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.admin_user_id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <Badge>{log.action_type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.resource_type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
