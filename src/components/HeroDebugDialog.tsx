
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HeroDebugDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debugMessages: string[];
}

const HeroDebugDialog = ({ isOpen, onClose, debugMessages }: HeroDebugDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>Get 10% Off Button Debug Log</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {debugMessages.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              Initializing debug session...
            </div>
          ) : (
            debugMessages.map((message, index) => (
              <div
                key={index}
                className="text-sm font-mono p-2 bg-gray-50 rounded border-l-4 border-red-500"
              >
                {message}
              </div>
            ))
          )}
        </div>
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Close Debug
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HeroDebugDialog;
