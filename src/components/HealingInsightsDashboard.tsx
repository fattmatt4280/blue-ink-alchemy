import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Award, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface InsightData {
  avgHealingTime: number;
  totalAnalyses: number;
  currentStreak: number;
  stageDistribution: { stage: string; count: number }[];
  progressTrend: { date: string; score: number }[];
  riskFactors: { factor: string; frequency: number }[];
}

export const HealingInsightsDashboard = ({ userId }: { userId?: string }) => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["healing-insights", userId],
    queryFn: async () => {
      let query = supabase
        .from("healing_progress")
        .select("*")
        .order("created_at", { ascending: true });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate insights
      const stageMap = new Map<string, number>();
      const progressByDate = new Map<string, number[]>();
      const riskMap = new Map<string, number>();
      
      let totalDays = 0;
      let completedCount = 0;

      data?.forEach((entry) => {
        // Stage distribution
        stageMap.set(entry.healing_stage, (stageMap.get(entry.healing_stage) || 0) + 1);

        // Progress trend
        const dateKey = format(new Date(entry.created_at), "MMM dd");
        const scores = progressByDate.get(dateKey) || [];
        scores.push(entry.progress_score || 0);
        progressByDate.set(dateKey, scores);

        // Risk factors
        if (entry.analysis_result && typeof entry.analysis_result === 'object') {
          const result = entry.analysis_result as any;
          if (result.risk_factors && Array.isArray(result.risk_factors)) {
            result.risk_factors.forEach((risk: string) => {
              riskMap.set(risk, (riskMap.get(risk) || 0) + 1);
            });
          }
        }

        // Calculate healing time for completed tattoos
        if (entry.healing_stage === "healed" && data[0]) {
          const days = differenceInDays(
            new Date(entry.created_at),
            new Date(data[0].created_at)
          );
          totalDays += days;
          completedCount++;
        }
      });

      const insightData: InsightData = {
        avgHealingTime: completedCount > 0 ? Math.round(totalDays / completedCount) : 0,
        totalAnalyses: data?.length || 0,
        currentStreak: data?.length || 0,
        stageDistribution: Array.from(stageMap.entries()).map(([stage, count]) => ({
          stage,
          count,
        })),
        progressTrend: Array.from(progressByDate.entries()).map(([date, scores]) => ({
          date,
          score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        })),
        riskFactors: Array.from(riskMap.entries())
          .map(([factor, frequency]) => ({ factor, frequency }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 5),
      };

      return insightData;
    },
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!insights) return null;

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Avg Healing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {insights.avgHealingTime > 0 ? `${insights.avgHealingTime} days` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Based on completed journeys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Total Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{insights.totalAnalyses}</p>
            <p className="text-xs text-muted-foreground mt-1">Healing checkpoints tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              Tracking Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{insights.currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">Keep up the good work!</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Trend Chart */}
      {insights.progressTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Score Over Time</CardTitle>
            <CardDescription>Track how your healing is progressing</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights.progressTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Healing Stage Distribution */}
        {insights.stageDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Healing Stage Distribution</CardTitle>
              <CardDescription>Breakdown of your healing phases</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={insights.stageDistribution}
                    dataKey="count"
                    nameKey="stage"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.stage}
                  >
                    {insights.stageDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Risk Factors */}
        {insights.riskFactors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Common Risk Factors
              </CardTitle>
              <CardDescription>Issues detected during healing</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={insights.riskFactors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    dataKey="factor" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="frequency" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
