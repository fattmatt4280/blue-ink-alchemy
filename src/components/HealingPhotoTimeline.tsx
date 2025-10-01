import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { HealingHistoryEntry } from "@/hooks/useHealingHistory";

interface HealingPhotoTimelineProps {
  entries: HealingHistoryEntry[];
}

export const HealingPhotoTimeline = ({ entries }: HealingPhotoTimelineProps) => {
  const [selectedEntry, setSelectedEntry] = useState<HealingHistoryEntry | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Photo Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedEntry(entry)}
              >
                <img
                  src={entry.photo_url}
                  alt={`Progress on ${format(new Date(entry.created_at), "MMM dd")}`}
                  className="w-full aspect-square object-cover rounded-lg transition-transform group-hover:scale-105"
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

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Analysis from {selectedEntry && format(new Date(selectedEntry.created_at), "MMMM dd, yyyy")}
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <img
                src={selectedEntry.photo_url}
                alt="Full size tattoo"
                className="w-full rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Healing Stage</p>
                  <Badge>{selectedEntry.healing_stage}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Progress Score</p>
                  <p className="text-2xl font-bold text-primary">{selectedEntry.progress_score}/100</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Recommendations</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {selectedEntry.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
