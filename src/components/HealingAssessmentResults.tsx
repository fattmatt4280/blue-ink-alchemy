import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Slider } from "./ui/slider";
import { FileText, Eye, Download } from "lucide-react";
import { HealingQuestionData } from "./HealingQuestionsOverlay";

interface HealingAssessmentResultsProps {
  analysisData: any;
  photoUrl: string;
  formData: HealingQuestionData;
  onLogOnly: () => void;
  onViewAnalysis: () => void;
  onDownload: () => void;
}

interface Metrics {
  inflammation: number;
  infectionRisk: number;
  healingProgress: number;
  colorSaturation: number;
  textureQuality: number;
  overallHealth: number;
}

export const HealingAssessmentResults = ({
  analysisData,
  photoUrl,
  formData,
  onLogOnly,
  onViewAnalysis,
  onDownload,
}: HealingAssessmentResultsProps) => {
  const [metrics, setMetrics] = useState<Metrics>({
    inflammation: 0,
    infectionRisk: 0,
    healingProgress: 0,
    colorSaturation: 0,
    textureQuality: 0,
    overallHealth: 0,
  });

  const [animatedMetrics, setAnimatedMetrics] = useState<Metrics>({
    inflammation: 0,
    infectionRisk: 0,
    healingProgress: 0,
    colorSaturation: 0,
    textureQuality: 0,
    overallHealth: 0,
  });

  useEffect(() => {
    const calculated = calculateMetrics(analysisData, formData);
    setMetrics(calculated);

    // Animate values
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedMetrics({
        inflammation: Math.round(calculated.inflammation * progress),
        infectionRisk: Math.round(calculated.infectionRisk * progress),
        healingProgress: Math.round(calculated.healingProgress * progress),
        colorSaturation: Math.round(calculated.colorSaturation * progress),
        textureQuality: Math.round(calculated.textureQuality * progress),
        overallHealth: Math.round(calculated.overallHealth * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [analysisData, formData]);

  const calculateMetrics = (analysis: any, data: HealingQuestionData): Metrics => {
    // Inflammation (from symptoms - inverted so higher = worse)
    const inflammation =
      (data.symptoms.redness ? 30 : 0) +
      (data.symptoms.swelling ? 30 : 0) +
      (data.symptoms.heat ? 40 : 0);

    // Infection risk (from symptoms)
    const infectionRisk =
      (data.symptoms.discharge ? 40 : 0) +
      (data.symptoms.heat ? 30 : 0) +
      (data.symptoms.pain ? 30 : 0);

    // Healing progress (directly from AI)
    const healingProgress = analysis.progressScore || 50;

    // Extract color and texture from visual assessment
    const visualAssessment = analysis.visualAssessment?.toLowerCase() || '';
    const colorSaturation = extractColorScore(visualAssessment, analysis);
    const textureQuality = extractTextureScore(visualAssessment, analysis);

    // Overall health (weighted average - inflammation and infection are inverted)
    const overallHealth = Math.round(
      healingProgress * 0.4 +
        (100 - inflammation) * 0.2 +
        (100 - infectionRisk) * 0.2 +
        colorSaturation * 0.1 +
        textureQuality * 0.1
    );

    return {
      inflammation,
      infectionRisk,
      healingProgress,
      colorSaturation,
      textureQuality,
      overallHealth,
    };
  };

  const extractColorScore = (assessment: string, analysis: any): number => {
    // Check for positive indicators
    if (
      assessment.includes("vibrant") ||
      assessment.includes("bold") ||
      assessment.includes("saturated") ||
      assessment.includes("excellent color")
    ) {
      return 85;
    }
    if (assessment.includes("good color") || assessment.includes("solid saturation")) {
      return 75;
    }
    if (
      assessment.includes("fading") ||
      assessment.includes("dull") ||
      assessment.includes("pale")
    ) {
      return 45;
    }
    // Default based on progress score
    return Math.min(90, Math.max(50, (analysis.progressScore || 50) + 10));
  };

  const extractTextureScore = (assessment: string, analysis: any): number => {
    // Check for positive indicators
    if (assessment.includes("smooth") || assessment.includes("healed well")) {
      return 85;
    }
    if (
      assessment.includes("peeling") ||
      assessment.includes("scabbing") ||
      assessment.includes("flaking")
    ) {
      return 60;
    }
    if (assessment.includes("rough") || assessment.includes("raised")) {
      return 45;
    }
    // Default based on healing stage
    const stage = analysis.healingStage?.toLowerCase() || '';
    if (stage.includes("healed") || stage.includes("matured")) return 90;
    if (stage.includes("settling") || stage.includes("recovery")) return 70;
    return 60;
  };

  const getMetricColor = (value: number, inverted: boolean = false): string => {
    const actual = inverted ? 100 - value : value;
    if (actual >= 71) return "from-emerald-500 to-green-600";
    if (actual >= 41) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-red-600";
  };

  const getMetricTextColor = (value: number, inverted: boolean = false): string => {
    const actual = inverted ? 100 - value : value;
    if (actual >= 71) return "text-emerald-400";
    if (actual >= 41) return "text-yellow-400";
    return "text-red-400";
  };

  const metricItems = [
    {
      label: "Overall Health",
      value: animatedMetrics.overallHealth,
      icon: "🏥",
      inverted: false,
    },
    {
      label: "Healing Progress",
      value: animatedMetrics.healingProgress,
      icon: "📈",
      inverted: false,
    },
    {
      label: "Inflammation Level",
      value: animatedMetrics.inflammation,
      icon: "🔥",
      inverted: true,
    },
    {
      label: "Infection Risk",
      value: animatedMetrics.infectionRisk,
      icon: "⚠️",
      inverted: true,
    },
    {
      label: "Color Saturation",
      value: animatedMetrics.colorSaturation,
      icon: "🎨",
      inverted: false,
    },
    {
      label: "Texture Quality",
      value: animatedMetrics.textureQuality,
      icon: "✨",
      inverted: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 pb-32">
        <div className="max-w-2xl mx-auto pt-8 space-y-6 animate-in fade-in duration-500">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-white">Assessment Results</h1>
            <p className="text-white/70 text-sm">Visual analysis of your healing factors</p>
          </div>

          {/* Tattoo Photo */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
            <img
              src={photoUrl}
              alt="Your tattoo"
              className="w-full h-48 object-cover rounded-lg"
            />
          </Card>

          {/* Metrics */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 space-y-6">
            {metricItems.map((item, idx) => (
              <div
                key={item.label}
                className="space-y-2 animate-in slide-in-from-left duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-white text-sm font-medium">{item.label}</span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${getMetricTextColor(
                      item.value,
                      item.inverted
                    )}`}
                  >
                    {item.value}%
                  </span>
                </div>
                <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getMetricColor(
                      item.value,
                      item.inverted
                    )} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>

          {/* Healing Stage Badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full">
              <span className="text-white/70 text-sm">Healing Stage:</span>
              <span className="text-white font-semibold">
                {analysisData.healingStage || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {/* Log Only */}
          <Button
            variant="outline"
            onClick={onLogOnly}
            className="w-full h-12 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Log Interaction Only
          </Button>

          {/* View Analysis */}
          <Button onClick={onViewAnalysis} className="w-full h-12 bg-primary hover:bg-primary/90">
            <Eye className="mr-2 h-4 w-4" />
            View Full Analysis
          </Button>

          {/* Download */}
          <Button
            variant="secondary"
            onClick={onDownload}
            className="w-full h-12 bg-white/20 text-white hover:bg-white/30"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
};
