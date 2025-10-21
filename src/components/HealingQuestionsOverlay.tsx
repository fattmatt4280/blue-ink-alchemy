import { useState } from "react";
import { CapturedPhoto, CameraMode } from "@/hooks/useCamera";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { Loader2, X } from "lucide-react";

interface HealingQuestionsOverlayProps {
  photos: CapturedPhoto[];
  mode: CameraMode;
  onSubmit: (data: HealingQuestionData) => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

export interface HealingQuestionData {
  tattooAge: string;
  aftercareProducts: string;
  knownAllergies: string;
  symptoms: {
    redness: boolean;
    swelling: boolean;
    heat: boolean;
    pain: boolean;
    discharge: boolean;
    itching: boolean;
  };
  additionalNotes: string;
  termsAccepted: boolean;
}

export const HealingQuestionsOverlay = ({
  photos,
  mode,
  onSubmit,
  onClose,
  isAnalyzing
}: HealingQuestionsOverlayProps) => {
  const [formData, setFormData] = useState<HealingQuestionData>({
    tattooAge: '',
    aftercareProducts: '',
    knownAllergies: '',
    symptoms: {
      redness: false,
      swelling: false,
      heat: false,
      pain: false,
      discharge: false,
      itching: false
    },
    additionalNotes: '',
    termsAccepted: false
  });

  const handleSymptomChange = (symptom: keyof typeof formData.symptoms) => {
    setFormData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: !prev.symptoms[symptom]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tattooAge || !formData.termsAccepted) return;
    onSubmit(formData);
  };

  const getModeInfo = () => {
    switch (mode) {
      case 'progress':
        return {
          icon: '📊',
          title: 'Progress Check',
          description: 'Let\'s track your healing journey'
        };
      case 'concerns':
        return {
          icon: '⚠️',
          title: 'Concern Assessment',
          description: 'We\'ll analyze your concerns carefully'
        };
      case 'urgent':
        return {
          icon: '🚨',
          title: 'Urgent Assessment',
          description: 'Priority analysis for immediate feedback'
        };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 pb-20">
        {/* Background Photo (blurred) */}
        <div className="fixed inset-0 -z-10 opacity-10">
          <img
            src={photos[0]?.dataUrl}
            alt="Background"
            className="w-full h-full object-cover blur-2xl"
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto pt-16">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">{modeInfo.icon}</div>
              <h2 className="text-2xl font-bold text-white">{modeInfo.title}</h2>
              <p className="text-white/70">{modeInfo.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tattoo Age */}
              <div className="space-y-2">
                <Label htmlFor="tattooAge" className="text-white">
                  How old is your tattoo? *
                </Label>
                <Input
                  id="tattooAge"
                  placeholder="e.g., 3 days, 1 week, 2 weeks"
                  value={formData.tattooAge}
                  onChange={(e) => setFormData(prev => ({ ...prev, tattooAge: e.target.value }))}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Aftercare Products */}
              <div className="space-y-2">
                <Label htmlFor="aftercare" className="text-white">
                  What aftercare products are you using?
                </Label>
                <Input
                  id="aftercare"
                  placeholder="e.g., Aquaphor, tattoo balm, specific brands"
                  value={formData.aftercareProducts}
                  onChange={(e) => setFormData(prev => ({ ...prev, aftercareProducts: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Known Allergies */}
              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-white">
                  Any known allergies or sensitivities?
                </Label>
                <Input
                  id="allergies"
                  placeholder="e.g., latex, certain inks, fragrances"
                  value={formData.knownAllergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, knownAllergies: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              {/* Symptoms Checklist */}
              <div className="space-y-3">
                <Label className="text-white">Are you experiencing any of these symptoms?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(formData.symptoms).map(([symptom, checked]) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={checked}
                        onCheckedChange={() => handleSymptomChange(symptom as keyof typeof formData.symptoms)}
                        className="border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={symptom}
                        className="text-sm text-white capitalize cursor-pointer"
                      >
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">
                  Additional notes or concerns
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Describe any other details or concerns..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-24"
                />
              </div>

              {/* Terms Acceptance */}
              <div className="flex items-start space-x-2 p-4 bg-white/5 rounded-lg border border-white/10">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, termsAccepted: checked as boolean }))
                  }
                  className="mt-1 border-white/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  required
                />
                <label htmlFor="terms" className="text-sm text-white/80 cursor-pointer">
                  I understand this is an AI assessment tool and not a substitute for professional medical advice. 
                  For serious concerns, I will consult a healthcare provider. *
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isAnalyzing || !formData.tattooAge || !formData.termsAccepted}
                className="w-full h-14 text-lg font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Healing Progress'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
