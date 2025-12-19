import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { HealingHistoryEntry } from "@/hooks/useHealingHistory";
import { X, ZoomIn, ZoomOut, Move } from "lucide-react";

const NEON_CYAN = "#00f5ff";

interface HealingPhotoComparisonProps {
  entries: HealingHistoryEntry[];
  onClose: () => void;
}

export const HealingPhotoComparison = ({ entries, onClose }: HealingPhotoComparisonProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<HealingHistoryEntry[]>(
    entries.slice(0, 2)
  );
  const [opacity, setOpacity] = useState([50]);
  const [zoom, setZoom] = useState([100]);
  const [viewMode, setViewMode] = useState<"side-by-side" | "overlay">("side-by-side");

  const togglePhotoSelection = (entry: HealingHistoryEntry) => {
    if (selectedPhotos.find(p => p.id === entry.id)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== entry.id));
    } else if (selectedPhotos.length < 4) {
      setSelectedPhotos([...selectedPhotos, entry]);
    }
  };

  return (
    <Card className="w-full neon-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-rajdhani text-cyan-400">Photo Comparison Tool</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-cyan-500/10 text-cyan-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Selection */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-cyan-300/80">Select Photos to Compare (2-4)</h3>
          <div className="grid grid-cols-4 gap-2">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => togglePhotoSelection(entry)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedPhotos.find(p => p.id === entry.id)
                    ? "border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.4)]"
                    : "border-cyan-500/20 hover:border-cyan-500/50"
                }`}
              >
                <img
                  src={entry.photo_url}
                  alt={format(new Date(entry.created_at), "MMM dd")}
                  className="w-full h-full object-cover"
                />
                {selectedPhotos.find(p => p.id === entry.id) && (
                  <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_10px_rgba(0,245,255,0.4)]">
                      Selected
                    </Badge>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "side-by-side" ? "default" : "outline"}
            onClick={() => setViewMode("side-by-side")}
            size="sm"
            className={viewMode === "side-by-side" 
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-[0_0_15px_rgba(0,245,255,0.3)]" 
              : "border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-cyan-400"
            }
          >
            Side by Side
          </Button>
          <Button
            variant={viewMode === "overlay" ? "default" : "outline"}
            onClick={() => setViewMode("overlay")}
            size="sm"
            disabled={selectedPhotos.length !== 2}
            className={viewMode === "overlay" 
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-[0_0_15px_rgba(0,245,255,0.3)]" 
              : "border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-cyan-400 disabled:opacity-50"
            }
          >
            Overlay
          </Button>
        </div>

        {/* Controls */}
        {viewMode === "overlay" && selectedPhotos.length === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-cyan-300/80">Opacity</label>
                <span className="text-sm text-cyan-400">{opacity[0]}%</span>
              </div>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                min={0}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:shadow-[0_0_8px_rgba(0,245,255,0.5)] [&>.bg-primary]:bg-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-cyan-300/80">Zoom</label>
                <span className="text-sm text-cyan-400">{zoom[0]}%</span>
              </div>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={50}
                max={200}
                step={10}
                className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:shadow-[0_0_8px_rgba(0,245,255,0.5)] [&>.bg-primary]:bg-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Comparison View */}
        {selectedPhotos.length >= 2 && (
          <div className="space-y-4">
            {viewMode === "side-by-side" ? (
              <div className={`grid gap-4 ${
                selectedPhotos.length === 2 ? "grid-cols-2" : 
                selectedPhotos.length === 3 ? "grid-cols-3" : 
                "grid-cols-2"
              }`}>
                {selectedPhotos.map((entry) => (
                  <div key={entry.id} className="space-y-2">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(0,245,255,0.15)]">
                      <img
                        src={entry.photo_url}
                        alt={`Progress on ${format(new Date(entry.created_at), "MMM dd")}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-cyan-300">
                        {format(new Date(entry.created_at), "MMM dd, yyyy")}
                      </p>
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                        {entry.healing_stage}
                      </Badge>
                      <p className="text-xs text-cyan-300/50">
                        Score: {entry.progress_score}/100
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative aspect-square rounded-lg overflow-hidden border border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.2)]">
                <img
                  src={selectedPhotos[0].photo_url}
                  alt="Base"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: `scale(${zoom[0] / 100})` }}
                />
                <img
                  src={selectedPhotos[1].photo_url}
                  alt="Overlay"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: opacity[0] / 100,
                    transform: `scale(${zoom[0] / 100})`,
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_10px_rgba(0,245,255,0.4)]">
                    {format(new Date(selectedPhotos[0].created_at), "MMM dd")}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                    {format(new Date(selectedPhotos[1].created_at), "MMM dd")}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedPhotos.length < 2 && (
          <div className="text-center py-8 text-cyan-300/50">
            <p>Select at least 2 photos to compare</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
