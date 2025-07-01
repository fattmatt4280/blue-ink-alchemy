
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Pill, Leaf, Droplet, Heart, Shield, Zap, Circle, Square, Triangle, 
  Star, Hexagon, Sun, Moon, Clock, Settings, User, Mail, Phone, Home,
  ShoppingCart, Gift, Award, Check, X, Plus, Minus, ChevronRight
} from 'lucide-react';

const availableIcons = {
  pill: Pill,
  leaf: Leaf,
  droplet: Droplet,
  heart: Heart,
  shield: Shield,
  zap: Zap,
  circle: Circle,
  square: Square,
  triangle: Triangle,
  star: Star,
  hexagon: Hexagon,
  sun: Sun,
  moon: Moon,
  clock: Clock,
  settings: Settings,
  user: User,
  mail: Mail,
  phone: Phone,
  home: Home,
  'shopping-cart': ShoppingCart,
  gift: Gift,
  award: Award,
  check: Check,
  x: X,
  plus: Plus,
  minus: Minus,
  'chevron-right': ChevronRight
};

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

const IconSelector = ({ value, onChange, label = "Icon" }: IconSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  const CurrentIcon = availableIcons[value as keyof typeof availableIcons] || Circle;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <CurrentIcon className="w-4 h-4 mr-2" />
            {value || 'Select Icon'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(availableIcons).map(([iconName, IconComponent]) => (
              <Button
                key={iconName}
                variant={value === iconName ? "default" : "ghost"}
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => {
                  onChange(iconName);
                  setOpen(false);
                }}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default IconSelector;
