
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface DemographicsChartProps {
  timeRange: 'daily' | 'weekly' | 'monthly';
}

interface DemographicData {
  name: string;
  value: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DemographicsChart = ({ timeRange }: DemographicsChartProps) => {
  const [ageData, setAgeData] = useState<DemographicData[]>([]);
  const [genderData, setGenderData] = useState<DemographicData[]>([]);
  const [regionData, setRegionData] = useState<DemographicData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemographicsData();
  }, [timeRange]);

  const fetchDemographicsData = async () => {
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

      const { data: demographicsData } = await supabase
        .from('user_demographics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (demographicsData) {
        // Process age groups
        const ageGroups: { [key: string]: number } = {};
        demographicsData.forEach(d => {
          if (d.age_group) {
            ageGroups[d.age_group] = (ageGroups[d.age_group] || 0) + d.count;
          }
        });

        // Process genders
        const genders: { [key: string]: number } = {};
        demographicsData.forEach(d => {
          if (d.gender) {
            genders[d.gender] = (genders[d.gender] || 0) + d.count;
          }
        });

        // Process regions
        const regions: { [key: string]: number } = {};
        demographicsData.forEach(d => {
          if (d.region) {
            regions[d.region] = (regions[d.region] || 0) + d.count;
          }
        });

        setAgeData(Object.entries(ageGroups).map(([name, value]) => ({ name, value })));
        setGenderData(Object.entries(genders).map(([name, value]) => ({ name, value })));
        setRegionData(Object.entries(regions).map(([name, value]) => ({ name, value })));
      }
    } catch (error) {
      console.error('Error fetching demographics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="h-80 flex items-center justify-center">
              Loading...
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Age Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Regions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemographicsChart;
