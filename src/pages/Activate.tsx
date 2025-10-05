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

      toast.success(data.message || "Heal-AId activated successfully!");
      
      // Redirect to healing tracker
      setTimeout(() => {
        navigate("/healing-tracker");
      }, 1500);
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
              <p>Get 3 days of free access to Charlie,</p>
              <p>your AI tattoo healing assistant</p>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-muted-foreground mb-3">
              After activation, you can extend your access:
            </p>
            <div className="space-y-2 text-sm text-center">
              <p>7 Days - $0.99</p>
              <p>30 Days - $2.99</p>
              <p>90 Days (Pro) - $7.99</p>
              <p>Studio Unlimited - $39.99/month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Activate;