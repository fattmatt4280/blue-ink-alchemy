import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Activate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !email) {
      toast.error("Please enter both code and email");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('activate-healyn', {
        body: { code, email },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {},
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Show tier-specific success message
      const tierMessages = {
        free_trial: "Your 3-day free trial is now active!",
        '7_day': "Your 7-day access is now active!",
        '30_day': "Your 30-day access is now active!",
      };

      const successMessage = data.tier && tierMessages[data.tier] 
        ? tierMessages[data.tier] 
        : data.message || "Heal-AId activated successfully!";

      toast.success(successMessage);

      // Show expiration info
      if (data.expiration_date) {
        const expiryDate = new Date(data.expiration_date);
        setTimeout(() => {
          toast.info(`Access expires on ${expiryDate.toLocaleDateString()}`);
        }, 1000);
      }
      
      // Redirect to healing tracker
      setTimeout(() => {
        navigate("/healing-tracker");
      }, 2500);
    } catch (error: any) {
      console.error("Activation error:", error);
      toast.error(error.message || "Failed to activate code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Activate Heal-AId AI</CardTitle>
          <CardDescription>
            powered by Blue Dream Budder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Activation Code</Label>
              <Input
                id="code"
                placeholder="HLN-XXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                required
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
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Activating..." : "Activate Free Trial"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-1">💡 Enter your activation code to unlock</p>
              <p className="font-medium text-foreground">Charlie - Your AI Tattoo Healing Assistant</p>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground text-center">
              ⏰ Activation codes must be used within 90 days of purchase
            </div>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-muted-foreground mb-3">
              Need to extend your access? Choose from:
            </p>
            <div className="space-y-2 text-sm text-center">
              <p className="text-muted-foreground">7 Days - <span className="font-semibold text-foreground">$0.99</span></p>
              <p className="text-muted-foreground">30 Days - <span className="font-semibold text-foreground">$3.99</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Activate;