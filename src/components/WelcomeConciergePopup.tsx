import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeConciergePopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const WelcomeConciergePopup: React.FC<WelcomeConciergePopupProps> = ({ 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[60] animate-fade-in">
      <Card className="relative bg-primary text-primary-foreground shadow-2xl border-2 border-primary-foreground/20 max-w-xs">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium">
                Hi I'm your personal BDB concierge! If you have any questions I live down here
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 h-6 w-6 p-0 shrink-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Downward pointing arrow */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <ChevronDown className="w-6 h-6 text-primary drop-shadow-sm" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeConciergePopup;