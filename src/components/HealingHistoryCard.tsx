import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { HealingHistoryEntry } from "@/hooks/useHealingHistory";

interface HealingHistoryCardProps {
  entry: HealingHistoryEntry;
  onClick?: () => void;
}

export const HealingHistoryCard = ({ entry, onClick }: HealingHistoryCardProps) => {
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      "Fresh": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Early Healing": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "Scabbing Phase": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Peeling Phase": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Late Healing": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Settled": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    };
    return colors[stage] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 20) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a")}
          </div>
          <Badge className={getStageColor(entry.healing_stage)}>
            {entry.healing_stage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <img
            src={entry.photo_url}
            alt="Tattoo progress"
            className="w-24 h-24 object-cover rounded-lg border"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Progress Score:</span>
              <span className={`text-2xl font-bold ${getScoreColor(entry.progress_score)}`}>
                {entry.progress_score}/100
              </span>
            </div>
            {entry.analysis_result?.summary && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {entry.analysis_result.summary}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
