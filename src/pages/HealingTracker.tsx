import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import { Loader2 } from "lucide-react";

interface AnalysisResult {
  healingStage: string;
  progressScore: number;
  visualAssessment: {
    color?: string;
    redness?: string;
    swelling?: string;
    texture?: string;
    overall?: string;
  };
  recommendations: string[];
  riskFactors: string[];
  productRecommendations: string[];
  summary: string;
}

const HealingTracker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [tattooAge, setTattooAge] = useState<string>("");

  const handleImageUploaded = (url: string) => {
    setUploadedImage(url);
    setAnalysis(null);
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

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-healing-progress', {
        body: {
          imageUrl: uploadedImage,
          tattooAge: tattooAge ? parseInt(tattooAge) : null,
        }
      });

      if (error) throw error;

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);

        // Save to database
        const { error: dbError } = await supabase
          .from('healing_progress')
          .insert({
            photo_url: uploadedImage,
            analysis_result: data.analysis,
            healing_stage: data.analysis.healingStage,
            recommendations: data.analysis.recommendations,
            progress_score: data.analysis.progressScore,
            user_id: (await supabase.auth.getUser()).data.user?.id || null,
          });

        if (dbError) console.error('Failed to save analysis:', dbError);

        toast({
          title: "Analysis Complete!",
          description: "Your tattoo healing progress has been assessed.",
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
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
    if (score >= 8) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen futuristic-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  currentImage={uploadedImage}
                  title="Tattoo Photo"
                  description="Upload a clear photo showing the entire tattoo"
                  bucket="healing-photos"
                />

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
                  disabled={!uploadedImage || isAnalyzing}
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
                        {analysis.progressScore}/10
                      </div>
                      <p className="text-muted-foreground mt-2">Overall Progress Score</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Healing Stage</span>
                        <Badge className={getStageColor(analysis.healingStage)}>
                          {analysis.healingStage}
                        </Badge>
                      </div>
                      <Progress value={analysis.progressScore * 10} className="h-2" />
                    </div>

                    <div>
                      <p className="text-sm leading-relaxed">
                        {analysis.summary}
                      </p>
                    </div>
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