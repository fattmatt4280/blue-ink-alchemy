import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
}

export const TextToSpeechButton = ({ text, className }: TextToSpeechButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const triedFallbackRef = useRef(false);
  const { toast } = useToast();

  const handlePlayPause = async () => {
    // If already playing, pause
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If audio already loaded, resume or replay
    if (audioRef.current && !isPlaying) {
      if (audioRef.current.ended || audioRef.current.currentTime > 0) {
        audioRef.current.currentTime = 0;
      }
      await audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Generate new audio
    setIsLoading(true);
    try {
      const ttsText = (text || "").replace(/\s+/g, " ").trim().slice(0, 4000);
      console.log('TTS: invoking generate-tts', { length: ttsText.length });
      const { data, error } = await supabase.functions.invoke('generate-tts', {
        body: { text: ttsText },
      });

      if (error) throw error;
      console.log('TTS: function response', { truncated: data?.truncated, mime: data?.mimeType, b64len: data?.audioContent?.length });

      if (data?.truncated) {
        toast({
          title: "Long summary truncated",
          description: "We trimmed the text to ensure reliable playback.",
        });
      }

      if (!data?.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio using a data URL for reliability across browsers
      const mime = data.mimeType || 'audio/mpeg';
      const audioSrc = `data:${mime};base64,${data.audioContent}`;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = async () => {
        console.error('TTS: audio element error', audioRef.current?.error);
        setIsPlaying(false);
        if (!triedFallbackRef.current && data?.audioContent) {
          triedFallbackRef.current = true;
          try {
            console.log('TTS: attempting Blob fallback');
            const binary = atob(data.audioContent);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: mime });
            const blobUrl = URL.createObjectURL(blob);
            const fallbackAudio = new Audio(blobUrl);
            audioRef.current = fallbackAudio;
            fallbackAudio.onplay = () => setIsPlaying(true);
            fallbackAudio.onpause = () => setIsPlaying(false);
            fallbackAudio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(blobUrl); };
            fallbackAudio.onerror = () => {
              console.error('TTS: blob fallback audio error', fallbackAudio.error);
              setIsPlaying(false);
              URL.revokeObjectURL(blobUrl);
              toast({
                title: 'Playback error',
                description: 'Audio couldn\'t be played. Please try again.',
                variant: 'destructive',
              });
            };
            await fallbackAudio.play();
            return;
          } catch (e) {
            console.error('TTS: Blob fallback failed', e);
          }
        }
        toast({
          title: 'Playback error',
          description: "Audio couldn't be played. Please try again.",
          variant: 'destructive',
        });
      };
      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        title: "Speech Generation Failed",
        description: (error as any)?.message || "Unable to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePlayPause}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : isPlaying ? (
        <>
          <VolumeX className="h-4 w-4 mr-2" />
          Pause
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4 mr-2" />
          Listen to Summary
        </>
      )}
    </Button>
  );
};
