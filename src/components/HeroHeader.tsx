import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import CartIcon from "./CartIcon";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  mainNavItems, 
  userNavItems, 
  footerNavItems, 
  footerNavItemsCondensed,
  healingTrackerNavItem,
  activateCodeNavItem,
  getFreeCreditsNavItem,
  signInIcon,
  signOutIcon
} from "@/lib/navigationItems";
import { useHealAidSubscription } from "@/hooks/useHealAidSubscription";

const HeroHeader = () => {
  const { user, isAdmin, signOut } = useAuth();
  const subscription = useHealAidSubscription();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';
  };

  const SignInIcon = signInIcon;
  const SignOutIcon = signOutIcon;

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
        <div className="hidden xl:flex items-center space-x-6">
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
        <div className="xl:hidden flex items-center gap-2">
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
                  {/* ACCOUNT Section - Now First */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 px-3">ACCOUNT</h3>
                    <div className="space-y-1">
                      {user ? (
                        <>
                          {/* Welcome Card with Healing Tracker inside */}
                          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-3 py-3 mx-3 mb-2 flex flex-col gap-3">
                            <span className="text-cyan-400 font-medium">
                              Welcome back, {getUserDisplayName()}
                            </span>
                            
                            {/* Healing Tracker inside the welcome card */}
                            {subscription.isActive && subscription.daysRemaining > 0 && (
                              <Link
                                to={healingTrackerNavItem.path}
                                className="flex items-center gap-3 py-2 px-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors"
                              >
                                <healingTrackerNavItem.icon className="w-5 h-5 text-white" />
                                <span className="text-white">{healingTrackerNavItem.label}</span>
                                <Badge variant="secondary" className="ml-auto bg-cyan-500/30 text-cyan-400">
                                  {subscription.daysRemaining}d
                                </Badge>
                              </Link>
                            )}
                          </div>
                          
                          {/* Get free credits */}
                          <Link
                            to={getFreeCreditsNavItem.path}
                            className="flex items-center gap-3 px-3 py-2 text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <getFreeCreditsNavItem.icon className="w-5 h-5" />
                            <span>{getFreeCreditsNavItem.label}</span>
                          </Link>
                          
                          {/* User nav items (Dashboard, Healing History) */}
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
                          
                          {/* Activate Code (moved from Navigation) */}
                          <Link
                            to={activateCodeNavItem.path}
                            className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <activateCodeNavItem.icon className="w-5 h-5" />
                            <span>{activateCodeNavItem.label}</span>
                          </Link>
                          
                          {/* Sign Out */}
                          <button
                            onClick={signOut}
                            className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors w-full text-left"
                          >
                            <SignOutIcon className="w-5 h-5" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/auth"
                          className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <SignInIcon className="w-5 h-5" />
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
                          <LayoutDashboard className="w-5 h-5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION Section */}
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
                      
                      {/* Activate Code only shows in Navigation for logged-out users */}
                      {!user && (
                        <Link
                          to={activateCodeNavItem.path}
                          className="flex items-center gap-3 px-3 py-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <activateCodeNavItem.icon className="w-5 h-5" />
                          <span>{activateCodeNavItem.label}</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* INFORMATION Section */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 px-3">INFORMATION</h3>
                    <div className="space-y-1">
                      {(user ? footerNavItems : footerNavItemsCondensed).map((item) => (
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
