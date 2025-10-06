import { ArrowLeft, Menu, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import CartIcon from "@/components/CartIcon";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNavItems, userNavItems, footerNavItems } from "@/lib/navigationItems";
import { useState } from "react";

interface AppHeaderProps {
  showBack?: boolean;
  backUrl?: string;
  transparent?: boolean;
  className?: string;
  showCart?: boolean;
}

const AppHeader = ({ 
  showBack = true, 
  backUrl, 
  transparent = false, 
  className = "",
  showCart = true 
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const baseClasses = transparent 
    ? "bg-transparent" 
    : "bg-white/90 backdrop-blur-lg border-b border-gray-200";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${baseClasses} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back Button */}
          <div className="flex items-center gap-2">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            {/* Logo */}
            <Link to="/" className="font-bold text-lg">
              BD
            </Link>
          </div>

          {/* Right: Cart + Menu */}
          <div className="flex items-center gap-2">
            {showCart && <CartIcon />}
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-slate-900 text-white border-slate-800">
                <nav className="flex flex-col gap-6 mt-8">
                  {/* Main Navigation */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">NAVIGATION</h3>
                    <div className="flex flex-col gap-2">
                      {mainNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* User Section */}
                  {user && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-3">ACCOUNT</h3>
                      <div className="flex flex-col gap-2">
                        {userNavItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-3">ACCOUNT</h3>
                      <Link
                        to="/auth"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Sign In</span>
                      </Link>
                    </div>
                  )}

                  {/* Admin Section */}
                  {isAdmin && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-3">ADMIN</h3>
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </div>
                  )}

                  {/* Footer Links */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">INFORMATION</h3>
                    <div className="flex flex-col gap-2">
                      {footerNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
