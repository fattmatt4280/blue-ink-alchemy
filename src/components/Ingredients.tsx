
import { useSiteContent } from '@/hooks/useSiteContent';
import { 
  Pill, Leaf, Droplet, Heart, Shield, Zap, Circle, Square, Triangle, 
  Star, Hexagon, Sun, Moon, Clock, Settings, User, Mail, Phone, Home,
  ShoppingCart, Gift, Award, Check, X, Plus, Minus, ChevronRight
} from 'lucide-react';

const iconMap = {
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

const Ingredients = () => {
  const { content, loading } = useSiteContent();

  if (loading) {
    return (
      <section className="py-20 futuristic-bg">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg">Loading ingredients...</div>
        </div>
      </section>
    );
  }

  const ingredients = [];
  for (let i = 1; i <= 6; i++) {
    const name = content[`ingredient_${i}_name`];
    const benefit = content[`ingredient_${i}_benefit`];
    const description = content[`ingredient_${i}_description`];
    const iconName = content[`ingredient_${i}_icon`];
    
    if (name) {
      ingredients.push({
        name,
        benefit,
        description,
        icon: iconName
      });
    }
  }

  return (
    <section className="py-20 futuristic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-white mb-4 cyber-text">
            {content.ingredients_title || 'Pure, Natural Ingredients'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.ingredients_subtitle || 'Every jar is crafted with carefully selected, premium ingredients that work synergistically to provide superior healing and nourishment for your skin.'}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ingredients.map((ingredient, index) => {
            const IconComponent = iconMap[ingredient.icon as keyof typeof iconMap] || Circle;
            
            return (
              <div key={index} className="group">
                <div className="neon-card rounded-2xl p-8 h-full backdrop-blur-sm relative z-10 hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:from-blue-400 group-hover:to-blue-600 transition-all duration-300 neon-image">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2 cyber-text">
                    {ingredient.name}
                  </h3>
                  
                  <p className="text-blue-600 font-medium mb-3">
                    {ingredient.benefit}
                  </p>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {ingredient.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 neon-card bg-blue-50/50 text-blue-700 px-6 py-3 rounded-full backdrop-blur-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">All Natural • Plant-Based • Cruelty Free</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ingredients;
