
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
    { id: '/shop', label: 'Shop', type: 'link' },
    { id: '/healing-tracker', label: 'Heal-AId', type: 'link' }
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center">
            <span className="text-cyan-400 font-bold text-lg">BD</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection('products')}
            className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium"
          >
            Shop Now
          </button>
          <button 
            onClick={() => scrollToSection('ingredients')}
            className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium"
          >
            View Benefits
          </button>
          <Link to="/healing-tracker" className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium">
            Heal-AId
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium">
              Admin
            </Link>
          )}
          {user ? (
            <button 
              onClick={signOut}
              className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/auth" className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-slate-900 border-slate-800">
              <nav className="flex flex-col space-y-6 mt-8">
                {navigationItems.map((item) => (
                  <div key={item.label}>
                    {item.type === 'scroll' ? (
                      <button
                        onClick={() => {
                          scrollToSection(item.id);
                        }}
                        className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium block w-full text-left"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        to={item.id}
                        className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium block"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <Link to="/admin" className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium">
                    Admin
                  </Link>
                )}
                {user ? (
                  <button 
                    onClick={signOut}
                    className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium text-left"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link to="/auth" className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium">
                    Sign In
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default HeroHeader;
