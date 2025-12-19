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

    // Animate values using requestAnimationFrame for smooth 60fps animation
    const duration = 800;
    let startTime: number | null = null;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      setAnimatedMetrics({
        inflammation: Math.round(calculated.inflammation * easedProgress),
        infectionRisk: Math.round(calculated.infectionRisk * easedProgress),
        healingProgress: Math.round(calculated.healingProgress * easedProgress),
        colorSaturation: Math.round(calculated.colorSaturation * easedProgress),
        textureQuality: Math.round(calculated.textureQuality * easedProgress),
        overallHealth: Math.round(calculated.overallHealth * easedProgress),
      });

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [analysisData, formData]);

  const calculateMetrics = (analysis: any, data: HealingQuestionData): Metrics => {
    // 1. Healing Progress - Use AI's progressScore (already accounts for visual assessment and complications)
    let healingProgress = analysis.progressScore;
    
    // Fallback: Simple age-based calculation if AI didn't provide progressScore
    if (!healingProgress && analysis.tattooAgeDays) {
      healingProgress = Math.min((analysis.tattooAgeDays / 62) * 100, 100);
    }
    
    // Final fallback
    healingProgress = healingProgress || 5;

    // 2. Inflammation (from symptoms - higher = worse)
    const inflammation =
      (data.symptoms.redness ? 25 : 0) +
      (data.symptoms.swelling ? 25 : 0) +
      (data.symptoms.heat ? 35 : 0) +
      (data.symptoms.discharge ? 15 : 0);

    // 3. Infection Risk (from symptoms)
    const infectionRisk =
      (data.symptoms.discharge ? 35 : 0) +
      (data.symptoms.heat ? 30 : 0) +
      (data.symptoms.pain ? 20 : 0) +
      (data.symptoms.swelling ? 15 : 0);

    // 4. Extract color and texture from visual assessment
    const colorAssessment = analysis.visualAssessment?.colorAssessment?.toLowerCase() || '';
    const textureAssessment = analysis.visualAssessment?.textureAssessment?.toLowerCase() || '';
    const overallCondition = analysis.visualAssessment?.overallCondition?.toLowerCase() || '';

    // 5. Color Saturation (extract from AI assessment, use healing progress as context)
    const colorSaturation = extractColorScore(colorAssessment, overallCondition, healingProgress);

    // 6. Texture Quality (extract from AI assessment, use healing progress as context)
    const textureQuality = extractTextureScore(textureAssessment, overallCondition, healingProgress);

    // 7. Overall Health (weighted average - inflammation and infection are BAD, so invert them)
    const overallHealth = Math.round(
      healingProgress * 0.4 +           // 40% weight on actual healing progress
      (100 - inflammation) * 0.25 +     // 25% weight (inverted - lower inflammation is better)
      (100 - infectionRisk) * 0.25 +    // 25% weight (inverted - lower risk is better)
      colorSaturation * 0.05 +          // 5% weight
      textureQuality * 0.05             // 5% weight
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

  const extractColorScore = (
    colorAssessment: string,
    overallCondition: string,
    healingProgress: number
  ): number => {
    // Good color indicators
    if (
      colorAssessment.includes("vibrant") ||
      colorAssessment.includes("bold") ||
      colorAssessment.includes("saturated") ||
      colorAssessment.includes("excellent")
    ) {
      return Math.min(healingProgress + 15, 95);
    }
    if (colorAssessment.includes("good") || colorAssessment.includes("solid")) {
      return Math.min(healingProgress + 8, 85);
    }
    
    // Poor color indicators
    if (
      colorAssessment.includes("fading") ||
      colorAssessment.includes("dull") ||
      colorAssessment.includes("pale")
    ) {
      return Math.max(healingProgress - 20, 20);
    }
    
    // Check overall condition for color mentions
    if (overallCondition.includes("vibrant") || overallCondition.includes("bold")) {
      return Math.min(healingProgress + 10, 90);
    }
    
    // Default: slightly better than healing progress
    return Math.min(healingProgress + 5, 90);
  };

  const extractTextureScore = (
    textureAssessment: string,
    overallCondition: string,
    healingProgress: number
  ): number => {
    // Good texture indicators
    if (textureAssessment.includes("smooth") || textureAssessment.includes("healed well")) {
      return Math.min(healingProgress + 18, 95);
    }
    
    // Expected texture for healing stage (normal scabbing/peeling)
    if (
      textureAssessment.includes("peeling") ||
      textureAssessment.includes("scabbing") ||
      textureAssessment.includes("flaking")
    ) {
      // Normal for early/mid healing - slight penalty
      return Math.max(healingProgress - 5, 25);
    }
    
    // Poor texture indicators
    if (textureAssessment.includes("rough") || textureAssessment.includes("raised")) {
      return Math.max(healingProgress - 18, 20);
    }
    
    // Check overall condition for texture mentions
    if (overallCondition.includes("smooth") || overallCondition.includes("healthy")) {
      return Math.min(healingProgress + 12, 90);
    }
    
    // Default: aligned with healing progress
    return Math.min(healingProgress + 3, 85);
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
                    <span className="text-white text-sm font-medium">
                      {item.label}
                      {item.label === "Healing Progress" && analysisData.tattooAgeDays && (
                        <span className="text-white/60 text-xs ml-1">
                          (Day {analysisData.tattooAgeDays}/62)
                        </span>
                      )}
                    </span>
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
