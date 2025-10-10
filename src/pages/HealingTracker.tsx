import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, TrendingUp, Calendar, AlertCircle, ShoppingBag, ExternalLink, BookOpen } from "lucide-react";
import AppHeader from "@/components/AppHeader";
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
import HealAidSubscriptionStatus from "@/components/HealAidSubscriptionStatus";
import { MessageCircle } from "lucide-react";
import { useHealAidSubscription } from "@/hooks/useHealAidSubscription";
import { MedicalReferenceCard } from "@/components/MedicalReferenceCard";
import MedicalSourcesList from "@/components/MedicalSourcesList";

interface Question {
  id: string;
  question: string;
  category: string;
  icon: string;
  context?: string;
}

interface MedicalReference {
  source: string;
  sourceType: 'medical_journal' | 'nhs' | 'mayo_clinic' | 'dermatology_org' | 'clinical_guideline';
  url: string;
  visualExamples?: string[];
  keyQuote: string;
  whenToSeekCare: string;
  evidenceStrength: 'clinical_observation' | 'peer_reviewed' | 'medical_guideline';
}

interface RiskFactorWithEvidence {
  concern: string;
  symptoms: string[];
  severity: 'normal' | 'monitor' | 'concerning' | 'urgent';
  medicalReference?: MedicalReference;
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
  riskFactorsWithEvidence?: RiskFactorWithEvidence[];
  medicalReferencesUsed?: MedicalReference[];
  productRecommendations?: string[];
  summary: string;
  tattooAgeDays?: number | null;
  suggestedQuestions?: Question[];
}

const HealingTracker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const subscription = useHealAidSubscription();
  const { products, loading: productsLoading, cartDialogOpen, selectedProductName, setCartDialogOpen, handleAddToCart, handleProductView } = useProductGrid();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [tattooAge, setTattooAge] = useState<string>("");
  const [cleanedWithAlcohol, setCleanedWithAlcohol] = useState<string>("");
  const [coveringType, setCoveringType] = useState<string>("");
  const [aftercareProducts, setAftercareProducts] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");
  const [hotToTouch, setHotToTouch] = useState<string>("");
  const [feverSymptoms, setFeverSymptoms] = useState<string>("");
  const [sensitiveToTouch, setSensitiveToTouch] = useState<string>("");
  const [hasTenderness, setHasTenderness] = useState<string>("");
  const [visibleRashes, setVisibleRashes] = useState<string>("");
  const [rashDescription, setRashDescription] = useState<string>("");
  const [tosAccepted, setTosAccepted] = useState<boolean>(false);
  const [qaDialogOpen, setQaDialogOpen] = useState(false);
  const [savedHealingProgressId, setSavedHealingProgressId] = useState<string | null>(null);

  // Route protection - redirect if no active subscription
  useEffect(() => {
    if (!loading && !subscription.loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (!subscription.isActive || subscription.daysRemaining <= 0) {
        toast({
          title: "Access Expired",
          description: "Your Heal-AId access has expired. Please activate or upgrade to continue.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    }
  }, [user, loading, subscription, navigate, toast]);

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

    if (!tattooAge || !cleanedWithAlcohol || !coveringType || !aftercareProducts || !allergies || 
        !hotToTouch || !feverSymptoms || !sensitiveToTouch || !hasTenderness || !visibleRashes) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including tattoo age, aftercare details, allergy information, and symptom assessment.",
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
          hotToTouch,
          feverSymptoms,
          sensitiveToTouch,
          hasTenderness,
          visibleRashes,
          rashDescription,
          previousAnalyses,
          userName,
          userId: user?.id || null,
        }
      });

      if (error) {
        console.error('Function invocation error:', error);
        // @ts-ignore - supabase error may include status or message
        const errorMessage = (error as any)?.message || '';
        const status = (error as any)?.status;
        
        // Handle tier-specific limits
        if (errorMessage.includes('trial_limit_reached')) {
          toast({
            title: "Free Trial Limit Reached",
            description: "Your trial includes 1 analysis. View upgrade options in your dashboard.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }
        
        if (errorMessage.includes('daily_limit_reached')) {
          toast({
            title: "Daily Limit Reached",
            description: "Basic tier allows 2 uploads per day. Upgrade to Pro for unlimited access!",
            variant: "destructive",
          });
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }
        
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
                analysis_result: {
                  ...data.analysis,
                  symptoms: {
                    hotToTouch,
                    feverSymptoms,
                    sensitiveToTouch,
                    hasTenderness,
                    visibleRashes,
                    rashDescription
                  }
                },
                healing_stage: data.analysis.healingStage,
                recommendations: data.analysis.recommendations,
                progress_score: 0,
                user_id: userData.user.id,
                hot_to_touch: hotToTouch === 'yes' || hotToTouch === 'slightly',
                fever_symptoms: feverSymptoms === 'yes',
                sensitive_to_touch: sensitiveToTouch === 'very' || sensitiveToTouch === 'moderate',
                has_tenderness: hasTenderness === 'severe' || hasTenderness === 'moderate',
                visible_rashes: visibleRashes === 'yes',
                rash_description: rashDescription || null,
              })
              .select()
              .single();
            
            if (progressData) {
              setSavedHealingProgressId(progressData.id);
              
              // Clear form state
              setUploadedImages([]);
              setTattooAge("");
              setCleanedWithAlcohol("");
              setCoveringType("");
              setAftercareProducts("");
              setAllergies("");
              setHotToTouch("");
              setFeverSymptoms("");
              setSensitiveToTouch("");
              setHasTenderness("");
              setVisibleRashes("");
              setRashDescription("");
              setTosAccepted(false);
              
              // Show success message and redirect
              toast({
                title: "Analysis Complete!",
                description: "Redirecting to your healing history...",
              });
              
              // Redirect to healing history with query param
              setTimeout(() => {
                navigate('/healing-history?new=true');
              }, 1500);
            }
          }
        } catch (dbError) {
          console.error('Failed to save analysis:', dbError);
          // Don't fail the whole operation if DB save fails
        }
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
      <AppHeader />
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">

        {/* Info Alert */}
        <Alert className="mb-6 neon-border">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This AI assessment is for informational purposes only. Always consult with your tattoo artist or healthcare provider for serious concerns.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
            <HealAidSubscriptionStatus />
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
              userId={user?.id}
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

                  {/* Symptom Assessment Section */}
                  <div className="mt-6 p-4 border-2 border-orange-500/30 rounded-lg bg-orange-500/5">
                    <h3 className="text-lg font-semibold mb-3 text-orange-400 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Symptom Check (Important for Infection Detection)
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Hot to Touch */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Is the tattoo area hot to the touch? <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={hotToTouch}
                          onChange={(e) => setHotToTouch(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md"
                          required
                        >
                          <option value="">Select an option</option>
                          <option value="yes">Yes - noticeably warmer than surrounding skin</option>
                          <option value="slightly">Slightly warm</option>
                          <option value="no">No - same temperature as surrounding skin</option>
                        </select>
                      </div>

                      {/* Fever Symptoms */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Are you experiencing any fever symptoms? <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={feverSymptoms}
                          onChange={(e) => setFeverSymptoms(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md"
                          required
                        >
                          <option value="">Select an option</option>
                          <option value="yes">Yes - feeling feverish, chills, or body aches</option>
                          <option value="unsure">Unsure - feeling slightly off</option>
                          <option value="no">No - feeling normal</option>
                        </select>
                      </div>

                      {/* Sensitive to Touch */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Is the tattoo area sensitive or painful to touch? <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={sensitiveToTouch}
                          onChange={(e) => setSensitiveToTouch(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md"
                          required
                        >
                          <option value="">Select an option</option>
                          <option value="very">Yes - very painful when touched</option>
                          <option value="moderate">Moderately sensitive</option>
                          <option value="slight">Slightly sensitive (normal for healing)</option>
                          <option value="no">No - not sensitive</option>
                        </select>
                      </div>

                      {/* Tenderness */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Is there tenderness when pressure is applied? <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={hasTenderness}
                          onChange={(e) => setHasTenderness(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md"
                          required
                        >
                          <option value="">Select an option</option>
                          <option value="severe">Yes - severe tenderness</option>
                          <option value="moderate">Moderate tenderness</option>
                          <option value="mild">Mild tenderness (expected)</option>
                          <option value="no">No tenderness</option>
                        </select>
                      </div>

                      {/* Visible Rashes */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Do you see any rashes around or near the tattoo? <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={visibleRashes}
                          onChange={(e) => setVisibleRashes(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md"
                          required
                        >
                          <option value="">Select an option</option>
                          <option value="yes">Yes - visible rash or bumps</option>
                          <option value="unsure">Maybe - seeing some unusual spots</option>
                          <option value="no">No - no rashes visible</option>
                        </select>
                      </div>

                      {/* Rash Description - Conditional */}
                      {(visibleRashes === "yes" || visibleRashes === "unsure") && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Please describe the rash (location, color, size, pattern)
                          </label>
                          <textarea
                            placeholder="e.g., Small red bumps around the border, itchy raised spots on left side, etc."
                            value={rashDescription}
                            onChange={(e) => setRashDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md min-h-[60px]"
                          />
                        </div>
                      )}
                    </div>
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
                    {" "}and understand that Heal-AId is for informational 
                    purposes only and does not replace medical advice.
                  </label>
                </div>

                <Button
                  onClick={analyzeProgress}
                  disabled={uploadedImages.length === 0 || isAnalyzing || !user || !tattooAge || !cleanedWithAlcohol || !coveringType || !aftercareProducts || !allergies || !hotToTouch || !feverSymptoms || !sensitiveToTouch || !hasTenderness || !visibleRashes || !tosAccepted}
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
