
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface WebsiteMetricsChartProps {
  timeRange: 'daily' | 'weekly' | 'monthly';
}

interface TrafficData {
  date: string;
  visits: number;
  unique_visitors: number;
  page_views: number;
}

const WebsiteMetricsChart = ({ timeRange }: WebsiteMetricsChartProps) => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrafficData();

    // Set up real-time subscription
    const channel = supabase
      .channel('website-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'website_metrics'
        },
        () => {
          console.log('Website metrics data changed, refetching...');
          fetchTrafficData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeRange]);

  const fetchTrafficData = async () => {
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

      const { data: metricsData } = await supabase
        .from('website_metrics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (metricsData) {
        // Group by date
        const metricsByDate: { [key: string]: TrafficData } = {};
        
        metricsData.forEach(metric => {
          const date = metric.date;
          if (!metricsByDate[date]) {
            metricsByDate[date] = {
              date: date, // Keep original date for sorting
              visits: 0,
              unique_visitors: 0,
              page_views: 0,
            };
          }
          
          switch (metric.metric_type) {
            case 'visits':
              metricsByDate[date].visits = metric.value;
              break;
            case 'unique_visitors':
              metricsByDate[date].unique_visitors = metric.value;
              break;
            case 'page_views':
              metricsByDate[date].page_views = metric.value;
              break;
          }
        });

        const chartData = Object.values(metricsByDate)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString() // Format for display
          }));

        setTrafficData(chartData);
      }
    } catch (error) {
      console.error('Error fetching traffic data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Traffic</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">Loading...</div>
        ) : trafficData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available for the selected time range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} name="Visits" />
              <Line type="monotone" dataKey="unique_visitors" stroke="#10b981" strokeWidth={2} name="Unique Visitors" />
              <Line type="monotone" dataKey="page_views" stroke="#f59e0b" strokeWidth={2} name="Page Views" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default WebsiteMetricsChart;
