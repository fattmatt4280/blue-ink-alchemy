import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { useHealingHistory, HealingHistoryEntry } from "@/hooks/useHealingHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateCompleteReport, downloadHtmlReport } from "@/utils/healingReportExport";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface DownloadSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DownloadSelectionDialog = ({
  open,
  onOpenChange,
}: DownloadSelectionDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: entries, isLoading } = useHealingHistory(user?.id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (entries) {
      setSelectedIds(entries.map((e) => e.id));
    }
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const downloadSelected = () => {
    if (!entries || selectedIds.length === 0) {
      toast({
        title: "No entries selected",
        description: "Please select at least one entry to download",
        variant: "destructive",
      });
      return;
    }

    const selectedEntries = entries.filter((e) => selectedIds.includes(e.id));
    
    // Create filename based on count
    let filename: string;
    if (selectedEntries.length === 1) {
      const entry = selectedEntries[0];
      const dateStr = format(new Date(entry.created_at), 'MM-dd-yyyy');
      const title = entry.tattoo_title || 'Tattoo';
      filename = `${title.replace(/\s+/g, '-')}-${dateStr}.html`;
    } else {
      // Multiple entries: use first title or "Complete"
      const firstTitle = selectedEntries[0]?.tattoo_title || 'Healing';
      filename = `${firstTitle.replace(/\s+/g, '-')}-Complete-Report.html`;
    }
    
    const html = generateCompleteReport(selectedEntries);
    downloadHtmlReport(html, filename);

    toast({
      title: "Report Downloaded",
      description: `Downloaded ${selectedIds.length} ${
        selectedIds.length === 1 ? "entry" : "entries"
      }`,
    });

    onOpenChange(false);
    setSelectedIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Entries to Download</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No healing entries found</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-2 border-b">
              <p className="text-sm text-muted-foreground">
                {selectedIds.length} of {entries.length} selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  disabled={selectedIds.length === entries.length}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                  disabled={selectedIds.length === 0}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {entries.map((entry) => {
                  const dateStr = format(new Date(entry.created_at), 'MM-dd-yyyy');
                  const title = entry.tattoo_title || 'Tattoo';
                  
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50 ${
                        selectedIds.includes(entry.id)
                          ? "bg-accent border-primary"
                          : "border-border"
                      }`}
                      onClick={() => toggleSelection(entry.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(entry.id)}
                        onCheckedChange={() => toggleSelection(entry.id)}
                        className="mt-1"
                      />
                      <img
                        src={entry.photo_url}
                        alt={title}
                        className="w-20 h-20 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-muted-foreground">{dateStr}</p>
                        <p className="text-xs text-muted-foreground mt-1">{entry.healing_stage}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Score: {entry.progress_score}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={downloadSelected}
                disabled={selectedIds.length === 0}
                className="flex-1"
              >
                Download {selectedIds.length > 0 && `(${selectedIds.length})`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
