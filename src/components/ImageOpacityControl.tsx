import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface ImageOpacityControlProps {
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  imageUrl?: string;
  className?: string;
}

const ImageOpacityControl = ({ 
  opacity, 
  onOpacityChange, 
  imageUrl,
  className = ""
}: ImageOpacityControlProps) => {
  const [localOpacity, setLocalOpacity] = useState(opacity);

  const handleSliderChange = (value: number[]) => {
    const newOpacity = value[0];
    setLocalOpacity(newOpacity);
    onOpacityChange(newOpacity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
    setLocalOpacity(value);
    onOpacityChange(value);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium">Image Opacity</Label>
      
      {imageUrl && (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-checkered">
          <img 
            src={imageUrl} 
            alt="Opacity preview" 
            className="w-full h-full object-cover"
            style={{ opacity: localOpacity / 100 }}
          />
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Slider
            value={[localOpacity]}
            onValueChange={handleSliderChange}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            value={localOpacity}
            onChange={handleInputChange}
            min={0}
            max={100}
            className="w-16 h-8 text-xs"
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {localOpacity === 100 ? 'Fully opaque' : 
         localOpacity === 0 ? 'Fully transparent' : 
         `${localOpacity}% opacity`}
      </div>
    </div>
  );
};

export default ImageOpacityControl;