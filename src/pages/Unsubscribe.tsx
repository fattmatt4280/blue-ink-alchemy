import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    const processUnsubscribe = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("handle-unsubscribe", {
          body: { token },
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          setStatus("success");
          setEmail(data.email || "");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Unknown error");
        }
      } catch (err: any) {
        console.error("Unsubscribe error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Failed to process unsubscribe request");
      }
    };

    processUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Mail className="h-6 w-6" />
            Email Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Processing your request...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Successfully Unsubscribed</h3>
                {email && (
                  <p className="text-muted-foreground mt-1">
                    {email} has been removed from our mailing list.
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                You will no longer receive promotional emails from us.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <XCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Something went wrong</h3>
                <p className="text-muted-foreground mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {status === "no-token" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <XCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Invalid Link</h3>
                <p className="text-muted-foreground mt-1">
                  This unsubscribe link is invalid or has expired.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button asChild variant="outline">
              <Link to="/">Return to Homepage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
