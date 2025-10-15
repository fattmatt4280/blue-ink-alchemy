import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { HealingHistoryEntry } from "@/hooks/useHealingHistory";

interface HealingPhotoTimelineProps {
  entries: HealingHistoryEntry[];
}

export const HealingPhotoTimeline = ({ entries }: HealingPhotoTimelineProps) => {
  return (
    <Card>
        <CardHeader>
          <CardTitle>Photo Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="relative group"
              >
                <img
                  src={entry.photo_url}
                  alt={`Progress on ${format(new Date(entry.created_at), "MMM dd")}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-end justify-center pb-2">
                  <Badge className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {format(new Date(entry.created_at), "MMM dd")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
  );
};
