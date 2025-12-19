import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { TrendingUp, Calendar, Award, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Neon color palette
const NEON_CYAN = "#00f5ff";
const NEON_BLUE = "#3b82f6";
const NEON_PURPLE = "#8b5cf6";
const NEON_GREEN = "#22c55e";
const NEON_ORANGE = "#f97316";

const NEON_COLORS = [NEON_CYAN, NEON_BLUE, NEON_PURPLE, NEON_GREEN];

interface InsightData {
  avgHealingTime: number;
  totalAnalyses: number;
  currentStreak: number;
  stageDistribution: { stage: string; count: number }[];
  progressTrend: { date: string; score: number }[];
  riskFactors: { factor: string; frequency: number }[];
}

// Custom tooltip with neon styling
const NeonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="px-4 py-3 rounded-lg border"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          borderColor: `${NEON_CYAN}40`,
          boxShadow: `0 0 20px ${NEON_CYAN}30`
        }}
      >
        <p className="text-cyan-300 text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p 
            key={index} 
            className="text-sm font-bold"
            style={{ color: entry.color, textShadow: `0 0 10px ${entry.color}` }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
        <div className="h-32 bg-slate-800/50 animate-pulse rounded-lg border border-cyan-500/20" />
        <div className="h-64 bg-slate-800/50 animate-pulse rounded-lg border border-cyan-500/20" />
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-slate-800/50 border border-cyan-500/20" style={{ boxShadow: `0 0 15px ${NEON_CYAN}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" style={{ color: NEON_CYAN }} />
            <span className="text-sm font-medium text-cyan-300/80">Avg Healing Time</span>
          </div>
          <p 
            className="text-3xl font-bold font-rajdhani"
            style={{ color: NEON_CYAN, textShadow: `0 0 15px ${NEON_CYAN}` }}
          >
            {insights.avgHealingTime > 0 ? `${insights.avgHealingTime} days` : "N/A"}
          </p>
          <p className="text-xs text-cyan-300/50 mt-1">Based on completed journeys</p>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/50 border border-blue-500/20" style={{ boxShadow: `0 0 15px ${NEON_BLUE}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4" style={{ color: NEON_BLUE }} />
            <span className="text-sm font-medium text-blue-300/80">Total Analyses</span>
          </div>
          <p 
            className="text-3xl font-bold font-rajdhani"
            style={{ color: NEON_BLUE, textShadow: `0 0 15px ${NEON_BLUE}` }}
          >
            {insights.totalAnalyses}
          </p>
          <p className="text-xs text-blue-300/50 mt-1">Healing checkpoints tracked</p>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/50 border border-purple-500/20" style={{ boxShadow: `0 0 15px ${NEON_PURPLE}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4" style={{ color: NEON_PURPLE }} />
            <span className="text-sm font-medium text-purple-300/80">Tracking Streak</span>
          </div>
          <p 
            className="text-3xl font-bold font-rajdhani"
            style={{ color: NEON_PURPLE, textShadow: `0 0 15px ${NEON_PURPLE}` }}
          >
            {insights.currentStreak}
          </p>
          <p className="text-xs text-purple-300/50 mt-1">Keep up the good work!</p>
        </div>
      </div>

      {/* Progress Trend Chart */}
      {insights.progressTrend.length > 0 && (
        <div className="p-4 rounded-lg bg-slate-800/30 border border-cyan-500/20" style={{ boxShadow: `0 0 20px ${NEON_CYAN}08` }}>
          <h3 className="text-lg font-semibold text-cyan-300 mb-1">Progress Score Over Time</h3>
          <p className="text-sm text-cyan-300/50 mb-4">Track how your healing is progressing</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={insights.progressTrend}>
              <defs>
                <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NEON_CYAN} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={NEON_CYAN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 245, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(0, 245, 255, 0.5)"
                fontSize={12}
                tick={{ fill: 'rgba(0, 245, 255, 0.7)' }}
              />
              <YAxis 
                stroke="rgba(0, 245, 255, 0.5)"
                fontSize={12}
                domain={[0, 100]}
                tick={{ fill: 'rgba(0, 245, 255, 0.7)' }}
              />
              <Tooltip content={<NeonTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke={NEON_CYAN}
                strokeWidth={3}
                fill="url(#neonGradient)"
                style={{ filter: `drop-shadow(0 0 8px ${NEON_CYAN})` }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={NEON_CYAN}
                strokeWidth={3}
                dot={{ fill: NEON_CYAN, strokeWidth: 2, r: 4, style: { filter: `drop-shadow(0 0 6px ${NEON_CYAN})` } }}
                activeDot={{ r: 6, fill: NEON_CYAN, style: { filter: `drop-shadow(0 0 10px ${NEON_CYAN})` } }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Healing Stage Distribution */}
        {insights.stageDistribution.length > 0 && (
          <div className="p-4 rounded-lg bg-slate-800/30 border border-blue-500/20" style={{ boxShadow: `0 0 20px ${NEON_BLUE}08` }}>
            <h3 className="text-lg font-semibold text-blue-300 mb-1">Healing Stage Distribution</h3>
            <p className="text-sm text-blue-300/50 mb-4">Breakdown of your healing phases</p>
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
                  labelLine={{ stroke: 'rgba(0, 245, 255, 0.3)' }}
                >
                  {insights.stageDistribution.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={NEON_COLORS[index % NEON_COLORS.length]}
                      style={{ filter: `drop-shadow(0 0 8px ${NEON_COLORS[index % NEON_COLORS.length]})` }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<NeonTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Risk Factors */}
        {insights.riskFactors.length > 0 && (
          <div className="p-4 rounded-lg bg-slate-800/30 border border-orange-500/20" style={{ boxShadow: `0 0 20px ${NEON_ORANGE}08` }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-5 w-5" style={{ color: NEON_ORANGE }} />
              <h3 className="text-lg font-semibold text-orange-300">Common Risk Factors</h3>
            </div>
            <p className="text-sm text-orange-300/50 mb-4">Issues detected during healing</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={insights.riskFactors} layout="vertical">
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={NEON_ORANGE} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={NEON_ORANGE} stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(249, 115, 22, 0.1)" />
                <XAxis type="number" stroke="rgba(249, 115, 22, 0.5)" fontSize={12} tick={{ fill: 'rgba(249, 115, 22, 0.7)' }} />
                <YAxis 
                  dataKey="factor" 
                  type="category" 
                  stroke="rgba(249, 115, 22, 0.5)"
                  fontSize={11}
                  width={100}
                  tick={{ fill: 'rgba(249, 115, 22, 0.7)' }}
                />
                <Tooltip content={<NeonTooltip />} />
                <Bar 
                  dataKey="frequency" 
                  fill="url(#riskGradient)"
                  radius={[0, 4, 4, 0]}
                  style={{ filter: `drop-shadow(0 0 6px ${NEON_ORANGE}80)` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};