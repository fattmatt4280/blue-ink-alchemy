import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";

const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || "https://bluedreambudder.com/app/tiktok/callback";

const TikTokCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg(params.get("error_description") || "Authorization was denied.");
      return;
    }

    if (code) {
      exchangeCode(code);
    } else {
      setStatus("error");
      setErrorMsg("No authorization code received.");
    }
  }, []);

  const exchangeCode = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("tiktok-token-exchange", {
        body: { code, redirect_uri: REDIRECT_URI },
      });
      if (error) throw error;
      if (data?.access_token) {
        // Store token in sessionStorage for the connect page to pick up
        sessionStorage.setItem("tiktok_access_token", data.access_token);
        if (data.open_id) sessionStorage.setItem("tiktok_open_id", data.open_id);
        setStatus("success");
        setTimeout(() => navigate("/tiktok-connect", { replace: true }), 1500);
      } else {
        setStatus("error");
        setErrorMsg(data?.error_description || "Failed to exchange token.");
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message || "Token exchange failed.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="bg-gray-950 border-gray-800 max-w-sm w-full">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
          {status === "loading" && (
            <>
              <div className="w-12 h-12 rounded-full border-4 border-[#ee1d52] border-t-transparent animate-spin" />
              <p className="text-sm text-gray-400">Completing TikTok authorization...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-sm text-green-400 font-medium">Connected! Redirecting...</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-sm text-red-400 font-medium">Authorization Failed</p>
              <p className="text-xs text-gray-500">{errorMsg}</p>
              <button
                onClick={() => navigate("/tiktok-connect", { replace: true })}
                className="text-xs text-[#69C9D0] hover:underline mt-2"
              >
                Back to Dream Ops Command Center
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TikTokCallback;
