import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";
import { z } from "zod";

const activationSchema = z.object({
  code: z.string().trim().min(1, "Activation code is required"),
  email: z.string().trim().email("Valid email is required"),
});

const Activate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

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
        toast.error(data.error);
        return;
      }

      toast.success(data.message || "Your Heal-AId subscription has been activated!");
      navigate("/healing-tracker");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to activate code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-white">Activate Your Code</CardTitle>
            <CardDescription className="text-slate-300">
              Enter your activation code to unlock Heal-AId
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white">Activation Code</Label>
                <Input
                  id="code"
                  placeholder="HLN-XXXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={50}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Activating..." : "Activate Now"}
              </Button>

              <div className="text-center text-sm text-slate-400">
                <p className="mb-1">💡 Enter your activation code to unlock</p>
                <p className="font-medium text-slate-200">Charlie - Your AI Tattoo Healing Assistant</p>
              </div>

              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg text-xs text-slate-400 text-center">
                ⏰ Activation codes must be used within 90 days of purchase
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-sm text-center text-slate-400 mb-3">
                Need to extend your access? Choose from:
              </p>
              <div className="space-y-2 text-sm text-center">
                <p className="text-slate-400">7 Days - <span className="font-semibold text-white">$0.99</span></p>
                <p className="text-slate-400">30 Days - <span className="font-semibold text-white">$3.99</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Activate;
