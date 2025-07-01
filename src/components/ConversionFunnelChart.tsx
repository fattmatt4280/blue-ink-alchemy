
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ConversionFunnelChartProps {
  timeRange: 'daily' | 'weekly' | 'monthly';
}

interface FunnelData {
  step: string;
  count: number;
  conversion_rate: number;
}

const ConversionFunnelChart = ({ timeRange }: ConversionFunnelChartProps) => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, [timeRange]);

  const fetchFunnelData = async () => {
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

      const { data: funnelData } = await supabase
        .from('conversion_funnel')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (funnelData) {
        // Aggregate data by step
        const steps = ['visits', 'product_views', 'add_to_cart', 'checkout', 'purchase'];
        const aggregatedData = steps.map(step => {
          const stepData = funnelData.filter(d => d.step_name === step);
          const totalCount = stepData.reduce((sum, d) => sum + d.count, 0);
          const avgConversionRate = stepData.length > 0
            ? stepData.reduce((sum, d) => sum + (d.conversion_rate || 0), 0) / stepData.length
            : 0;

          return {
            step: step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            count: totalCount,
            conversion_rate: avgConversionRate,
          };
        });

        setFunnelData(aggregatedData);
      }
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'count' ? value.toLocaleString() : `${value}%`,
                  name === 'count' ? 'Count' : 'Conversion Rate'
                ]}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
