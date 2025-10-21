import { CameraMode } from "@/hooks/useCamera";
import { AlertCircle, Activity, AlertTriangle } from "lucide-react";

interface CameraModeSelectorProps {
  selectedMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
}

const modes = [
  {
    id: 'progress' as CameraMode,
    label: 'Progress',
    icon: Activity,
    description: 'Routine daily tracking',
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500'
  },
  {
    id: 'concerns' as CameraMode,
    label: 'Possible Concerns',
    icon: AlertCircle,
    description: 'Have questions or concerns',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500'
  },
  {
    id: 'urgent' as CameraMode,
    label: 'Urgent',
    icon: AlertTriangle,
    description: 'Need immediate assessment',
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500'
  }
];

export const CameraModeSelector = ({ selectedMode, onModeChange }: CameraModeSelectorProps) => {
  return (
    <div className="flex items-center justify-around gap-2 px-4 py-3 bg-black/40 backdrop-blur-sm border-t border-white/10">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selectedMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200
              ${isSelected 
                ? `${mode.bgColor} border ${mode.borderColor}` 
                : 'bg-white/5 border border-transparent hover:bg-white/10'
              }
            `}
          >
            <Icon className={`h-5 w-5 ${isSelected ? mode.color : 'text-white/70'}`} />
            <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
