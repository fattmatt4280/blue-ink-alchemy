import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, TrendingUp, Calendar, AlertCircle, History, ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MultipleImageUpload from "@/components/MultipleImageUpload";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProductGrid } from "@/hooks/useProductGrid";
import ProductCard from "@/components/ProductCard";
import CartDialog from "@/components/CartDialog";
import { Checkbox } from "@/components/ui/checkbox";
import Footer from "@/components/Footer";
import HealingQADialog from "@/components/HealingQADialog";
import { MessageCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  category: string;
  icon: string;
  context?: string;
}

interface AnalysisResult {
  personalGreeting?: string;
  tattooDescription?: string;
  healingStage: string;
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
  suggestedQuestions?: Question[];
}

const HealingTracker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { products, loading: productsLoading, cartDialogOpen, selectedProductName, setCartDialogOpen, handleAddToCart, handleProductView } = useProductGrid();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [tattooAge, setTattooAge] = useState<string>("");
  const [cleanedWithAlcohol, setCleanedWithAlcohol] = useState<string>("");
  const [coveringType, setCoveringType] = useState<string>("");
  const [aftercareProducts, setAftercareProducts] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");
  const [tosAccepted, setTosAccepted] = useState<boolean>(false);
  const [qaDialogOpen, setQaDialogOpen] = useState(false);
  const [savedHealingProgressId, setSavedHealingProgressId] = useState<string | null>(null);

  const handleImagesUploaded = (urls: string[]) => {
    try {
      setUploadedImages(urls);
      setAnalysis(null);
      setTosAccepted(false);
    } catch (error) {
      console.error('Error updating images state:', error);
    }
  };

  const analyzeProgress = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "No images uploaded",
        description: "Please upload at least one photo of your tattoo first.",
        variant: "destructive",
      });
      return;
    }

    if (!tattooAge || !cleanedWithAlcohol || !coveringType || !aftercareProducts || !allergies) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including tattoo age, aftercare details, and allergy information.",
        variant: "destructive",
      });
      return;
    }

    if (!tosAccepted) {
      toast({
        title: "Terms of Service Required",
        description: "Please accept the Terms of Service to continue.",
        variant: "destructive",
      });
      return;
    }

    if (isAnalyzing) return; // Prevent double-clicking

    try {
      setIsAnalyzing(true);
      
      // Fetch user's previous healing progress entries for historical context
      let previousAnalyses = [];
      let userName = 'there';
      
      if (user) {
        // Get user's name from email or metadata
        userName = user.user_metadata?.first_name || 
                   user.email?.split('@')[0]?.split('.')[0] || 
                   'there';
        
        // Fetch last 5 healing progress entries
        const { data: previousEntries } = await supabase
          .from('healing_progress')
          .select('created_at, healing_stage, progress_score, analysis_result')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        // Format for AI context
        if (previousEntries && previousEntries.length > 0) {
          previousAnalyses = previousEntries.map(entry => ({
            date: entry.created_at,
            stage: entry.healing_stage,
            score: entry.progress_score,
            summary: typeof entry.analysis_result === 'object' && entry.analysis_result !== null 
              ? (entry.analysis_result as any)?.summary || '' 
              : ''
          }));
        }
      }
      
      const { data, error } = await supabase.functions.invoke('analyze-healing-progress', {
        body: {
          imageUrls: uploadedImages,
          primaryImageUrl: uploadedImages[0],
          tattooAge: tattooAge ? parseInt(tattooAge) : null,
          cleanedWithAlcohol,
          coveringType,
          aftercareProducts,
          allergies,
          previousAnalyses,
          userName,
          userId: user?.id || null,
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
            const { data: progressData } = await supabase
              .from('healing_progress')
              .insert({
                photo_url: uploadedImages[0],
                photo_urls: uploadedImages,
                analysis_result: data.analysis,
                healing_stage: data.analysis.healingStage,
                recommendations: data.analysis.recommendations,
                progress_score: 0,
                user_id: userData.user.id,
              })
              .select()
              .single();
            
            if (progressData) {
              setSavedHealingProgressId(progressData.id);
            }
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
                Healyn
              </h1>
              <p className="text-muted-foreground">
                Your AI tattoo healing assistant by Blue Dream Budder
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
                  Take clear, well-lit photos of your tattoo for AI analysis
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
                  <MultipleImageUpload
                    onImagesUploaded={handleImagesUploaded}
                    currentImages={uploadedImages}
                    title="Tattoo Photos"
                    description="Upload multiple photos from different angles (up to 10 images)"
                    bucket="healing-photos"
                    maxImages={10}
                  />
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tattoo Age (Required) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="How many days old is your tattoo?"
                      value={tattooAge}
                      onChange={(e) => setTattooAge(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      min="0"
                      max="365"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Did the artist clean with alcohol afterward? <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={cleanedWithAlcohol}
                      onChange={(e) => setCleanedWithAlcohol(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      required
                    >
                      <option value="">Select an option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="unknown">I don't know</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      What was the tattoo covered with? <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={coveringType}
                      onChange={(e) => setCoveringType(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      required
                    >
                      <option value="">Select an option</option>
                      <option value="dermal-covering">Dermal covering (2nd skin plastic - Tegaderm, Saniderm, etc.)</option>
                      <option value="plastic-wrap">Plastic wrap</option>
                      <option value="paper-towel">Paper towel</option>
                      <option value="nothing">Nothing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      How have you been taking care of it? What products are you using? <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      placeholder="e.g., Aquaphor twice daily, washing with antibacterial soap, using Blue Dream Budder, etc."
                      value={aftercareProducts}
                      onChange={(e) => setAftercareProducts(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md min-h-[80px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Do you have any allergies? <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      placeholder="List any allergies (medications, topical products, environmental, etc.) or write 'None'"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md min-h-[60px]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 border border-border rounded-md bg-muted/50">
                  <Checkbox 
                    id="tos-acceptance"
                    checked={tosAccepted}
                    onCheckedChange={(checked) => setTosAccepted(checked === true)}
                  />
                  <label 
                    htmlFor="tos-acceptance" 
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link 
                      to="/terms-of-service" 
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      Terms of Service
                    </Link>
                    {" "}and understand that Healyn is for informational 
                    purposes only and does not replace medical advice.
                  </label>
                </div>

                <Button
                  onClick={analyzeProgress}
                  disabled={uploadedImages.length === 0 || isAnalyzing || !user || !tattooAge || !cleanedWithAlcohol || !coveringType || !aftercareProducts || !allergies || !tosAccepted}
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
                {/* Personalized Greeting & Tattoo Description */}
                <Card className="neon-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">
                          {analysis.personalGreeting || 'Healing Progress Assessment'}
                        </CardTitle>
                        {analysis.tattooDescription && (
                          <CardDescription className="text-base">
                            {analysis.tattooDescription}
                          </CardDescription>
                        )}
                      </div>
                      <Badge className={`${getStageColor(analysis.healingStage)} text-lg px-4 py-2 ml-4`}>
                        {analysis.healingStage}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {tattooAge && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Tattoo Age: {tattooAge} days</span>
                      </div>
                    )}

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

                {/* Follow-Up Questions Button */}
                {analysis.suggestedQuestions && analysis.suggestedQuestions.length > 0 && (
                  <Button
                    onClick={() => setQaDialogOpen(true)}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ask Follow-Up Questions
                  </Button>
                )}

                {/* Product Recommendations */}
                {analysis.productRecommendations && analysis.productRecommendations.length > 0 && (
                  <Card className="neon-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Recommended Products
                      </CardTitle>
                      <CardDescription>
                        Our Blue Dream Budder products to help your healing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!productsLoading && products.length > 0 && (
                        <div className="flex justify-center">
                          {products.slice(0, 1).map((product) => (
                            <Card key={product.id} className="max-w-xs border-2 border-muted hover:border-primary/50 transition-colors">
                              <CardContent className="p-4 space-y-3">
                                <div className="aspect-square relative overflow-hidden rounded-lg">
                                  <img 
                                    src={product.image_url || '/placeholder.svg'} 
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-base">{product.name}</h5>
                                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                                  <p className="text-lg font-bold text-primary mt-2">${product.price}</p>
                                </div>
                                <Button
                                  onClick={() => handleAddToCart(product)}
                                  className="w-full"
                                  size="sm"
                                >
                                  Add to Cart
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          Emergency Care Products
                        </h4>
                        <p className="text-xs text-muted-foreground mb-4">
                          For infections or allergic reactions - seek medical advice if symptoms persist
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Card className="border-2 border-muted">
                            <CardContent className="p-4 space-y-2">
                              <h5 className="font-medium text-sm">Dial Antibacterial Soap</h5>
                              <p className="text-xs text-muted-foreground">For infection prevention & cleaning</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open('https://amzn.to/3Krva3p', '_blank')}
                              >
                                View on Amazon
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-2 border-muted">
                            <CardContent className="p-4 space-y-2">
                              <h5 className="font-medium text-sm">Benadryl Topical Spray</h5>
                              <p className="text-xs text-muted-foreground">For allergic reactions & itching</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open('https://amzn.to/4nwJR3v', '_blank')}
                              >
                                View on Amazon
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                            </CardContent>
                          </Card>

                          <Card className="border-2 border-muted">
                            <CardContent className="p-4 space-y-2">
                              <h5 className="font-medium text-sm">Hustle Bubbles</h5>
                              <p className="text-xs text-muted-foreground">Gentle tattoo cleanser</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open('https://amzn.to/48f5e4L', '_blank')}
                              >
                                View on Amazon
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => navigate('/shop')}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        View All Products
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Branding Footer */}
                <div className="flex items-center justify-center gap-2 py-4 px-6 rounded-lg bg-muted/50 border border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      AI Analysis Powered by
                    </p>
                    <p className="text-sm font-semibold gradient-text">
                      Healyn™ by Blue Dream Budder
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <Card className="neon-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload photos and click "Analyze" to see your healing progress assessment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <CartDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        productName={selectedProductName}
      />

      {analysis && analysis.suggestedQuestions && (
        <HealingQADialog
          open={qaDialogOpen}
          onOpenChange={setQaDialogOpen}
          analysisContext={analysis}
          userName={user?.user_metadata?.first_name || user?.email?.split('@')[0]?.split('.')[0] || 'there'}
          userId={user?.id}
          healingProgressId={savedHealingProgressId || undefined}
          initialQuestions={analysis.suggestedQuestions}
        />
      )}

      <Footer />
    </div>
  );
};

export default HealingTracker;
