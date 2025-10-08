import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import CartIcon from "./CartIcon";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mainNavItems, userNavItems, footerNavItems } from "@/lib/navigationItems";

const HeroHeader = () => {
  const { user, isAdmin, signOut } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-4 px-6 bg-black/90 backdrop-blur-sm">
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
          <Link to="/heal-aid" className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium">
            Heal-AId
          </Link>
          {isAdmin && (
            <Link to="/admin" className="text-white hover:text-cyan-400 transition-colors duration-200 text-lg font-medium">
              Admin
            </Link>
          )}
          <CartIcon />
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
        <div className="lg:hidden flex items-center gap-2">
          <CartIcon />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-slate-900 border-slate-800">
              <ScrollArea className="h-[calc(100vh-4rem)] pr-4">
                <nav className="flex flex-col space-y-6 mt-8">
                  {/* Navigation Section */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 px-3">NAVIGATION</h3>
                    <div className="space-y-1">
                      {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Account Section */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 px-3">ACCOUNT</h3>
                    <div className="space-y-1">
                      {user ? (
                        <>
                          {userNavItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                          <button
                            onClick={signOut}
                            className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors w-full text-left"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/auth"
                          className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign In</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Admin Section */}
                  {isAdmin && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 mb-3 px-3">ADMIN</h3>
                      <div className="space-y-1">
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Admin Dashboard</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Information Section */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 px-3">INFORMATION</h3>
                    <div className="space-y-1">
                      {footerNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default HeroHeader;
