import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { HealingHistoryEntry } from "@/hooks/useHealingHistory";
import { Video, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateTimelapse, uploadTimelapse } from "@/utils/timelapseGenerator";
import { supabase } from "@/integrations/supabase/client";

interface HealingPhotoTimelineProps {
  entries: HealingHistoryEntry[];
}

export const HealingPhotoTimeline = ({ entries }: HealingPhotoTimelineProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTimelapse = async () => {
    if (entries.length < 2) {
      toast.error("Need at least 2 photos to create a time-lapse");
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      toast.info("Generating time-lapse video... This may take a moment");

      const imageUrls = entries.map(entry => entry.photo_url);
      const videoBlob = await generateTimelapse({
        imageUrls,
        fps: 2,
        watermarkText: "Heal-AId™ Tracker",
      });

      // Upload to storage
      const videoUrl = await uploadTimelapse(
        videoBlob,
        user.id,
        entries[0].id
      );

      // Update the first entry with timelapse URL
      const { error } = await supabase
        .from("healing_progress")
        .update({ timelapse_url: videoUrl })
        .eq("id", entries[0].id);

      if (error) throw error;

      toast.success("Time-lapse video created successfully!");
      
      // Download the video
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `healing-timelapse-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating timelapse:", error);
      toast.error("Failed to generate time-lapse video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Photo Timeline</CardTitle>
            <Button
              onClick={handleGenerateTimelapse}
              disabled={isGenerating || entries.length < 2}
              size="sm"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Create Time-Lapse
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="relative group"
              >
                <img
                  src={entry.photo_url}
                  alt={`Progress on ${format(new Date(entry.created_at), "MMM dd")}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-end justify-center pb-2">
                  <Badge className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {format(new Date(entry.created_at), "MMM dd")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
  );
};
