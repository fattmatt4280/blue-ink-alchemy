import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Calendar, Award, AlertCircle, FileText, FolderArchive, Plus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useHealingHistory } from "@/hooks/useHealingHistory";
import { HealingHistoryCard } from "@/components/HealingHistoryCard";
import { HealingPhotoTimeline } from "@/components/HealingPhotoTimeline";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { generateSingleEntryReport, generateCompleteReport, downloadHtmlReport } from "@/utils/healingReportExport";
import { useToast } from "@/hooks/use-toast";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";

const HealingHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: entries, isLoading } = useHealingHistory();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
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
      const filename = `healing-analysis-${format(new Date(selectedEntry.created_at), "yyyy-MM-dd")}.html`;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Please sign in to view your healing history</span>
                    <Button 
                      onClick={() => navigate('/auth')} 
                      size="sm"
                      className="ml-4"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <AppHeader backUrl="/healing-tracker" />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Healing Journey</h1>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/healing-tracker')}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setExportDialogOpen(true)}
                disabled={!entries || entries.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Award className="w-4 h-4" />
                      Current Stage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="text-sm">{stats?.latestStage}</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Latest Analysis - Full Display */}
              {entries[0] && (
                <Card className="ring-2 ring-primary shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Latest Analysis</CardTitle>
                      <Badge className="bg-primary">
                        ✨ Most Recent
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entries[0].created_at), "MMMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Photo */}
                    <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-lg border">
                      <img
                        src={entries[0].photo_url}
                        alt="Latest healing progress"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Healing Stage */}
                    <div>
                      <Badge className="text-base px-4 py-2">
                        {entries[0].healing_stage}
                      </Badge>
                      {entries[0].analysis_result?.tattooAgeDays && (
                        <Badge variant="outline" className="ml-2">
                          Day {entries[0].analysis_result.tattooAgeDays}
                        </Badge>
                      )}
                    </div>

                    {/* Personal Greeting */}
                    {entries[0].analysis_result?.personalGreeting && (
                      <Card className="bg-primary/5">
                        <CardContent className="pt-6">
                          <p className="text-sm leading-relaxed">{entries[0].analysis_result.personalGreeting}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Tattoo Description */}
                    {entries[0].analysis_result?.tattooDescription && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Your Tattoo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">{entries[0].analysis_result.tattooDescription}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Summary */}
                    {entries[0].analysis_result?.summary && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-base">Analysis Summary</CardTitle>
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
                            />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed">{entries[0].analysis_result.summary}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Visual Assessment */}
                    {entries[0].analysis_result?.visualAssessment && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Visual Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {entries[0].analysis_result.visualAssessment.colorAssessment && (
                            <div>
                              <div className="font-medium text-sm mb-1">Color Assessment</div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {entries[0].analysis_result.visualAssessment.colorAssessment}
                              </p>
                            </div>
                          )}
                          {entries[0].analysis_result.visualAssessment.textureAssessment && (
                            <div>
                              <div className="font-medium text-sm mb-1">Texture Assessment</div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {entries[0].analysis_result.visualAssessment.textureAssessment}
                              </p>
                            </div>
                          )}
                          {entries[0].analysis_result.visualAssessment.overallCondition && (
                            <div>
                              <div className="font-medium text-sm mb-1">Overall Condition</div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {entries[0].analysis_result.visualAssessment.overallCondition}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {entries[0].recommendations && entries[0].recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-2">
                            {entries[0].recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-sm leading-relaxed">{rec}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Risk Factors with Evidence */}
                    {entries[0].analysis_result?.riskFactorsWithEvidence && 
                     entries[0].analysis_result.riskFactorsWithEvidence.length > 0 && (
                      <Card className="border-destructive/50 bg-destructive/5">
                        <CardHeader>
                          <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Medical Assessment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {entries[0].analysis_result.riskFactorsWithEvidence.map((risk: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                              <h4 className="font-semibold text-sm">{risk.concern}</h4>
                              {risk.symptoms && risk.symptoms.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Observed Symptoms:</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {risk.symptoms.map((symptom: string, sIdx: number) => (
                                      <li key={sIdx} className="text-sm">{symptom}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {risk.medicalReference && (
                                <div className="mt-3 p-3 bg-background rounded-lg border space-y-2">
                                  <p className="text-xs font-semibold">Medical Reference:</p>
                                  <p className="text-sm font-medium">{risk.medicalReference.source}</p>
                                  {risk.medicalReference.keyQuote && (
                                    <blockquote className="text-sm italic border-l-2 border-primary pl-3">
                                      "{risk.medicalReference.keyQuote}"
                                    </blockquote>
                                  )}
                                  {risk.medicalReference.url && (
                                    <a 
                                      href={risk.medicalReference.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
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
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Product Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-2">
                            {entries[0].analysis_result.productRecommendations.map((product: string, idx: number) => (
                              <li key={idx} className="text-sm leading-relaxed">{product}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Photo Timeline */}
              <HealingPhotoTimeline entries={entries} />

              {/* History Cards - Show remaining entries */}
              {entries.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Previous Analyses</CardTitle>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Healing Report</DialogTitle>
            <DialogDescription>
              Choose what you'd like to export. Reports are downloaded as HTML files that can be viewed in your browser or saved as PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedEntry && (
              <Button
                onClick={handleExportSingle}
                className="w-full justify-start"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Current Analysis
                <span className="ml-auto text-xs text-muted-foreground">
                  ({format(new Date(selectedEntry.created_at), "MMM dd")})
                </span>
              </Button>
            )}
            <Button
              onClick={handleExportAll}
              className="w-full justify-start"
              variant="outline"
            >
              <FolderArchive className="w-4 h-4 mr-2" />
              Export Complete History
              <span className="ml-auto text-xs text-muted-foreground">
                ({entries?.length || 0} {entries?.length === 1 ? 'entry' : 'entries'})
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <div className="relative aspect-square overflow-hidden rounded-lg border">
                <img
                  src={selectedEntry.photo_url}
                  alt="Healing progress"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <Badge className="text-base px-4 py-2">
                    {selectedEntry.healing_stage}
                  </Badge>
                </div>

                {selectedEntry.analysis_result?.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{selectedEntry.analysis_result.summary}</p>
                      {selectedEntry.analysis_result?.tattooAgeDays && (
                        <Badge variant="outline" className="mt-3">
                          Tattoo Age: {selectedEntry.analysis_result.tattooAgeDays} days
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                )}

                {!selectedEntry.analysis_result?.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        Assessed stage: {selectedEntry.healing_stage}. 
                        {selectedEntry.analysis_result?.concerns && selectedEntry.analysis_result.concerns !== 'None' 
                          ? ` ${selectedEntry.analysis_result.concerns}` 
                          : ' No major concerns observed.'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {selectedEntry.recommendations && selectedEntry.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {selectedEntry.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm leading-relaxed">{rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {selectedEntry.analysis_result?.risk_factors && (
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                      <CardTitle className="text-destructive flex items-center gap-2">
                        <span>⚠️</span> Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{selectedEntry.analysis_result.risk_factors}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedEntry.analysis_result?.visual_assessment && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Visual Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedEntry.analysis_result.visual_assessment.color_assessment && (
                        <div>
                          <div className="font-medium text-sm mb-1">Color Assessment</div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedEntry.analysis_result.visual_assessment.color_assessment}
                          </p>
                        </div>
                      )}
                      {selectedEntry.analysis_result.visual_assessment.texture_assessment && (
                        <div>
                          <div className="font-medium text-sm mb-1">Texture Assessment</div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedEntry.analysis_result.visual_assessment.texture_assessment}
                          </p>
                        </div>
                      )}
                      {selectedEntry.analysis_result.visual_assessment.overall_condition && (
                        <div>
                          <div className="font-medium text-sm mb-1">Overall Condition</div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedEntry.analysis_result.visual_assessment.overall_condition}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedEntry.analysis_result?.product_recommendations && 
                 selectedEntry.analysis_result.product_recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {selectedEntry.analysis_result.product_recommendations.map((product: string, idx: number) => (
                          <li key={idx} className="text-sm leading-relaxed">{product}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealingHistory;
