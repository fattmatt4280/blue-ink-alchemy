import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Monitor, Tablet, Globe, BarChart3, MapPin } from 'lucide-react';

interface TrafficSourcesChartProps {
  timeRange: 'daily' | 'weekly' | 'monthly';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const TrafficSourcesChart = ({ timeRange }: TrafficSourcesChartProps) => {
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([]);
  const [campaignData, setCampaignData] = useState<{ name: string; visits: number }[]>([]);
  const [deviceData, setDeviceData] = useState<{ name: string; value: number }[]>([]);
  const [landingPages, setLandingPages] = useState<{ page: string; visits: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrafficData();
  }, [timeRange]);

  const fetchTrafficData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case 'daily': startDate.setDate(endDate.getDate() - 7); break;
        case 'weekly': startDate.setDate(endDate.getDate() - 30); break;
        case 'monthly': startDate.setDate(endDate.getDate() - 90); break;
      }

      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (!events) return;

      // Aggregate referrer domains
      const sources: Record<string, number> = {};
      const campaigns: Record<string, number> = {};
      const devices: Record<string, number> = {};
      const pages: Record<string, number> = {};

      events.forEach(e => {
        const d = e.event_data as Record<string, any>;
        
        const domain = d?.referrer_domain || 'direct';
        sources[domain] = (sources[domain] || 0) + 1;

        const campaign = d?.utm_campaign;
        if (campaign) campaigns[campaign] = (campaigns[campaign] || 0) + 1;

        const device = d?.device_type || 'unknown';
        devices[device] = (devices[device] || 0) + 1;

        const page = d?.landing_page || d?.page || '/';
        pages[page] = (pages[page] || 0) + 1;
      });

      setSourceData(
        Object.entries(sources)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, value]) => ({ name, value }))
      );

      setCampaignData(
        Object.entries(campaigns)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, visits]) => ({ name, visits }))
      );

      setDeviceData(
        Object.entries(devices)
          .sort((a, b) => b[1] - a[1])
          .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      );

      setLandingPages(
        Object.entries(pages)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([page, visits]) => ({ page, visits }))
      );
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading traffic data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Sources + Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No traffic data yet. Data will appear as visitors arrive.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No device data yet.</p>
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {deviceData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                      {d.name === 'Mobile' ? <Smartphone className="h-3 w-3" /> : d.name === 'Tablet' ? <Tablet className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Campaign performance */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Campaign Performance (UTM)</CardTitle>
        </CardHeader>
        <CardContent>
          {campaignData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No campaign data yet. Make sure your Meta ad URLs include UTM parameters like:<br />
              <code className="text-xs">?utm_source=facebook&utm_medium=paid_social&utm_campaign=your_campaign</code>
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Row 3: Landing pages table */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Top Landing Pages</CardTitle>
        </CardHeader>
        <CardContent>
          {landingPages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No landing page data yet.</p>
          ) : (
            <div className="space-y-2">
              {landingPages.map((lp, i) => (
                <div key={lp.page} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm font-mono">{lp.page}</span>
                  <span className="text-sm font-semibold">{lp.visits} visits</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficSourcesChart;
