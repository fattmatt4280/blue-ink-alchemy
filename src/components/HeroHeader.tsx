
import { Button } from "@/components/ui/button";
import { Settings, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import CartIcon from "./CartIcon";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const HeroHeader = () => {
  const { user, isAdmin, signOut } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigationItems = [
    { id: 'hero', label: 'Home', type: 'scroll' },
    { id: 'products', label: 'Products', type: 'scroll' },
    { id: 'testimonials', label: 'Testimonials', type: 'scroll' },
    { id: 'ingredients', label: 'Ingredients', type: 'scroll' },
    { id: 'faq', label: 'FAQ', type: 'scroll' },
    { id: 'newsletter', label: 'Newsletter', type: 'scroll' },
    { id: '/blog', label: 'Blog', type: 'link' },
    { id: '/shop', label: 'Shop', type: 'link' }
  ];

  return (
    <div className="absolute top-6 right-6 z-20 flex gap-2 backdrop-blur-sm rounded-lg p-2">
      <CartIcon />
      
      {/* Navigation Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            size="sm"
            className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
            variant="outline"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-lg border-border">
          <div className="flex flex-col gap-4 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Navigation</h3>
            {navigationItems.map((item) => (
              item.type === 'link' ? (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="justify-start text-left hover:bg-accent hover:text-accent-foreground"
                  asChild
                >
                  <Link to={item.id}>{item.label}</Link>
                </Button>
              ) : (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="justify-start text-left hover:bg-accent hover:text-accent-foreground"
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </Button>
              )
            ))}
          </div>
        </SheetContent>
      </Sheet>
      
      {user ? (
        <div className="flex gap-2">
          {isAdmin && (
            <Link to="/admin">
              <Button 
                size="sm"
                className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          )}
          
          <Button 
            size="sm"
            className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
            variant="outline"
            onClick={signOut}
          >
            <User className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      ) : (
        <Link to="/auth">
          <Button 
            size="sm"
            className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
            variant="outline"
          >
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
};

export default HeroHeader;
