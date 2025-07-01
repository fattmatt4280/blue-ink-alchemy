
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface RevenueChartProps {
  timeRange: 'daily' | 'weekly' | 'monthly';
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

const RevenueChart = ({ timeRange }: RevenueChartProps) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
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

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'paid');

      if (ordersData) {
        // Group by date
        const revenueByDate: { [key: string]: { revenue: number; orders: number } } = {};
        
        ordersData.forEach(order => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          if (!revenueByDate[date]) {
            revenueByDate[date] = { revenue: 0, orders: 0 };
          }
          revenueByDate[date].revenue += order.amount / 100;
          revenueByDate[date].orders += 1;
        });

        const chartData = Object.entries(revenueByDate)
          .map(([date, data]) => ({
            date: new Date(date).toLocaleDateString(),
            revenue: data.revenue,
            orders: data.orders,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setRevenueData(chartData);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `$${value.toFixed(2)}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
