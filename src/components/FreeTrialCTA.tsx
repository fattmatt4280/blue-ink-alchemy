import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useFreeTrialEligibility } from '@/hooks/useFreeTrialEligibility';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Sparkles } from 'lucide-react';

export const FreeTrialCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEligible, loading: eligibilityLoading } = useFreeTrialEligibility();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);

  const handleStartTrial = async () => {
    if (!user) {
      navigate('/auth?returnTo=/');
      return;
    }

    if (!isEligible) {
      toast({
        title: "Already Used",
        description: "You've already used your free trial. Check out our affordable subscription plans!",
        variant: "destructive"
      });
      return;
    }

    setActivating(true);

    try {
      const { data, error } = await supabase.functions.invoke('start-free-trial', {
        body: {
          email: user.email,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "🎉 Free Trial Activated!",
        description: data.message || "Welcome to HealAid! Check your email for confirmation.",
      });

      // Redirect to healing tracker after short delay
      setTimeout(() => {
        navigate('/healing-tracker');
      }, 1500);

    } catch (error: any) {
      console.error('Error activating free trial:', error);
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate free trial. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActivating(false);
    }
  };

  const benefits = [
    "24 hours of full access to Charlie AI",
    "Upload unlimited healing photos",
    "Get personalized aftercare recommendations",
    "Track your tattoo's healing progress",
    "No credit card required"
  ];

  const getButtonText = () => {
    if (activating) return "Activating...";
    if (!user) return "Sign Up to Start Free Trial";
    if (!isEligible) return "Already Used Trial";
    return "Activate Your Free 24-Hour Trial";
  };

  const isButtonDisabled = activating || eligibilityLoading || (user && !isEligible);

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 animate-gradient" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="bg-background/80 backdrop-blur-lg rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold text-gray-900">Limited Time Offer</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-400">
              Start Your Free 24-Hour Trial
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the power of AI-powered tattoo aftercare with Charlie, your personal healing assistant.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm">{benefit}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleStartTrial}
              disabled={isButtonDisabled}
              size="lg"
              className="text-lg px-8 py-6 min-w-[300px] bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/25 transition-all hover:scale-105"
            >
              {activating && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {getButtonText()}
            </Button>

            {user && !isEligible && !eligibilityLoading && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You've already used your free trial
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/shop')}
                  className="border-primary/20 hover:bg-primary/10"
                >
                  View Subscription Plans
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center max-w-md">
              Join 1,000+ tattoo artists & enthusiasts who trust HealAid for their aftercare needs. 
              No spam, cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
