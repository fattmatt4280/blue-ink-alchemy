import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, TrendingUp, Calendar, AlertCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AnalysisResult {
  healingStage: string;
  progressScore: number;
  visualAssessment: {
    colorAssessment?: string;
    textureAssessment?: string;
    overallCondition?: string;
  };
  recommendations: string[];
  riskFactors?: string[];
  productRecommendations?: string[];
  summary: string;
  tattooAgeDays?: number | null;
}

const HealingTracker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [tattooAge, setTattooAge] = useState<string>("");

  const handleImageUploaded = (url: string) => {
    try {
      setUploadedImage(url);
      setAnalysis(null);
    } catch (error) {
      console.error('Error updating image state:', error);
    }
  };

  const analyzeProgress = async () => {
    if (!uploadedImage) {
      toast({
        title: "No image uploaded",
        description: "Please upload a photo of your tattoo first.",
        variant: "destructive",
      });
      return;
    }

    if (isAnalyzing) return; // Prevent double-clicking

    try {
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-healing-progress', {
        body: {
          imageUrl: uploadedImage,
          tattooAge: tattooAge ? parseInt(tattooAge) : null,
        }
      });

      if (error) {
        console.error('Function invocation error:', error);
        // Gracefully handle normalized HTTP errors
        // @ts-ignore - supabase error may include status
        const status = (error as any)?.status;
        if (status === 402) {
          toast({
            title: "Service Temporarily Unavailable",
            description: "The AI analysis service needs to be topped up. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        if (status === 429) {
          toast({
            title: "Please Wait",
            description: "Too many requests. Please wait a few minutes and try again.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // Handle specific error cases from the edge function
      if (!data.success) {
        if (data.error === 'insufficient_credits') {
          toast({
            title: "Service Temporarily Unavailable",
            description: data.userMessage || "The AI analysis service needs to be recharged. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        if (data.error === 'rate_limit_exceeded') {
          toast({
            title: "Please Wait",
            description: data.userMessage || "Too many requests. Please wait a few minutes and try again.",
            variant: "destructive",
          });
          return;
        }

        if (data.error === 'ai_gateway_error') {
          toast({
            title: "AI Service Issue",
            description: data.userMessage || "The AI service had a temporary issue. Please try again shortly.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(data.message || 'Analysis failed');
      }

      if (data.success && data.analysis) {
        // Update analysis state first
        setAnalysis(data.analysis);

        // Then save to database (don't block on this)
        try {
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData.user) {
            await supabase
              .from('healing_progress')
              .insert({
                photo_url: uploadedImage,
                analysis_result: data.analysis,
                healing_stage: data.analysis.healingStage,
                recommendations: data.analysis.recommendations,
                progress_score: data.analysis.progressScore,
                user_id: userData.user.id,
              });
          }
        } catch (dbError) {
          console.error('Failed to save analysis:', dbError);
          // Don't fail the whole operation if DB save fails
        }

        toast({
          title: "Analysis Complete!",
          description: "Your tattoo healing progress has been assessed.",
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis(null);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'fresh': return 'bg-red-500';
      case 'peeling': return 'bg-yellow-500';
      case 'settling': return 'bg-blue-500';
      case 'healed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen futuristic-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="neon-border"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Tattoo Healing Tracker
              </h1>
              <p className="text-muted-foreground">
                AI-powered healing progress assessment for your tattoo aftercare journey
              </p>
            </div>
          </div>
          {user && (
            <Link to="/healing-history">
              <Button variant="outline" className="neon-border">
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </Link>
          )}
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 neon-border">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This AI assessment is for informational purposes only. Always consult with your tattoo artist or healthcare provider for serious concerns.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Tattoo Photo
                </CardTitle>
                <CardDescription>
                  Take a clear, well-lit photo of your tattoo for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!loading && !user ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Please sign in to upload and track your healing progress</span>
                      <Button 
                        onClick={() => navigate('/auth')} 
                        size="sm"
                        className="ml-4"
                      >
                        Sign In
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    currentImage={uploadedImage}
                    title="Tattoo Photo"
                    description="Upload a clear photo showing the entire tattoo"
                    bucket="healing-photos"
                  />
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tattoo Age (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="How many days old is your tattoo?"
                    value={tattooAge}
                    onChange={(e) => setTattooAge(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md"
                  />
                </div>

                <Button
                  onClick={analyzeProgress}
                  disabled={!uploadedImage || isAnalyzing || !user}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analyze Healing Progress
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Educational Tips */}
            <Card className="neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Healing Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                  <div>
                    <p className="font-medium">Days 0-3: Fresh</p>
                    <p className="text-sm text-muted-foreground">Redness, swelling, oozing plasma</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                  <div>
                    <p className="font-medium">Days 4-14: Peeling</p>
                    <p className="text-sm text-muted-foreground">Scabbing, flaking, itching</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="font-medium">Days 15-30: Settling</p>
                    <p className="text-sm text-muted-foreground">Colors settle, skin regenerates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="font-medium">30+ Days: Healed</p>
                    <p className="text-sm text-muted-foreground">Fully healed, ready for touch-ups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Progress Score */}
                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle>Healing Progress Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(analysis.progressScore)}`}>
                        {analysis.progressScore}/100
                      </div>
                      <p className="text-muted-foreground mt-2">Overall Progress Score</p>
                      {tattooAge && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Tattoo Age: {tattooAge} days
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Healing Stage</span>
                        <Badge className={getStageColor(analysis.healingStage)}>
                          {analysis.healingStage}
                        </Badge>
                      </div>
                      <Progress value={analysis.progressScore} className="h-2" />
                    </div>

                    {analysis.summary && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Analysis Summary</h3>
                        <p className="text-sm leading-relaxed">
                          {analysis.summary}
                        </p>
                      </div>
                    )}

                    {analysis.visualAssessment && Object.keys(analysis.visualAssessment).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Visual Assessment</h3>
                        <div className="space-y-1 text-sm">
                          {analysis.visualAssessment.colorAssessment && (
                            <p><span className="font-medium">Color:</span> {analysis.visualAssessment.colorAssessment}</p>
                          )}
                          {analysis.visualAssessment.textureAssessment && (
                            <p><span className="font-medium">Texture:</span> {analysis.visualAssessment.textureAssessment}</p>
                          )}
                          {analysis.visualAssessment.overallCondition && (
                            <p><span className="font-medium">Overall:</span> {analysis.visualAssessment.overallCondition}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="neon-border">
                  <CardHeader>
                    <CardTitle>Aftercare Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">✓</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Risk Factors */}
                {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                  <Card className="neon-border border-red-500/50">
                    <CardHeader>
                      <CardTitle className="text-red-500">⚠️ Points of Attention</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.riskFactors.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Product Recommendations */}
                {analysis.productRecommendations && analysis.productRecommendations.length > 0 && (
                  <Card className="neon-border">
                    <CardHeader>
                      <CardTitle>Recommended Products</CardTitle>
                      <CardDescription>Blue Dream Budder products for your healing stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.productRecommendations.map((product, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">🌿</span>
                            <span className="text-sm">{product}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => navigate('/shop')}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        Shop Products
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="neon-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a photo and click "Analyze" to see your healing progress assessment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealingTracker;