import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useHealAidSubscription } from "@/hooks/useHealAidSubscription";
import { CameraCapture } from "@/components/CameraCapture";
import { PhotoReviewScreen } from "@/components/PhotoReviewScreen";
import { HealingQuestionsOverlay, HealingQuestionData } from "@/components/HealingQuestionsOverlay";
import CartDialog from "@/components/CartDialog";
import HealingQADialog from "@/components/HealingQADialog";
import { CapturedPhoto, CameraMode } from "@/hooks/useCamera";
import { AnalyzingAnimation } from "@/components/AnalyzingAnimation";

type Step = 'camera' | 'review' | 'questions' | 'analyzing';

const HealingTracker = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const subscription = useHealAidSubscription();

  const [step, setStep] = useState<Step>('camera');
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedMode, setSelectedMode] = useState<CameraMode>('progress');
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [showQADialog, setShowQADialog] = useState(false);
  const [lastAnalysisId, setLastAnalysisId] = useState<string | null>(null);

  // Route protection - redirect if no active subscription
  useEffect(() => {
    if (!loading && !subscription.loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (!subscription.isActive || subscription.daysRemaining <= 0) {
        toast({
          title: "Access Required",
          description: "Please activate HealAid to use the healing tracker.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    }
  }, [user, loading, subscription, navigate, toast]);

  const handlePhotosCapture = (photos: CapturedPhoto[], mode: CameraMode) => {
    setCapturedPhotos(photos);
    setSelectedMode(mode);
    setStep('review');
  };

  const handleRetakePhotos = () => {
    setCapturedPhotos([]);
    setStep('camera');
  };

  const handleContinueToQuestions = () => {
    setStep('questions');
  };

  const handleCloseQuestions = () => {
    setStep('review');
  };

  const analyzeProgress = async (formData: HealingQuestionData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the healing tracker",
        variant: "destructive",
      });
      return;
    }

    setStep('analyzing');

    try {
      // Upload images to storage
      const uploadedUrls: string[] = [];
      for (const photo of capturedPhotos) {
        const image = photo.file;
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('healing-photos')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('healing-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Get user's name for personalization
      const userName = user.user_metadata?.first_name || 
                       user.email?.split('@')[0]?.split('.')[0] || 
                       'there';

      // Call the analyze-healing-progress function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-healing-progress',
        {
          body: {
            imageUrls: uploadedUrls,
            tattooAge: formData.tattooAge,
            aftercareProducts: formData.aftercareProducts,
            knownAllergies: formData.knownAllergies,
            symptoms: formData.symptoms,
            additionalNotes: formData.additionalNotes,
            urgencyMode: selectedMode, // Pass urgency context to AI
            userName,
            userId: user.id,
          },
        }
      );

      if (analysisError) {
        console.error('Function invocation error:', analysisError);
        const errorMessage = (analysisError as any)?.message || '';
        const status = (analysisError as any)?.status;
        
        // Handle tier-specific limits
        if (errorMessage.includes('trial_limit_reached')) {
          toast({
            title: "Free Trial Limit Reached",
            description: "Your trial includes limited analyses. Upgrade for unlimited access.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }
        
        if (errorMessage.includes('daily_limit_reached')) {
          toast({
            title: "Daily Limit Reached",
            description: "Upgrade to Pro for unlimited access!",
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
          setStep('questions');
          return;
        }
        
        if (status === 429) {
          toast({
            title: "Please Wait",
            description: "Too many requests. Please wait a few minutes and try again.",
            variant: "destructive",
          });
          setStep('questions');
          return;
        }
        
        throw analysisError;
      }

      // Handle specific error cases from the edge function
      if (!analysisData.success) {
        if (analysisData.error === 'insufficient_credits') {
          toast({
            title: "Service Temporarily Unavailable",
            description: analysisData.userMessage || "The AI analysis service needs to be recharged.",
            variant: "destructive",
          });
          setStep('questions');
          return;
        }
        
        if (analysisData.error === 'rate_limit_exceeded') {
          toast({
            title: "Please Wait",
            description: analysisData.userMessage || "Too many requests. Please wait a few minutes.",
            variant: "destructive",
          });
          setStep('questions');
          return;
        }

        if (analysisData.error === 'ai_gateway_error') {
          toast({
            title: "AI Service Issue",
            description: analysisData.userMessage || "The AI service had a temporary issue.",
            variant: "destructive",
          });
          setStep('questions');
          return;
        }
        
        throw new Error(analysisData.message || 'Analysis failed');
      }

      // Save to database
      const { data: savedData, error: saveError } = await supabase
        .from('healing_progress')
        .insert({
          user_id: user.id,
          photo_url: uploadedUrls[0],
          photo_urls: uploadedUrls,
          healing_stage: analysisData.analysis?.healingStage || 'unknown',
          progress_score: analysisData.analysis?.progressScore || 50,
          recommendations: analysisData.analysis?.recommendations || [],
          analysis_result: {
            ...analysisData.analysis,
            urgencyMode: selectedMode,
            formData: formData,
          },
          hot_to_touch: formData.symptoms.heat,
          fever_symptoms: formData.symptoms.pain,
          sensitive_to_touch: formData.symptoms.swelling,
          has_tenderness: formData.symptoms.redness,
          visible_rashes: formData.symptoms.discharge || formData.symptoms.itching,
          rash_description: formData.additionalNotes,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      if (savedData) {
        setLastAnalysisId(savedData.id);
        
        toast({
          title: "Analysis Complete!",
          description: selectedMode === 'progress' 
            ? "Progress logged to your history" 
            : "Detailed analysis complete",
        });
        
        // Redirect to healing history
        setTimeout(() => {
          navigate('/healing-history?new=true');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error analyzing healing progress:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze healing progress. Please try again.",
        variant: "destructive",
      });
      setStep('questions');
    }
  };

  // Camera-first flow rendering
  if (step === 'camera') {
    return <CameraCapture onPhotosCapture={handlePhotosCapture} maxPhotos={5} />;
  }

  if (step === 'review') {
    return (
      <PhotoReviewScreen
        photos={capturedPhotos}
        mode={selectedMode}
        onRetake={handleRetakePhotos}
        onContinue={handleContinueToQuestions}
      />
    );
  }

  if (step === 'questions') {
    return (
      <>
        <HealingQuestionsOverlay
          photos={capturedPhotos}
          mode={selectedMode}
          onSubmit={analyzeProgress}
          onClose={handleCloseQuestions}
          isAnalyzing={false}
        />
      </>
    );
  }

  if (step === 'analyzing') {
    return <AnalyzingAnimation mode={selectedMode} />;
  }

  // Fallback (shouldn't reach here)
  return null;
};

export default HealingTracker;
