import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Star, Award, BookOpen, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AnalyticsData {
  totalAssessments: number;
  expertReviewed: number;
  averageRating: number;
  knowledgeBaseSize: number;
  accuracyByComponent: {
    healingStage: number;
    progressScore: number;
    recommendations: number;
  };
  improvementTrend: {
    week: string;
    accuracy: number;
  }[];
}

export const AITrainingAnalytics = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    try {
      // Fetch total assessments
      const { count: totalAssessments } = await supabase
        .from('healing_progress')
        .select('*', { count: 'exact', head: true });

      // Fetch expert reviewed
      const { count: expertReviewed } = await supabase
        .from('expert_assessments')
        .select('*', { count: 'exact', head: true });

      // Fetch ratings
      const { data: ratings } = await supabase
        .from('ai_assessment_ratings')
        .select('*');

      // Calculate average ratings
      const avgOverall = ratings?.length
        ? ratings.reduce((sum, r) => sum + r.overall_accuracy, 0) / ratings.length
        : 0;
      
      const avgStage = ratings?.length
        ? ratings.reduce((sum, r) => sum + r.healing_stage_accuracy, 0) / ratings.length
        : 0;
      
      const avgScore = ratings?.length
        ? ratings.reduce((sum, r) => sum + r.progress_score_accuracy, 0) / ratings.length
        : 0;
      
      const avgRecs = ratings?.length
        ? ratings.reduce((sum, r) => sum + r.recommendations_accuracy, 0) / ratings.length
        : 0;

      // Fetch knowledge base size
      const { count: knowledgeBaseSize } = await supabase
        .from('expert_knowledge_base')
        .select('*', { count: 'exact', head: true });

      // Calculate weekly improvement trend (last 8 weeks)
      const improvementTrend = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const { data: weekRatings } = await supabase
          .from('ai_assessment_ratings')
          .select('overall_accuracy')
          .gte('created_at', weekStart.toISOString())
          .lt('created_at', weekEnd.toISOString());

        const weekAvg = weekRatings?.length
          ? weekRatings.reduce((sum, r) => sum + r.overall_accuracy, 0) / weekRatings.length
          : 0;

        improvementTrend.push({
          week: `Week ${8 - i}`,
          accuracy: Math.round(weekAvg * 20), // Convert 1-5 scale to percentage
        });
      }

      setAnalytics({
        totalAssessments: totalAssessments || 0,
        expertReviewed: expertReviewed || 0,
        averageRating: avgOverall,
        knowledgeBaseSize: knowledgeBaseSize || 0,
        accuracyByComponent: {
          healingStage: avgStage,
          progressScore: avgScore,
          recommendations: avgRecs,
        },
        improvementTrend,
      });
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const reviewProgress = analytics.totalAssessments > 0
    ? (analytics.expertReviewed / analytics.totalAssessments) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.expertReviewed} reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average AI Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageRating.toFixed(1)} / 5.0
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {analytics.expertReviewed} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.knowledgeBaseSize}</div>
            <p className="text-xs text-muted-foreground">
              Documented conditions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Progress</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewProgress.toFixed(0)}%</div>
            <Progress value={reviewProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Component Accuracy */}
      <Card>
        <CardHeader>
          <CardTitle>AI Accuracy by Component</CardTitle>
          <CardDescription>Average ratings for different assessment aspects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Healing Stage Detection</span>
              <span className="text-sm text-muted-foreground">
                {analytics.accuracyByComponent.healingStage.toFixed(1)} / 5.0
              </span>
            </div>
            <Progress value={analytics.accuracyByComponent.healingStage * 20} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress Score Accuracy</span>
              <span className="text-sm text-muted-foreground">
                {analytics.accuracyByComponent.progressScore.toFixed(1)} / 5.0
              </span>
            </div>
            <Progress value={analytics.accuracyByComponent.progressScore * 20} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Recommendation Quality</span>
              <span className="text-sm text-muted-foreground">
                {analytics.accuracyByComponent.recommendations.toFixed(1)} / 5.0
              </span>
            </div>
            <Progress value={analytics.accuracyByComponent.recommendations * 20} />
          </div>
        </CardContent>
      </Card>

      {/* Improvement Trend */}
      <Card>
        <CardHeader>
          <CardTitle>AI Improvement Trend</CardTitle>
          <CardDescription>Weekly accuracy progression</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.improvementTrend.map((week) => (
              <div key={week.week} className="flex items-center gap-4">
                <span className="text-sm font-medium w-20">{week.week}</span>
                <Progress value={week.accuracy} className="flex-1" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {week.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
