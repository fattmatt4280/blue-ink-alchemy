import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Upload, CheckCircle, Play, ChevronDown, Music, Video, Shield, Zap, Globe, Users, Lock } from "lucide-react";

const TIKTOK_CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY || "";
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || "https://bluedreambudder.com/app/tiktok/callback";
const SCOPES = "user.info.profile,video.upload,video.publish";

type Step = "connect" | "connecting" | "connected" | "publishing" | "published";

const TikTokConnect = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [step, setStep] = useState<Step>("connect");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("SELF_ONLY");
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real mode state
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [realUser, setRealUser] = useState<{ username: string; avatar: string } | null>(null);
  const [status, setStatus] = useState("");

  // Handle real OAuth callback
  useEffect(() => {
    if (demoMode) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && !accessToken) {
      exchangeCode(code);
    }
  }, [demoMode]);

  // --- Real integration functions (kept intact) ---
  const handleRealConnect = () => {
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=${SCOPES}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = authUrl;
  };

  const exchangeCode = async (code: string) => {
    setStep("connecting");
    try {
      const { data, error } = await supabase.functions.invoke("tiktok-token-exchange", {
        body: { code, redirect_uri: REDIRECT_URI },
      });
      if (error) throw error;
      if (data?.access_token) {
        setAccessToken(data.access_token);
        await fetchUserInfo(data.access_token);
        window.history.replaceState({}, "", window.location.pathname);
        setStep("connected");
      } else {
        setStatus("Error: " + (data?.error_description || "Unknown"));
        setStep("connect");
      }
    } catch (e: any) {
      setStatus("Error: " + e.message);
      setStep("connect");
    }
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const u = json?.data?.user;
      if (u) setRealUser({ username: u.display_name || "TikTok User", avatar: u.avatar_url || "" });
    } catch {}
  };

  const handleRealPublish = async () => {
    if (!videoFile || !accessToken) return;
    setStep("publishing");
    setPublishProgress(0);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(videoFile);
      });
      const { data, error } = await supabase.functions.invoke("tiktok-publish", {
        body: { access_token: accessToken, caption, video_base64: base64, video_size: videoFile.size, content_type: videoFile.type },
      });
      if (error) throw error;
      if (data?.publish_id) {
        setPublishId(data.publish_id);
        setStep("published");
      } else {
        setStatus("Error: " + JSON.stringify(data));
        setStep("connected");
      }
    } catch (e: any) {
      setStatus("Error: " + e.message);
      setStep("connected");
    }
  };

  // --- Demo functions ---
  const handleDemoConnect = () => {
    setStep("connecting");
    setTimeout(() => setStep("connected"), 1800);
  };

  const handleDemoPublish = () => {
    if (!videoFile) return;
    setStep("publishing");
    setPublishProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setPublishId("7394821056283947265");
          setStep("published");
        }, 400);
      }
      setPublishProgress(Math.min(p, 100));
    }, 300);
  };

  const handleConnect = () => (demoMode ? handleDemoConnect() : handleRealConnect());
  const handlePublish = () => (demoMode ? handleDemoPublish() : handleRealPublish());

  const user = demoMode
    ? { username: "DreamTattoo", avatar: "" }
    : realUser;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "video/mp4" || file.type === "video/quicktime")) {
      if (file.size <= 50 * 1024 * 1024) setVideoFile(file);
    }
  };

  const reset = () => {
    setStep("connect");
    setVideoFile(null);
    setCaption("");
    setPublishId(null);
    setPublishProgress(0);
    setAccessToken(null);
    setRealUser(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Music className="w-7 h-7 text-[#ee1d52]" />
            <h1 className="text-xl font-bold tracking-tight">Dream Ops Command Center</h1>
          </div>
          <div className="flex items-center gap-2">
            {demoMode && <Badge className="bg-[#69C9D0]/20 text-[#69C9D0] border-[#69C9D0]/30 text-[10px]">DEMO</Badge>}
            <Switch checked={demoMode} onCheckedChange={(v) => { setDemoMode(v); reset(); }} />
            <Label className="text-xs text-gray-500">Demo</Label>
          </div>
        </div>
        <p className="text-sm text-gray-500">Publish videos directly to TikTok from Dream Ops Command Center</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-12 space-y-4">

        {/* Step: Connect */}
        {step === "connect" && (
          <Card className="bg-gray-950 border-gray-800">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ee1d52] to-[#69C9D0] flex items-center justify-center">
                <Play className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">Connect Your TikTok Account</h2>
                <p className="text-sm text-gray-400 max-w-sm">
                  Authorize BlueDreamBudder to upload and publish videos on your behalf. We'll request access to your profile and video publishing.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["user.info.profile", "video.upload", "video.publish"].map((s) => (
                  <Badge key={s} variant="outline" className="text-[11px] text-gray-400 border-gray-700">
                    <Shield className="w-3 h-3 mr-1" />{s}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={handleConnect}
                className="bg-[#ee1d52] hover:bg-[#ee1d52]/90 text-white px-8 py-3 text-base font-semibold rounded-xl"
              >
                <Music className="w-4 h-4 mr-2" />
                Connect TikTok
              </Button>
              {status && <p className="text-xs text-red-400">{status}</p>}
            </CardContent>
          </Card>
        )}

        {/* Step: Connecting */}
        {step === "connecting" && (
          <Card className="bg-gray-950 border-gray-800">
            <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#ee1d52] border-t-transparent animate-spin" />
              <p className="text-sm text-gray-400">Authenticating with TikTok...</p>
            </CardContent>
          </Card>
        )}

        {/* Step: Connected — Upload & Publish */}
        {(step === "connected" || step === "publishing") && (
          <>
            {/* User card */}
            <Card className="bg-gray-950 border-gray-800">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ee1d52] to-[#69C9D0] flex items-center justify-center text-sm font-bold">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        user?.username?.charAt(0) || "T"
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">@{user?.username || "TikTok User"}</p>
                      <p className="text-xs text-gray-500">TikTok Creator</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/15 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Upload area */}
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Upload Video</CardTitle>
                <CardDescription className="text-xs">MP4 or MOV, max 50MB</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver ? "border-[#69C9D0] bg-[#69C9D0]/5" : videoFile ? "border-green-500/40 bg-green-500/5" : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp4,.mov,video/mp4,video/quicktime"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                  {videoFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <Video className="w-8 h-8 text-green-400" />
                      <p className="text-sm font-medium text-green-400">{videoFile.name}</p>
                      <p className="text-xs text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-500" />
                      <p className="text-sm text-gray-400">Drag & drop or click to select</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">Caption</Label>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption for your video..."
                    className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-400 mb-2 block">Privacy</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "PUBLIC_TO_EVERYONE", label: "Public", icon: Globe },
                      { value: "MUTUAL_FOLLOW_FRIENDS", label: "Friends", icon: Users },
                      { value: "SELF_ONLY", label: "Self Only", icon: Lock },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setPrivacy(value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          privacy === value
                            ? "bg-[#ee1d52]/20 text-[#ee1d52] border border-[#ee1d52]/40"
                            : "bg-gray-900 text-gray-500 border border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <Icon className="w-3 h-3" />{label}
                      </button>
                    ))}
                  </div>
                </div>

                {step === "publishing" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Uploading & publishing...</span>
                      <span>{Math.round(publishProgress)}%</span>
                    </div>
                    <Progress value={publishProgress} className="h-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-[#ee1d52] [&>div]:to-[#69C9D0]" />
                  </div>
                ) : (
                  <Button
                    onClick={handlePublish}
                    disabled={!videoFile}
                    className="w-full bg-[#ee1d52] hover:bg-[#ee1d52]/90 text-white font-semibold rounded-xl disabled:opacity-40"
                  >
                    <Zap className="w-4 h-4 mr-2" />Publish to TikTok
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Step: Published */}
        {step === "published" && (
          <Card className="bg-gray-950 border-gray-800">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-400">Published Successfully!</h2>
                <p className="text-sm text-gray-400 mt-1">Your video is now on TikTok</p>
              </div>
              <div className="bg-gray-900 rounded-lg px-4 py-2 text-xs font-mono text-gray-400">
                Publish ID: <span className="text-white">{publishId}</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-900" onClick={reset}>
                  Publish Another
                </Button>
                <Button className="bg-[#69C9D0] hover:bg-[#69C9D0]/90 text-black font-semibold" asChild>
                  <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">View on TikTok</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical Info */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors w-full py-2">
            <ChevronDown className="w-3 h-3" />
            Technical Details
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="bg-gray-950 border-gray-800 mt-1">
              <CardContent className="pt-4 pb-4 text-xs text-gray-500 space-y-3 font-mono">
                <div>
                  <p className="text-gray-400 font-sans font-medium mb-1">OAuth Scopes</p>
                  <p>user.info.profile, video.upload, video.publish</p>
                </div>
                <div>
                  <p className="text-gray-400 font-sans font-medium mb-1">Redirect URI</p>
                  <p>{REDIRECT_URI}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-sans font-medium mb-1">API Endpoints</p>
                  <p>POST /v2/oauth/token/</p>
                  <p>GET /v2/user/info/</p>
                  <p>POST /v2/post/publish/video/init/</p>
                </div>
                <div>
                  <p className="text-gray-400 font-sans font-medium mb-1">Architecture</p>
                  <p>Browser → Supabase Edge Function → TikTok API</p>
                  <p className="mt-1">Edge Functions:</p>
                  <p>• tiktok-token-exchange (code → access_token)</p>
                  <p>• tiktok-publish (video + caption → publish_id)</p>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default TikTokConnect;
