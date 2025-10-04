import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HealingHistoryEntry } from "@/hooks/useHealingHistory";

interface HealingPhotoTimelineProps {
  entries: HealingHistoryEntry[];
}

export const HealingPhotoTimeline = ({ entries }: HealingPhotoTimelineProps) => {
  const [selectedEntry, setSelectedEntry] = useState<HealingHistoryEntry | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const selectedPhotoUrls = selectedEntry?.photo_urls?.length ? selectedEntry.photo_urls : [selectedEntry?.photo_url].filter(Boolean);
  
  const handlePreviousPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : selectedPhotoUrls.length - 1));
  };
  
  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < selectedPhotoUrls.length - 1 ? prev + 1 : 0));
  };

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

      <Dialog open={!!selectedEntry} onOpenChange={() => { setSelectedEntry(null); setCurrentPhotoIndex(0); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Analysis from {selectedEntry && format(new Date(selectedEntry.created_at), "MMMM dd, yyyy")}
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              {/* Photo Carousel */}
              <div className="relative">
                <img
                  src={selectedPhotoUrls[currentPhotoIndex]}
                  alt={`Healing progress ${currentPhotoIndex + 1}`}
                  className="w-full rounded-lg"
                />
                {selectedPhotoUrls.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={handlePreviousPhoto}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={handleNextPhoto}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
                      {currentPhotoIndex + 1} / {selectedPhotoUrls.length}
                    </div>
                  </>
                )}
              </div>
              
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
