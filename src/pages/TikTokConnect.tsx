import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const TIKTOK_CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY || "";
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || "https://bluedreambudder.com/tiktok-connect";

const SCOPES = "user.info.profile,video.upload,video.publish";

const TikTokConnect = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; avatar: string } | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishId, setPublishId] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && !accessToken) {
      exchangeCode(code);
    }
  }, []);

  const handleConnect = () => {
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=${SCOPES}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = authUrl;
  };

  const exchangeCode = async (code: string) => {
    setLoading(true);
    setStatus("Exchanging code for access token...");
    try {
      const { data, error } = await supabase.functions.invoke("tiktok-token-exchange", {
        body: { code, redirect_uri: REDIRECT_URI },
      });
      if (error) throw error;
      if (data?.access_token) {
        setAccessToken(data.access_token);
        setStatus("Authenticated! Fetching user info...");
        await fetchUserInfo(data.access_token);
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      } else {
        setStatus("Error: " + (data?.error_description || data?.error || "Unknown error"));
      }
    } catch (e: any) {
      setStatus("Error exchanging code: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const u = json?.data?.user;
      if (u) {
        setUser({ username: u.display_name || "TikTok User", avatar: u.avatar_url || "" });
        setStatus("Connected as " + (u.display_name || "TikTok User"));
      } else {
        setStatus("Connected (could not fetch user info)");
      }
    } catch {
      setStatus("Connected (user info fetch failed)");
    }
  };

  const handlePublish = async () => {
    if (!videoFile || !accessToken) return;
    if (videoFile.size > 50 * 1024 * 1024) {
      setStatus("File too large. Max 50MB.");
      return;
    }
    setLoading(true);
    setStatus("Uploading and publishing...");
    setPublishId(null);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(videoFile);
      });

      const { data, error } = await supabase.functions.invoke("tiktok-publish", {
        body: {
          access_token: accessToken,
          caption,
          video_base64: base64,
          video_size: videoFile.size,
          content_type: videoFile.type,
        },
      });
      if (error) throw error;
      if (data?.publish_id) {
        setPublishId(data.publish_id);
        setStatus("Published successfully!");
      } else {
        setStatus("Error: " + (data?.error?.message || JSON.stringify(data)));
      }
    } catch (e: any) {
      setStatus("Publish error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>TikTok Connect</h1>

      {!accessToken ? (
        <>
          <button
            onClick={handleConnect}
            disabled={loading}
            style={{
              background: "#000", color: "#fff", border: "none", borderRadius: 8,
              padding: "12px 28px", fontSize: 16, cursor: "pointer", opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Connecting..." : "Connect TikTok"}
          </button>
        </>
      ) : (
        <>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              {user.avatar && <img src={user.avatar} alt="" style={{ width: 40, height: 40, borderRadius: "50%" }} />}
              <span style={{ fontWeight: 600 }}>{user.username}</span>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Video (mp4/mov, max 50MB)</label>
            <input
              type="file"
              accept=".mp4,.mov,video/mp4,video/quicktime"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 14 }}
              placeholder="Video description..."
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={loading || !videoFile}
            style={{
              background: "#ee1d52", color: "#fff", border: "none", borderRadius: 8,
              padding: "12px 28px", fontSize: 16, cursor: "pointer", opacity: loading || !videoFile ? 0.6 : 1,
            }}
          >
            {loading ? "Publishing..." : "Publish to TikTok"}
          </button>

          {publishId && (
            <div style={{ marginTop: 16, padding: 12, background: "#e8f5e9", borderRadius: 8 }}>
              ✅ Published! ID: <code>{publishId}</code>
            </div>
          )}
        </>
      )}

      {status && <p style={{ marginTop: 16, color: "#555", fontSize: 14 }}>{status}</p>}
    </div>
  );
};

export default TikTokConnect;
