import { Home, ShoppingBag, Heart, BookOpen, Package, Star, LayoutDashboard, History, FileText, Ruler, Info, Mail, Building, Shield, FileText as Terms, KeyRound, Users, Bell, MessageSquare, Gift, LogIn, LogOut, Sparkles, Bandage } from "lucide-react";

// Upgrade plan nav item
export const upgradeNavItem = { label: 'Upgrade Plan', path: '/plans', icon: Sparkles };

export const mainNavItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Shop', path: '/shop', icon: ShoppingBag },
  { label: 'Heal-AId', path: '/heal-aid', icon: Heart },
  { label: 'Tattoo Aftercare Guide', path: '/tattoo-aftercare-guide', icon: Bandage },
  { label: 'Blog', path: '/blog', icon: BookOpen },
  { label: 'Reviews', path: '/reviews', icon: Star },
];

// Activate Code moved to account section for logged-in users
export const activateCodeNavItem = { label: 'Activate Code', path: '/activate', icon: KeyRound };

// Conditional nav item for Healing Tracker - shown only when user has active subscription
export const healingTrackerNavItem = { label: 'Healing Tracker', path: '/healing-tracker', icon: Package };

// Get free credits item for logged-in users
export const getFreeCreditsNavItem = { label: 'Get free credits', path: '/referrals', icon: Gift };

export const userNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Healing History', path: '/healing-history', icon: History },
];

// Artist nav items
export const artistNavItems = [
  { label: 'Dashboard', path: '/artist/dashboard', icon: LayoutDashboard },
  { label: 'My Clients', path: '/artist/clients', icon: Users },
  { label: 'Alerts', path: '/artist/alerts', icon: Bell },
  { label: 'Messages', path: '/artist/chat', icon: MessageSquare },
];

// Admin nav items
export const adminNavItems = [
  { label: 'Security Dashboard', path: '/admin/security', icon: Shield },
];

// Full footer nav items (for logged-in users)
export const footerNavItems = [
  { label: 'How to Use', path: '/how-to-use', icon: Info },
  { label: 'Size Guide', path: '/size-guide', icon: Ruler },
  { label: 'Tattoo Aftercare', path: '/tattoo-aftercare', icon: FileText },
  { label: 'Contact', path: '/contact', icon: Mail },
  { label: 'Wholesale', path: '/wholesale', icon: Building },
  { label: 'Terms of Service', path: '/terms', icon: Terms },
  { label: 'Privacy Policy', path: '/privacy', icon: Shield },
];

// Condensed footer nav items (for logged-out users)
export const footerNavItemsCondensed = [
  { label: 'How to Use', path: '/how-to-use', icon: Info },
  { label: 'Size Guide', path: '/size-guide', icon: Ruler },
  { label: 'Tattoo Aftercare', path: '/tattoo-aftercare', icon: FileText },
];

// Auth icons
export const signInIcon = LogIn;
export const signOutIcon = LogOut;
