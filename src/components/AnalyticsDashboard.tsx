
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarDays, TrendingUp, Users, ShoppingCart, Eye, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import DemographicsChart from './DemographicsChart';
import RevenueChart from './RevenueChart';
import WebsiteMetricsChart from './WebsiteMetricsChart';
import TrafficSourcesChart from './TrafficSourcesChart';

interface AnalyticsData {
  totalVisits: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  totalOrders: number;
  uniqueVisitors: number;
}

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalVisits: 0,
    totalRevenue: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    uniqueVisitors: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();

    // Set up real-time subscriptions for all analytics tables
    const metricsChannel = supabase
      .channel('analytics-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'website_metrics'
        },
        () => {
          console.log('Analytics data changed, refetching...');
          fetchAnalyticsData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          console.log('Orders data changed, refetching analytics...');
          fetchAnalyticsData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics_events'
        },
        () => {
          console.log('Analytics events changed, refetching...');
          fetchAnalyticsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
    };
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'daily':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'monthly':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Fetch website metrics
      const { data: metricsData } = await supabase
        .from('website_metrics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      // Fetch orders data
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'paid');

      // Calculate metrics
      const totalVisits = metricsData?.filter(m => m.metric_type === 'visits')
        .reduce((sum, m) => sum + m.value, 0) || 0;
      
      const uniqueVisitors = metricsData?.filter(m => m.metric_type === 'unique_visitors')
        .reduce((sum, m) => sum + m.value, 0) || 0;

      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.amount / 100), 0) || 0;
      const totalOrders = ordersData?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;

      setAnalyticsData({
        totalVisits,
        totalRevenue,
        conversionRate,
        averageOrderValue,
        totalOrders,
        uniqueVisitors,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error loading analytics",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'daily' ? 'default' : 'outline'}
            onClick={() => setTimeRange('daily')}
            size="sm"
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === 'weekly' ? 'default' : 'outline'}
            onClick={() => setTimeRange('weekly')}
            size="sm"
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 'monthly' ? 'default' : 'outline'}
            onClick={() => setTimeRange('monthly')}
            size="sm"
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalVisits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="traffic">Website Traffic</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <RevenueChart timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="traffic">
          <WebsiteMetricsChart timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="demographics">
          <DemographicsChart timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
