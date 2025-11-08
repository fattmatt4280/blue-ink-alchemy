import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

export const initializeFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  
  try {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    console.error("Failed to load FFmpeg:", error);
    throw error;
  }
};

export interface TimelapseOptions {
  imageUrls: string[];
  fps?: number;
  duration?: number;
  width?: number;
  height?: number;
  watermarkText?: string;
}

export const generateTimelapse = async ({
  imageUrls,
  fps = 2,
  width = 720,
  height = 720,
  watermarkText = "Heal-AId Tracker",
}: TimelapseOptions): Promise<Blob> => {
  const ffmpeg = await initializeFFmpeg();

  try {
    // Fetch and write images to FFmpeg virtual file system
    for (let i = 0; i < imageUrls.length; i++) {
      const imageData = await fetchFile(imageUrls[i]);
      await ffmpeg.writeFile(`image${i.toString().padStart(3, "0")}.jpg`, imageData);
    }

    // Create a simple filter to resize and add watermark
    const filterComplex = `[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,drawtext=text='${watermarkText}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=h-th-10[v]`;

    // Generate video from images
    await ffmpeg.exec([
      "-framerate",
      fps.toString(),
      "-pattern_type",
      "glob",
      "-i",
      "image*.jpg",
      "-filter_complex",
      filterComplex,
      "-map",
      "[v]",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "output.mp4",
    ]);

    // Read the output video
    const data = await ffmpeg.readFile("output.mp4");
    
    // Clean up
    for (let i = 0; i < imageUrls.length; i++) {
      await ffmpeg.deleteFile(`image${i.toString().padStart(3, "0")}.jpg`);
    }
    await ffmpeg.deleteFile("output.mp4");

    // Convert to Blob
    const videoData = data instanceof Uint8Array ? data : new Uint8Array();
    return new Blob([videoData.buffer as ArrayBuffer], { type: "video/mp4" });
  } catch (error) {
    console.error("Error generating timelapse:", error);
    throw error;
  }
};

export const uploadTimelapse = async (
  blob: Blob,
  userId: string,
  healingProgressId: string
): Promise<string> => {
  const { supabase } = await import("@/integrations/supabase/client");
  
  const fileName = `timelapse_${healingProgressId}_${Date.now()}.mp4`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("healing-photos")
    .upload(filePath, blob, {
      contentType: "video/mp4",
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from("healing-photos")
    .getPublicUrl(filePath);

  return publicUrl;
};
