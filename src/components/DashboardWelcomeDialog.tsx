import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Check } from "lucide-react";

// Neon colors
const NEON_CYAN = "#00f5ff";

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
      <DialogContent 
        className="max-w-md border-cyan-500/30"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
          boxShadow: `0 0 40px ${NEON_CYAN}20`
        }}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center border"
              style={{
                background: `linear-gradient(135deg, ${NEON_CYAN}20, rgba(59, 130, 246, 0.2))`,
                borderColor: `${NEON_CYAN}40`,
                boxShadow: `0 0 30px ${NEON_CYAN}30`
              }}
            >
              <Sparkles className="w-8 h-8" style={{ color: NEON_CYAN, filter: `drop-shadow(0 0 10px ${NEON_CYAN})` }} />
            </div>
          </div>
          <DialogTitle 
            className="text-2xl text-center font-rajdhani bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent"
            style={{ textShadow: `0 0 20px ${NEON_CYAN}30` }}
          >
            Welcome to Heal-AId™ (Patent Pending)!
          </DialogTitle>
          <DialogDescription className="text-center text-cyan-300/70">
            Start your healing journey with a free 24-hour trial
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div 
            className="p-4 rounded-lg space-y-3 border"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderColor: `${NEON_CYAN}20`
            }}
          >
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: NEON_CYAN }} />
              <p className="text-sm text-cyan-100">AI-powered tattoo healing analysis</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: NEON_CYAN }} />
              <p className="text-sm text-cyan-100">Personalized aftercare recommendations</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: NEON_CYAN }} />
              <p className="text-sm text-cyan-100">Track your progress with photo timeline</p>
            </div>
          </div>

          <div 
            className="flex items-center gap-2 p-3 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${NEON_CYAN}10, rgba(59, 130, 246, 0.1))`,
              borderColor: `${NEON_CYAN}30`,
              boxShadow: `0 0 15px ${NEON_CYAN}15`
            }}
          >
            <Clock className="w-5 h-5 flex-shrink-0" style={{ color: NEON_CYAN }} />
            <p className="text-sm text-cyan-100">
              <strong style={{ color: NEON_CYAN }}>24-hour free trial</strong> starts immediately - no credit card required
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            className="w-full font-semibold"
            size="lg"
            onClick={onActivateTrial}
            disabled={isActivating}
            style={{
              background: `linear-gradient(135deg, ${NEON_CYAN}, #3b82f6)`,
              boxShadow: `0 0 20px ${NEON_CYAN}40`,
              border: `1px solid ${NEON_CYAN}60`
            }}
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
            className="w-full text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-500/10" 
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