import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, TrendingUp, Calendar, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useHealingHistory } from "@/hooks/useHealingHistory";
import { HealingHistoryCard } from "@/components/HealingHistoryCard";
import { HealingProgressChart } from "@/components/HealingProgressChart";
import { HealingPhotoTimeline } from "@/components/HealingPhotoTimeline";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const HealingHistory = () => {
  const { data: entries, isLoading } = useHealingHistory();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const stats = entries ? {
    totalAnalyses: entries.length,
    averageScore: Math.round(entries.reduce((acc, e) => acc + e.progress_score, 0) / entries.length),
    latestStage: entries[0]?.healing_stage || "N/A",
    improvement: entries.length >= 2 
      ? entries[0].progress_score - entries[entries.length - 1].progress_score 
      : 0
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/healing-tracker">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tracker
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">My Healing Journey</h1>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {!entries || entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No healing progress recorded yet</p>
                <Link to="/healing-tracker">
                  <Button>Start Your First Analysis</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Total Analyses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats?.totalAnalyses}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{stats?.averageScore}/100</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Current Stage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="text-sm">{stats?.latestStage}</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${stats && stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats && stats.improvement >= 0 ? '+' : ''}{stats?.improvement}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Chart */}
              {entries.length > 1 && <HealingProgressChart entries={entries} />}

              {/* Photo Timeline */}
              <HealingPhotoTimeline entries={entries} />

              {/* History Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <HealingHistoryCard
                        key={entry.id}
                        entry={entry}
                        onClick={() => setSelectedEntry(entry)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detailed Analysis - {selectedEntry && format(new Date(selectedEntry.created_at), "MMMM dd, yyyy 'at' h:mm a")}
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              <img
                src={selectedEntry.photo_url}
                alt="Full analysis"
                className="w-full rounded-lg"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Healing Stage</p>
                  <Badge className="text-base">{selectedEntry.healing_stage}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Progress Score</p>
                  <p className="text-3xl font-bold text-primary">{selectedEntry.progress_score}/100</p>
                </div>
              </div>

              {selectedEntry.analysis_result && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Summary</p>
                    <p className="text-muted-foreground">{selectedEntry.analysis_result.summary}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {selectedEntry.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedEntry.analysis_result.risk_factors && selectedEntry.analysis_result.risk_factors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-red-600">Risk Factors</p>
                      <ul className="list-disc list-inside space-y-1 text-red-600">
                        {selectedEntry.analysis_result.risk_factors.map((risk: string, idx: number) => (
                          <li key={idx}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEntry.analysis_result.product_recommendations && (
                    <div>
                      <p className="text-sm font-medium mb-2">Recommended Products</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {selectedEntry.analysis_result.product_recommendations.map((product: string, idx: number) => (
                          <li key={idx}>{product}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealingHistory;
