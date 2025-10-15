import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export const TextToSpeechButton = ({ text, className, label = "Listen to Summary" }: TextToSpeechButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const triedFallbackRef = useRef(false);
  const playbackModeRef = useRef<'audio' | 'web-speech' | null>(null);
  const { toast } = useToast();

  const handlePlayPause = async () => {
    // If already playing, pause/cancel based on mode
    if (isPlaying) {
      if (playbackModeRef.current === 'audio' && audioRef.current) {
        audioRef.current.pause();
      } else if (playbackModeRef.current === 'web-speech') {
        window.speechSynthesis.cancel();
      }
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
    const ttsText = (text || "").replace(/\s+/g, " ").trim().slice(0, 4000);
    
    try {
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

      playbackModeRef.current = 'audio';
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
            playbackModeRef.current = 'audio';
            fallbackAudio.onplay = () => setIsPlaying(true);
            fallbackAudio.onpause = () => setIsPlaying(false);
            fallbackAudio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(blobUrl); };
            fallbackAudio.onerror = () => {
              console.error('TTS: blob fallback audio error', fallbackAudio.error);
              setIsPlaying(false);
              URL.revokeObjectURL(blobUrl);
              // Try Web Speech as final fallback
              startWebSpeech(ttsText);
            };
            await fallbackAudio.play();
            return;
          } catch (e) {
            console.error('TTS: Blob fallback failed', e);
            startWebSpeech(ttsText);
          }
        } else {
          startWebSpeech(ttsText);
        }
      };
      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      // Try Web Speech as fallback
      startWebSpeech(ttsText);
    } finally {
      setIsLoading(false);
    }
  };

  const startWebSpeech = (textToSpeak: string) => {
    if (!window.speechSynthesis) {
      toast({
        title: "Text-to-Speech Unavailable",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Using Device Voice",
      description: "Cloud TTS unavailable. Falling back to your device's voice.",
    });

    playbackModeRef.current = 'web-speech';
    
    // Split into sentences for better chunking
    const sentences = textToSpeak.match(/[^.!?]+[.!?]+/g) || [textToSpeak];
    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= sentences.length) {
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentences[currentIndex].trim());
      
      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        currentIndex++;
        if (currentIndex < sentences.length) {
          speakNext();
        } else {
          setIsPlaying(false);
        }
      };

      utterance.onerror = (event) => {
        console.error('Web Speech error:', event);
        setIsPlaying(false);
        toast({
          title: "Speech Error",
          description: "An error occurred during playback.",
          variant: "destructive",
        });
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current = null;
      }
      if (playbackModeRef.current === 'web-speech') {
        window.speechSynthesis?.cancel();
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
          {label}
        </>
      )}
    </Button>
  );
};
