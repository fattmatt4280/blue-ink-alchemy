import { useEffect, useState } from "react";

interface AnalyzingAnimationProps {
  mode: "progress" | "concerns" | "urgent";
}

export const AnalyzingAnimation = ({ mode }: AnalyzingAnimationProps) => {
  const [dots, setDots] = useState("...");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const modeConfig = {
    progress: {
      primary: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/50",
      particle: "bg-blue-400",
      text: "Analyzing your healing progress",
    },
    concerns: {
      primary: "from-amber-500 to-yellow-500",
      glow: "shadow-amber-500/50",
      particle: "bg-amber-400",
      text: "Reviewing your concerns",
    },
    urgent: {
      primary: "from-red-500 to-orange-500",
      glow: "shadow-red-500/50",
      particle: "bg-red-400",
      text: "Performing urgent assessment",
    },
  };

  const config = modeConfig[mode];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md px-8">
        {/* 3D Medical Cross Animation */}
        <div className="relative h-64 flex items-center justify-center mb-8">
          {/* Glow Effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${config.primary} opacity-20 blur-3xl animate-pulse`}
          />

          {/* Main 3D Cross Structure */}
          <div className="relative w-32 h-32" style={{ perspective: "1000px" }}>
            <div
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                animation: "spin3d 3s linear infinite",
              }}
            >
              {/* Vertical Bar */}
              <div
                className={`absolute left-1/2 top-0 w-8 h-32 -translate-x-1/2 bg-gradient-to-b ${config.primary} ${config.glow} shadow-2xl rounded-lg`}
                style={{ transform: "rotateY(0deg) translateZ(20px)" }}
              />
              <div
                className={`absolute left-1/2 top-0 w-8 h-32 -translate-x-1/2 bg-gradient-to-b ${config.primary} ${config.glow} shadow-2xl rounded-lg opacity-70`}
                style={{ transform: "rotateY(90deg) translateZ(20px)" }}
              />

              {/* Horizontal Bar */}
              <div
                className={`absolute top-1/2 left-0 w-32 h-8 -translate-y-1/2 bg-gradient-to-r ${config.primary} ${config.glow} shadow-2xl rounded-lg`}
                style={{ transform: "rotateX(0deg) translateZ(20px)" }}
              />
              <div
                className={`absolute top-1/2 left-0 w-32 h-8 -translate-y-1/2 bg-gradient-to-r ${config.primary} ${config.glow} shadow-2xl rounded-lg opacity-70`}
                style={{ transform: "rotateX(90deg) translateZ(20px)" }}
              />
            </div>
          </div>

          {/* Floating Particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute ${config.particle} rounded-full opacity-60`}
              style={{
                width: Math.random() * 8 + 4 + "px",
                height: Math.random() * 8 + 4 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}

          {/* Orbiting Rings */}
          <div
            className={`absolute inset-0 border-2 border-${mode === "progress" ? "blue" : mode === "concerns" ? "amber" : "red"}-500/30 rounded-full`}
            style={{ animation: "spin 4s linear infinite" }}
          />
          <div
            className={`absolute inset-4 border-2 border-${mode === "progress" ? "cyan" : mode === "concerns" ? "yellow" : "orange"}-500/20 rounded-full`}
            style={{ animation: "spin 3s linear infinite reverse" }}
          />
        </div>

        {/* Status Text */}
        <div className="text-center space-y-4">
          <h2 className={`text-2xl font-semibold bg-gradient-to-r ${config.primary} bg-clip-text text-transparent`}>
            {config.text}{dots}
          </h2>
          <p className="text-muted-foreground text-sm">
            Our AI is carefully reviewing your photos and symptoms
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 ${config.particle} rounded-full animate-pulse`} />
            <span>Analyzing image data</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${config.primary}`}
            style={{ animation: "progress 2s ease-in-out infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin3d {
          0% {
            transform: rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: rotateX(180deg) rotateY(180deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
