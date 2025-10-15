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

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

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
    // PAUSE: Handle if currently playing
    if (isPlaying) {
      if (playbackModeRef.current === 'audio' && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (playbackModeRef.current === 'web-speech') {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
      return;
    }

    // RESUME: If audio exists and is paused (not ended), resume from current position
    if (audioRef.current && playbackModeRef.current === 'audio' && !audioRef.current.ended) {
      try {
        console.log('TTS: resuming playback');
        await audioRef.current.play();
        // isPlaying will be set by onplay listener
      } catch (error) {
        console.error('TTS: resume failed', error);
        setIsPlaying(false);
      }
      return;
    }

    // GENERATE NEW: No existing audio or audio has ended
    setIsLoading(true);
    triedFallbackRef.current = false; // Reset fallback flag for new generation
    const ttsText = (text || "").replace(/\s+/g, " ").trim().slice(0, 4000);
    
    try {
      console.log('TTS: invoking generate-tts', { length: ttsText.length });
      const { data, error } = await supabase.functions.invoke('generate-tts', {
        body: { text: ttsText },
      });

      if (error) {
        console.error('TTS: cloud error', error);
        setIsLoading(false);
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
      
      // Set up event listeners with proper state management
      audio.onplay = () => {
        console.log('TTS: audio playing');
        setIsPlaying(true);
      };

      audio.onpause = () => {
        console.log('TTS: audio paused');
        // Only set to false if not ended (ended has its own handler)
        if (!audio.ended) {
          setIsPlaying(false);
        }
      };

      audio.onended = () => {
        console.log('TTS: audio ended');
        setIsPlaying(false);
        playbackModeRef.current = null; // Clear mode so next click regenerates
      };

      audio.onerror = async (e) => {
        console.error('TTS: audio element error', audio.error, e);
        setIsPlaying(false);
        setIsLoading(false);
        
        // Only try fallback once
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
            
            fallbackAudio.onplay = () => {
              console.log('TTS: blob audio playing');
              setIsPlaying(true);
            };
            fallbackAudio.onpause = () => {
              console.log('TTS: blob audio paused');
              if (!fallbackAudio.ended) {
                setIsPlaying(false);
              }
            };
            fallbackAudio.onended = () => {
              console.log('TTS: blob audio ended');
              setIsPlaying(false);
              playbackModeRef.current = null;
              URL.revokeObjectURL(blobUrl);
            };
            fallbackAudio.onerror = () => {
              console.error('TTS: blob fallback audio error', fallbackAudio.error);
              setIsPlaying(false);
              URL.revokeObjectURL(blobUrl);
              // Try Web Speech as final fallback
              startWebSpeech(ttsText);
            };
            
            await fallbackAudio.play();
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('TTS: Blob fallback failed', e);
            await startWebSpeech(ttsText);
            setIsLoading(false);
          }
        } else {
          await startWebSpeech(ttsText);
          setIsLoading(false);
        }
      };

      // Attempt initial playback
      try {
        console.log('TTS: attempting initial playback');
        await audio.play();
        console.log('TTS: initial playback started successfully');
        setIsLoading(false);
      } catch (playError) {
        console.error('TTS: initial play failed', playError);
        setIsPlaying(false);
        
        // Don't rely on onerror for play failures, handle directly
        if (!triedFallbackRef.current && data?.audioContent) {
          triedFallbackRef.current = true;
          try {
            console.log('TTS: play failed, trying Blob approach');
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
            fallbackAudio.onpause = () => !fallbackAudio.ended && setIsPlaying(false);
            fallbackAudio.onended = () => {
              setIsPlaying(false);
              playbackModeRef.current = null;
              URL.revokeObjectURL(blobUrl);
            };
            fallbackAudio.onerror = () => {
              setIsPlaying(false);
              URL.revokeObjectURL(blobUrl);
              startWebSpeech(ttsText);
            };
            
            await fallbackAudio.play();
            setIsLoading(false);
          } catch (e) {
            console.error('TTS: Blob approach failed', e);
            await startWebSpeech(ttsText);
            setIsLoading(false);
          }
        } else {
          await startWebSpeech(ttsText);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('TTS: Error generating speech', error);
      setIsLoading(false);
      // Try Web Speech as fallback
      await startWebSpeech(ttsText);
    }
  };

  const startWebSpeech = async (textToSpeak: string) => {
    if (!window.speechSynthesis) {
      toast({
        title: "Text-to-Speech Unavailable",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Using Device Voice",
      description: "Cloud TTS unavailable. Using your device's voice.",
    });

    // Clear any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
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
        setIsLoading(false);
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
        const watchdogDelay = isIOS() ? 1500 : 800;
        const finalCheckDelay = isIOS() ? 2000 : 1000;
        
        setTimeout(() => {
          if (!hasStarted && playbackModeRef.current === 'web-speech') {
            console.log('TTS: watchdog triggering resume');
            window.speechSynthesis.resume();
            
            // Final check - verify speech truly isn't working
            setTimeout(() => {
              const isSpeaking = window.speechSynthesis.speaking;
              const isPending = window.speechSynthesis.pending;
              
              if (!hasStarted && 
                  playbackModeRef.current === 'web-speech' &&
                  !isSpeaking && 
                  !isPending) {
                setIsPlaying(false);
                setIsLoading(false);
                toast({
                  title: "Speech Not Starting",
                  description: isIOS() 
                    ? "If you don't hear audio, check the Silent switch (left side of device) and volume, then retry."
                    : "Please check Silent mode and media volume, then retry.",
                  variant: "destructive",
                });
              } else if (isSpeaking || isPending) {
                // Speech is working, just slow to trigger onstart
                console.log('TTS: Speech detected as working');
                setIsLoading(false);
              }
            }, finalCheckDelay);
          } else if (hasStarted) {
            setIsLoading(false);
          }
        }, watchdogDelay);
      }
    };

    speakNext();
  };

  useEffect(() => {
    return () => {
      // Clean up audio
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
        } catch {}
        audioRef.current = null;
      }
      
      // Clean up speech synthesis
      if (playbackModeRef.current === 'web-speech') {
        window.speechSynthesis?.cancel();
      }
      
      // Reset state
      playbackModeRef.current = null;
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
