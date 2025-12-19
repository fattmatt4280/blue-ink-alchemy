import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Calendar, Award, AlertCircle, FileText, FolderArchive, Plus, GitCompare } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useHealingHistory } from "@/hooks/useHealingHistory";
import { HealingHistoryCard } from "@/components/HealingHistoryCard";
import { HealingPhotoTimeline } from "@/components/HealingPhotoTimeline";
import { HealingPhotoComparison } from "@/components/HealingPhotoComparison";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { generateSingleEntryReport, generateCompleteReport, downloadHtmlReport } from "@/utils/healingReportExport";
import { useToast } from "@/hooks/use-toast";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";

const NEON_CYAN = "#00f5ff";
const NEON_BLUE = "#3b82f6";

const HealingHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: entries, isLoading } = useHealingHistory();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  // Check if user was just redirected from new analysis
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === 'true') {
      toast({
        title: "Analysis Complete!",
        description: "Your latest healing analysis is shown below.",
      });
      // Remove query param from URL
      window.history.replaceState({}, '', '/healing-history');
    }
  }, [toast]);

  const stats = entries ? {
    totalAnalyses: entries.length,
    latestStage: entries[0]?.healing_stage || "N/A",
  } : null;

  const handleExportSingle = () => {
    if (!selectedEntry) return;
    
    try {
      const html = generateSingleEntryReport(selectedEntry);
      const dateStr = format(new Date(selectedEntry.created_at), "MM-dd-yyyy");
      const title = selectedEntry.tattoo_title || 'Tattoo';
      const filename = `${title.replace(/\s+/g, '-')}-${dateStr}.html`;
      downloadHtmlReport(html, filename);
      toast({
        title: "Report Downloaded",
        description: "Your healing analysis report has been downloaded successfully.",
      });
      setExportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportAll = () => {
    if (!entries || entries.length === 0) return;
    
    try {
      const html = generateCompleteReport(entries);
      const filename = `healing-journey-complete-${format(new Date(), "yyyy-MM-dd")}.html`;
      downloadHtmlReport(html, filename);
      toast({
        title: "Complete Report Downloaded",
        description: `Successfully exported ${entries.length} healing analysis entries.`,
      });
      setExportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate the complete report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show auth check before loading state
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen futuristic-bg py-20 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="neon-orb w-96 h-96 top-20 -left-48 animate-float-1" style={{ background: `radial-gradient(circle, ${NEON_CYAN}15 0%, transparent 70%)` }} />
          <div className="neon-orb w-64 h-64 bottom-40 right-10 animate-float-3" style={{ background: `radial-gradient(circle, ${NEON_BLUE}15 0%, transparent 70%)` }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto">
            <Card className="neon-card">
              <CardHeader>
                <CardTitle className="font-rajdhani text-cyan-400">Authentication Required</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-cyan-500/30 bg-cyan-500/5">
                  <AlertCircle className="h-4 w-4 text-cyan-400" style={{ filter: `drop-shadow(0 0 4px ${NEON_CYAN})` }} />
                  <AlertDescription className="flex items-center justify-between text-foreground/80">
                    <span>Please sign in to view your healing history</span>
                    <Button 
                      onClick={() => navigate('/auth')} 
                      size="sm"
                      className="ml-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-[0_0_15px_rgba(0,245,255,0.3)]"
                    >
                      Sign In
                    </Button>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen futuristic-bg py-20 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="neon-orb w-96 h-96 top-20 -left-48 animate-float-1" style={{ background: `radial-gradient(circle, ${NEON_CYAN}15 0%, transparent 70%)` }} />
          <div className="neon-orb w-64 h-64 bottom-40 right-10 animate-float-3" style={{ background: `radial-gradient(circle, ${NEON_BLUE}15 0%, transparent 70%)` }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-cyan-500/20 rounded w-1/4"></div>
              <div className="h-48 bg-cyan-500/10 rounded"></div>
              <div className="h-96 bg-cyan-500/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen futuristic-bg relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="neon-orb w-96 h-96 top-20 -left-48 animate-float-1" style={{ background: `radial-gradient(circle, ${NEON_CYAN}15 0%, transparent 70%)` }} />
        <div className="neon-orb w-80 h-80 top-1/3 right-0 animate-float-2" style={{ background: `radial-gradient(circle, ${NEON_BLUE}12 0%, transparent 70%)` }} />
        <div className="neon-orb w-64 h-64 bottom-40 left-1/4 animate-float-3" style={{ background: `radial-gradient(circle, ${NEON_CYAN}10 0%, transparent 70%)` }} />
      </div>
      
      <AppHeader backUrl="/healing-tracker" />
      <div className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-rajdhani bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent" style={{ textShadow: `0 0 30px ${NEON_CYAN}40` }}>
              My Healing Journey
            </h1>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/healing-tracker')}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-[0_0_15px_rgba(0,245,255,0.3)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowComparison(true)}
                disabled={!entries || entries.length < 2}
                className="border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-cyan-400"
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Compare Photos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setExportDialogOpen(true)}
                disabled={!entries || entries.length === 0}
                className="border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-cyan-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {!entries || entries.length === 0 ? (
            <Card className="neon-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No healing progress recorded yet</p>
                <Link to="/healing-tracker">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-[0_0_15px_rgba(0,245,255,0.3)]">
                    Start Your First Analysis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="neon-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 font-rajdhani text-cyan-400">
                      <Calendar className="w-4 h-4 text-cyan-400" style={{ filter: `drop-shadow(0 0 4px ${NEON_CYAN})` }} />
                      Total Analyses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold font-rajdhani text-cyan-300" style={{ textShadow: `0 0 15px ${NEON_CYAN}60` }}>{stats?.totalAnalyses}</p>
                  </CardContent>
                </Card>

                <Card className="neon-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 font-rajdhani text-cyan-400">
                      <Award className="w-4 h-4 text-cyan-400" style={{ filter: `drop-shadow(0 0 4px ${NEON_CYAN})` }} />
                      Current Stage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,245,255,0.3)]">{stats?.latestStage}</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Latest Analysis - Full Display */}
              {entries[0] && (
                <Card className="neon-card ring-2 ring-cyan-500/50 shadow-[0_0_30px_rgba(0,245,255,0.2)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-rajdhani text-cyan-400">Latest Analysis</CardTitle>
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_10px_rgba(0,245,255,0.4)]">
                        ✨ Most Recent
                      </Badge>
                    </div>
                    <p className="text-sm text-cyan-300/60">
                      {format(new Date(entries[0].created_at), "MMMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Photo */}
                    <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-lg border border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.15)]">
                      <img
                        src={entries[0].photo_url}
                        alt="Latest healing progress"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Healing Stage */}
                    <div>
                      <Badge className="text-base px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                        {entries[0].healing_stage}
                      </Badge>
                      {entries[0].analysis_result?.tattooAgeDays && (
                        <Badge variant="outline" className="ml-2 border-cyan-500/30 text-cyan-400">
                          Day {entries[0].analysis_result.tattooAgeDays}
                        </Badge>
                      )}
                    </div>

                    {/* Personal Greeting */}
                    {entries[0].analysis_result?.personalGreeting && (
                      <Card className="neon-card bg-cyan-500/5">
                        <CardContent className="pt-6">
                          <p className="text-sm leading-relaxed text-foreground/80">{entries[0].analysis_result.personalGreeting}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Tattoo Description */}
                    {entries[0].analysis_result?.tattooDescription && (
                      <Card className="neon-card">
                        <CardHeader>
                          <CardTitle className="text-base font-rajdhani text-cyan-400">Your Tattoo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed text-foreground/80">{entries[0].analysis_result.tattooDescription}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Summary */}
                    {entries[0].analysis_result?.summary && (
                      <Card className="neon-card">
                        <CardHeader>
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-base font-rajdhani text-cyan-400">Analysis Summary</CardTitle>
                            <TextToSpeechButton 
                              text={(() => {
                                const entry = entries[0];
                                return [
                                  entry.analysis_result?.personalGreeting,
                                  entry.analysis_result?.tattooDescription,
                                  entry.analysis_result?.summary,
                                  entry.analysis_result?.visualAssessment?.colorAssessment && `Color Assessment: ${entry.analysis_result.visualAssessment.colorAssessment}`,
                                  entry.analysis_result?.visualAssessment?.textureAssessment && `Texture Assessment: ${entry.analysis_result.visualAssessment.textureAssessment}`,
                                  entry.analysis_result?.visualAssessment?.overallCondition && `Overall Condition: ${entry.analysis_result.visualAssessment.overallCondition}`,
                                  entry.recommendations?.length > 0 && `Recommendations: ${entry.recommendations.join('. ')}`,
                                  entry.analysis_result?.riskFactorsWithEvidence?.length > 0 && `Important Medical Information: ${entry.analysis_result.riskFactorsWithEvidence.map((r: any) => r.concern).join('. ')}`,
                                  entry.analysis_result?.productRecommendations?.length > 0 && `Product Recommendations: ${entry.analysis_result.productRecommendations.join('. ')}`
                                ].filter(Boolean).join('. ');
                              })()} 
                              label="Listen to Full Analysis"
                            />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed text-foreground/80">{entries[0].analysis_result.summary}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Visual Assessment */}
                    {entries[0].analysis_result?.visualAssessment && (
                      <Card className="neon-card">
                        <CardHeader>
                          <CardTitle className="text-base font-rajdhani text-cyan-400">Visual Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {entries[0].analysis_result.visualAssessment.colorAssessment && (
                            <div>
                              <div className="font-medium text-sm mb-1 text-blue-400">Color Assessment</div>
                              <p className="text-sm text-foreground/70 leading-relaxed">
                                {entries[0].analysis_result.visualAssessment.colorAssessment}
                              </p>
                            </div>
                          )}
                          {entries[0].analysis_result.visualAssessment.textureAssessment && (
                            <div>
                              <div className="font-medium text-sm mb-1 text-blue-400">Texture Assessment</div>
                              <p className="text-sm text-foreground/70 leading-relaxed">
                                {entries[0].analysis_result.visualAssessment.textureAssessment}
                              </p>
                            </div>
                          )}
                          {entries[0].analysis_result.visualAssessment.overallCondition && (
                            <div>
                              <div className="font-medium text-sm mb-1 text-blue-400">Overall Condition</div>
                              <p className="text-sm text-foreground/70 leading-relaxed">
                                {entries[0].analysis_result.visualAssessment.overallCondition}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {entries[0].recommendations && entries[0].recommendations.length > 0 && (
                      <Card className="neon-card">
                        <CardHeader>
                          <CardTitle className="text-base font-rajdhani text-cyan-400">Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-2">
                            {entries[0].recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-sm leading-relaxed text-foreground/80">{rec}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Risk Factors with Evidence */}
                    {entries[0].analysis_result?.riskFactorsWithEvidence && 
                     entries[0].analysis_result.riskFactorsWithEvidence.length > 0 && (
                      <Card className="neon-card border-orange-500/30 bg-orange-500/5">
                        <CardHeader>
                          <CardTitle className="text-orange-400 flex items-center gap-2 font-rajdhani">
                            <AlertCircle className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px #f97316)' }} />
                            Medical Assessment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {entries[0].analysis_result.riskFactorsWithEvidence.map((risk: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                              <h4 className="font-semibold text-sm text-orange-300">{risk.concern}</h4>
                              {risk.symptoms && risk.symptoms.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-foreground/60 mb-1">Observed Symptoms:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {risk.symptoms.map((symptom: string, sIdx: number) => (
                                      <li key={sIdx} className="text-sm text-foreground/80">{symptom}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {risk.medicalReference && (
                                <div className="mt-3 p-3 bg-black/30 rounded-lg border border-cyan-500/20 space-y-2">
                                  <p className="text-xs font-semibold text-cyan-400">Medical Reference:</p>
                                  <p className="text-sm font-medium text-foreground/80">{risk.medicalReference.source}</p>
                                  {risk.medicalReference.keyQuote && (
                                    <blockquote className="text-sm italic border-l-2 border-cyan-500 pl-3 text-foreground/70">
                                      "{risk.medicalReference.keyQuote}"
                                    </blockquote>
                                  )}
                                  {risk.medicalReference.url && (
                                    <a 
                                      href={risk.medicalReference.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-cyan-400 hover:underline inline-flex items-center gap-1"
                                    >
                                      View Source →
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Product Recommendations */}
                    {entries[0].analysis_result?.productRecommendations && 
                     entries[0].analysis_result.productRecommendations.length > 0 && (
                      <Card className="neon-card">
                        <CardHeader>
                          <CardTitle className="text-base font-rajdhani text-cyan-400">Product Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-2">
                            {entries[0].analysis_result.productRecommendations.map((product: string, idx: number) => (
                              <li key={idx} className="text-sm leading-relaxed text-foreground/80">{product}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Photo Comparison */}
            {showComparison && entries && (
              <HealingPhotoComparison 
                entries={entries} 
                onClose={() => setShowComparison(false)} 
              />
            )}

            {/* Photo Comparison */}
            {showComparison && entries && (
              <HealingPhotoComparison 
                entries={entries} 
                onClose={() => setShowComparison(false)} 
              />
            )}

            {/* Photo Timeline */}
            <HealingPhotoTimeline entries={entries} />

              {/* History Cards - Show remaining entries */}
              {entries.length > 1 && (
                <Card className="neon-card">
                  <CardHeader>
                    <CardTitle className="font-rajdhani text-cyan-400">Previous Analyses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {entries.slice(1).map((entry) => (
                        <HealingHistoryCard
                          key={entry.id}
                          entry={entry}
                          isLatest={false}
                          onClick={() => setSelectedEntry(entry)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Export Options Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900/95 border-cyan-500/30 shadow-[0_0_30px_rgba(0,245,255,0.15)]">
          <DialogHeader>
            <DialogTitle className="font-rajdhani text-cyan-400">Export Healing Report</DialogTitle>
            <DialogDescription className="text-foreground/60">
              Choose what you'd like to export. Reports are downloaded as HTML files that can be viewed in your browser or saved as PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedEntry && (
              <Button
                onClick={handleExportSingle}
                className="w-full justify-start border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-cyan-400"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Current Analysis
                <span className="ml-auto text-xs text-cyan-300/60">
                  ({format(new Date(selectedEntry.created_at), "MMM dd")})
                </span>
              </Button>
            )}
            <Button
              onClick={handleExportAll}
              className="w-full justify-start border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-cyan-400"
              variant="outline"
            >
              <FolderArchive className="w-4 h-4 mr-2" />
              Export Complete History
              <span className="ml-auto text-xs text-cyan-300/60">
                ({entries?.length || 0} {entries?.length === 1 ? 'entry' : 'entries'})
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-slate-900/95 border-cyan-500/30 shadow-[0_0_30px_rgba(0,245,255,0.15)]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-rajdhani text-cyan-400">
              Detailed Analysis - {selectedEntry && format(new Date(selectedEntry.created_at), "MMMM dd, yyyy 'at' h:mm a")}
            </DialogTitle>
          </DialogHeader>
          
          {/* Scrollable content wrapper */}
          <div className="overflow-y-scroll flex-1 -mx-6 px-6 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            {selectedEntry && (
              <div className="space-y-6 pb-4">
                <div className="relative aspect-square overflow-hidden rounded-lg border border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.15)]">
                  <img
                    src={selectedEntry.photo_url}
                    alt="Healing progress"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-6">
                  <div>
                    <Badge className="text-base px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                      {selectedEntry.healing_stage}
                    </Badge>
                  </div>

                  {selectedEntry.analysis_result?.summary && (
                    <Card className="neon-card">
                      <CardHeader>
                        <CardTitle className="font-rajdhani text-cyan-400">Analysis Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-foreground/80">{selectedEntry.analysis_result.summary}</p>
                        {selectedEntry.analysis_result?.tattooAgeDays && (
                          <Badge variant="outline" className="mt-3 border-cyan-500/30 text-cyan-400">
                            Tattoo Age: {selectedEntry.analysis_result.tattooAgeDays} days
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {!selectedEntry.analysis_result?.summary && (
                    <Card className="neon-card">
                      <CardHeader>
                        <CardTitle className="font-rajdhani text-cyan-400">Analysis Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-foreground/80">
                          Assessed stage: {selectedEntry.healing_stage}. 
                          {selectedEntry.analysis_result?.concerns && selectedEntry.analysis_result.concerns !== 'None' 
                            ? ` ${selectedEntry.analysis_result.concerns}` 
                            : ' No major concerns observed.'}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {selectedEntry.recommendations && selectedEntry.recommendations.length > 0 && (
                    <Card className="neon-card">
                      <CardHeader>
                        <CardTitle className="font-rajdhani text-cyan-400">Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-2">
                          {selectedEntry.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm leading-relaxed text-foreground/80">{rec}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {selectedEntry.analysis_result?.risk_factors && (
                    <Card className="neon-card border-orange-500/30 bg-orange-500/5">
                      <CardHeader>
                        <CardTitle className="text-orange-400 flex items-center gap-2 font-rajdhani">
                          <span>⚠️</span> Risk Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-foreground/80">{selectedEntry.analysis_result.risk_factors}</p>
                      </CardContent>
                    </Card>
                  )}

                  {selectedEntry.analysis_result?.visual_assessment && (
                    <Card className="neon-card">
                      <CardHeader>
                        <CardTitle className="font-rajdhani text-cyan-400">Visual Assessment</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedEntry.analysis_result.visual_assessment.color_assessment && (
                          <div>
                            <div className="font-medium text-sm mb-1 text-blue-400">Color Assessment</div>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                              {selectedEntry.analysis_result.visual_assessment.color_assessment}
                            </p>
                          </div>
                        )}
                        {selectedEntry.analysis_result.visual_assessment.texture_assessment && (
                          <div>
                            <div className="font-medium text-sm mb-1 text-blue-400">Texture Assessment</div>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                              {selectedEntry.analysis_result.visual_assessment.texture_assessment}
                            </p>
                          </div>
                        )}
                        {selectedEntry.analysis_result.visual_assessment.overall_condition && (
                          <div>
                            <div className="font-medium text-sm mb-1 text-blue-400">Overall Condition</div>
                            <p className="text-sm text-foreground/70 leading-relaxed">
                              {selectedEntry.analysis_result.visual_assessment.overall_condition}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {selectedEntry.analysis_result?.product_recommendations && 
                   selectedEntry.analysis_result.product_recommendations.length > 0 && (
                    <Card className="neon-card">
                      <CardHeader>
                        <CardTitle className="font-rajdhani text-cyan-400">Product Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-2">
                          {selectedEntry.analysis_result.product_recommendations.map((product: string, idx: number) => (
                            <li key={idx} className="text-sm leading-relaxed text-foreground/80">{product}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealingHistory;
