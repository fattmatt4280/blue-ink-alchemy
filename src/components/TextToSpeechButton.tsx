import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export const TextToSpeechButton = ({ text, className, label = "Listen to Summary" }: TextToSpeechButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // PLAY: Start Web Speech
    setIsLoading(true);
    const ttsText = (text || "").replace(/\s+/g, " ").trim().slice(0, 4000);
    await startWebSpeech(ttsText);
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
          if (!hasStarted) {
            console.log('TTS: watchdog triggering resume');
            window.speechSynthesis.resume();
            
            // Final check - verify speech truly isn't working
            setTimeout(() => {
              const isSpeaking = window.speechSynthesis.speaking;
              const isPending = window.speechSynthesis.pending;
              
              if (!hasStarted && !isSpeaking && !isPending) {
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
      // Clean up speech synthesis
      window.speechSynthesis?.cancel();
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
