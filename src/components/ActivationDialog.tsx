import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

interface ActivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledCode?: string;
}

const activationSchema = z.object({
  code: z.string().trim().min(1, "Activation code is required"),
  email: z.string().trim().email("Valid email is required"),
});

export const ActivationDialog = ({ open, onOpenChange, prefilledCode = "" }: ActivationDialogProps) => {
  const [code, setCode] = useState(prefilledCode);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = activationSchema.parse({ code, email });
      
      setLoading(true);

      const { data, error } = await supabase.functions.invoke("activate-healaid", {
        body: { 
          code: validated.code,
          email: validated.email 
        },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Activation Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: data.message || "Your Heal-AId subscription has been activated!",
      });

      onOpenChange(false);
      navigate("/healing-tracker");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to activate code. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <DialogTitle>Activate Your Code</DialogTitle>
          </div>
          <DialogDescription>
            Enter your activation code and email to start your Heal-AId subscription.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleActivate} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="code">Activation Code</Label>
            <Input
              id="code"
              placeholder="HLN-XXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Activating..." : "Activate Now"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Don't have a code? Free 3-day trials are included with every budder purchase!
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
