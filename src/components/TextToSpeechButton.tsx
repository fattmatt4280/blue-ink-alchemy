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

  const ensureVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      
      const timeout = setTimeout(() => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      }, 2000);

      window.speechSynthesis.onvoiceschanged = () => {
        clearTimeout(timeout);
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    });
  };

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

      if (error) {
        console.error('TTS: cloud error', error);
        toast({
          title: "Cloud TTS Error",
          description: error.message || "Failed to generate speech",
          variant: "destructive",
        });
        throw error;
      }
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

  const startWebSpeech = async (textToSpeak: string) => {
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
      description: "Cloud TTS unavailable. Using your device's voice.",
    });

    playbackModeRef.current = 'web-speech';
    
    // Clear any stuck speech
    window.speechSynthesis.cancel();

    // Wait for voices to load
    const voices = await ensureVoices();
    if (voices.length === 0) {
      toast({
        title: "No Voices Available",
        description: "Device voice not available. Please check your system settings.",
        variant: "destructive",
      });
      return;
    }

    // Select appropriate voice
    const lang = navigator.language || 'en-US';
    let selectedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];

    // Split into sentences, then break long ones into smaller chunks
    const sentences = textToSpeak.match(/[^.!?]+[.!?]+/g) || [textToSpeak];
    const chunks: string[] = [];
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length <= 300) {
        chunks.push(trimmed);
      } else {
        // Break long sentences into ~200 char chunks
        const words = trimmed.split(' ');
        let currentChunk = '';
        words.forEach(word => {
          if ((currentChunk + ' ' + word).length > 200 && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + word;
          }
        });
        if (currentChunk) chunks.push(currentChunk.trim());
      }
    });

    let currentIndex = 0;
    let hasStarted = false;

    const speakNext = () => {
      if (currentIndex >= chunks.length) {
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
      utterance.voice = selectedVoice;
      utterance.lang = lang;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        hasStarted = true;
        setIsPlaying(true);
      };

      utterance.onend = () => {
        currentIndex++;
        if (currentIndex < chunks.length) {
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
          description: "Playback failed. Check device volume and silent mode.",
          variant: "destructive",
        });
      };

      window.speechSynthesis.speak(utterance);

      // iOS/Safari watchdog: if speech doesn't start, try resume
      if (currentIndex === 0) {
        setTimeout(() => {
          if (!hasStarted && playbackModeRef.current === 'web-speech') {
            console.log('TTS: watchdog triggering resume');
            window.speechSynthesis.resume();
            
            // Final check
            setTimeout(() => {
              if (!hasStarted && playbackModeRef.current === 'web-speech') {
                setIsPlaying(false);
                toast({
                  title: "Speech Not Starting",
                  description: "Please check Silent mode and media volume, then retry.",
                  variant: "destructive",
                });
              }
            }, 1000);
          }
        }, 800);
      }
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
