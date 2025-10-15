import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Volume2, RotateCcw } from "lucide-react";

export const TTSSettingsEditor = () => {
  const [rate, setRate] = useState(0.92);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [sampleText, setSampleText] = useState("This is a test of the text to speech settings. Adjust the rate, pitch, and volume to your preference.");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    
    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('tts_settings')
        .select('rate, pitch, volume, voice_name')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRate(Number(data.rate));
        setPitch(Number(data.pitch));
        setVolume(Number(data.volume));
        setSelectedVoice(data.voice_name || "");
      }
    } catch (error) {
      console.error('Error fetching TTS settings:', error);
      toast({
        title: "Error loading settings",
        description: "Using default values",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tts_settings')
        .update({
          rate,
          pitch,
          volume,
          voice_name: selectedVoice || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (await supabase.from('tts_settings').select('id').order('updated_at', { ascending: false }).limit(1).single()).data?.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "TTS settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving TTS settings:', error);
      toast({
        title: "Error saving settings",
        description: "Failed to update TTS settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setRate(0.92);
    setPitch(1.0);
    setVolume(1.0);
    setSelectedVoice("");
    toast({
      title: "Reset to defaults",
      description: "Don't forget to save the changes",
    });
  };

  const handleTest = () => {
    if (!window.speechSynthesis) {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not available in this browser",
        variant: "destructive",
      });
      return;
    }

    window.speechSynthesis.cancel();
    setIsTesting(true);

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (selectedVoice) {
      const voice = availableVoices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onend = () => setIsTesting(false);
    utterance.onerror = () => {
      setIsTesting(false);
      toast({
        title: "Test failed",
        description: "Error playing test audio",
        variant: "destructive",
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text-to-Speech Settings</CardTitle>
        <CardDescription>
          Adjust the voice parameters for all TTS buttons across the site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rate Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="rate">Speech Rate</Label>
            <span className="text-sm text-muted-foreground">{rate.toFixed(2)}x</span>
          </div>
          <Slider
            id="rate"
            min={0.1}
            max={2.0}
            step={0.01}
            value={[rate]}
            onValueChange={([value]) => setRate(value)}
          />
          <p className="text-xs text-muted-foreground">
            0.1x (very slow) to 2.0x (very fast) • Recommended: 0.90-0.95x
          </p>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pitch">Pitch</Label>
            <span className="text-sm text-muted-foreground">{pitch.toFixed(2)}</span>
          </div>
          <Slider
            id="pitch"
            min={0.0}
            max={2.0}
            step={0.01}
            value={[pitch]}
            onValueChange={([value]) => setPitch(value)}
          />
          <p className="text-xs text-muted-foreground">
            0.0 (low) to 2.0 (high) • Recommended: 1.0 (neutral)
          </p>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="volume">Volume</Label>
            <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            id="volume"
            min={0.0}
            max={1.0}
            step={0.01}
            value={[volume]}
            onValueChange={([value]) => setVolume(value)}
          />
          <p className="text-xs text-muted-foreground">
            0% to 100% • Recommended: 100%
          </p>
        </div>

        {/* Voice Selector */}
        <div className="space-y-2">
          <Label htmlFor="voice">Preferred Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger id="voice">
              <SelectValue placeholder="Auto-select (default)" />
            </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Auto-select (default)</SelectItem>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Male Voices</SelectLabel>
            {availableVoices
              .filter(v => v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female'))
              .map(voice => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Female Voices</SelectLabel>
            {availableVoices
              .filter(v => v.name.toLowerCase().includes('female'))
              .map(voice => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Other Voices</SelectLabel>
            {availableVoices
              .filter(v => !v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('female'))
              .map(voice => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select a specific voice or leave as auto-select to use browser default
          </p>
        </div>

        {/* Sample Text */}
        <div className="space-y-2">
          <Label htmlFor="sample">Test Text</Label>
          <Input
            id="sample"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Enter text to test..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleTest}
            disabled={isTesting || !sampleText}
            variant="outline"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Playing...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Test Voice
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
