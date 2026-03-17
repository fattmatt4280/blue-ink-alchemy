import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { access_token, caption, video_base64, video_size, content_type } = await req.json();

    if (!access_token || !video_base64) {
      return new Response(JSON.stringify({ error: "Missing access_token or video data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Initialize video upload via TikTok Content Posting API
    const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: caption || "",
          privacy_level: "SELF_ONLY",
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: video_size,
          chunk_size: video_size,
          total_chunk_count: 1,
        },
      }),
    });

    const initData = await initRes.json();
    console.log("TikTok init response:", JSON.stringify(initData));

    if (initData.error?.code !== "ok" && !initData.data?.publish_id) {
      return new Response(JSON.stringify({ error: initData.error || initData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uploadUrl = initData.data?.upload_url;
    const publishId = initData.data?.publish_id;

    if (uploadUrl) {
      // Step 2: Upload the video chunk
      const videoBytes = Uint8Array.from(atob(video_base64), (c) => c.charCodeAt(0));

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": content_type || "video/mp4",
          "Content-Range": `bytes 0-${videoBytes.length - 1}/${videoBytes.length}`,
        },
        body: videoBytes,
      });

      const uploadStatus = uploadRes.status;
      const uploadText = await uploadRes.text();
      console.log("TikTok upload response:", uploadStatus, uploadText);

      if (uploadStatus < 200 || uploadStatus >= 300) {
        return new Response(JSON.stringify({ error: "Upload failed", status: uploadStatus, details: uploadText }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ publish_id: publishId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Publish error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
