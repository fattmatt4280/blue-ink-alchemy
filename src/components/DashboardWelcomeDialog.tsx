import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Check } from "lucide-react";

interface DashboardWelcomeDialogProps {
  isOpen: boolean;
  onActivateTrial: () => void;
  onViewPlans: () => void;
  isActivating: boolean;
}

export const DashboardWelcomeDialog = ({ 
  isOpen, 
  onActivateTrial, 
  onViewPlans,
  isActivating 
}: DashboardWelcomeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">Welcome to Heal-AId!</DialogTitle>
          <DialogDescription className="text-center">
            Start your healing journey with a free 24-hour trial
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">AI-powered tattoo healing analysis</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">Personalized aftercare recommendations</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">Track your progress with photo timeline</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm">
              <strong>24-hour free trial</strong> starts immediately - no credit card required
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            className="w-full" 
            size="lg"
            onClick={onActivateTrial}
            disabled={isActivating}
          >
            {isActivating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              'Start Free Trial'
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            size="sm"
            onClick={onViewPlans}
            disabled={isActivating}
          >
            View all subscription plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
