import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { HealingHistoryEntry } from "@/hooks/useHealingHistory";

const NEON_CYAN = "#00f5ff";

interface HealingHistoryCardProps {
  entry: HealingHistoryEntry;
  onClick?: () => void;
  isLatest?: boolean;
}

export const HealingHistoryCard = ({ entry, onClick, isLatest }: HealingHistoryCardProps) => {
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      "Fresh": "bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.3)]",
      "Early Healing": "bg-orange-500/20 text-orange-300 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.3)]",
      "Scabbing Phase": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-[0_0_8px_rgba(234,179,8,0.3)]",
      "Peeling Phase": "bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.3)]",
      "Late Healing": "bg-green-500/20 text-green-300 border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.3)]",
      "Settled": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
    };
    return colors[stage] || "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
  };

  return (
    <Card 
      className={`cursor-pointer neon-card hover:shadow-[0_0_25px_rgba(0,245,255,0.25)] transition-all duration-200 ${
        isLatest ? 'ring-2 ring-cyan-500/50 shadow-[0_0_30px_rgba(0,245,255,0.2)]' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-cyan-300/60">
            <Calendar className="w-4 h-4 text-cyan-400" style={{ filter: `drop-shadow(0 0 4px ${NEON_CYAN})` }} />
            {format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a")}
          </div>
          <div className="flex items-center gap-2">
            {isLatest && (
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_10px_rgba(0,245,255,0.4)]">
                ✨ Latest
              </Badge>
            )}
            <Badge className={`border ${getStageColor(entry.healing_stage)}`}>
              {entry.healing_stage}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <img
            src={entry.photo_url}
            alt="Tattoo progress"
            className="w-24 h-24 object-cover rounded-lg border border-cyan-500/30 shadow-[0_0_10px_rgba(0,245,255,0.15)]"
          />
          <div className="flex-1 space-y-2">
            {entry.analysis_result?.summary && (
              <p className="text-sm text-foreground/70 line-clamp-2 leading-relaxed">
                {entry.analysis_result.summary}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-cyan-300/50">
              <span>{entry.recommendations.length} recommendation{entry.recommendations.length !== 1 ? 's' : ''}</span>
              {entry.analysis_result?.tattooAgeDays && (
                <>
                  <span>•</span>
                  <span>{entry.analysis_result.tattooAgeDays} days old</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
