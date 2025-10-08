import { Home, ShoppingBag, Heart, BookOpen, Package, Star, LayoutDashboard, History, FileText, Ruler, Info, Mail, Building, Shield, FileText as Terms, KeyRound } from "lucide-react";

export const mainNavItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Shop', path: '/shop', icon: ShoppingBag },
  { label: 'Heal-AId', path: '/heal-aid', icon: Heart },
  { label: 'Blog', path: '/blog', icon: BookOpen },
  { label: 'Activate Code', path: '/activate', icon: KeyRound },
  { label: 'Reviews', path: '/reviews', icon: Star },
];

// Conditional nav item for Healing Tracker - shown only when user has active subscription
export const healingTrackerNavItem = { label: 'Healing Tracker', path: '/healing-tracker', icon: Package };

export const userNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Healing History', path: '/healing-history', icon: History },
];

export const footerNavItems = [
  { label: 'How to Use', path: '/how-to-use', icon: Info },
  { label: 'Size Guide', path: '/size-guide', icon: Ruler },
  { label: 'Tattoo Aftercare', path: '/tattoo-aftercare', icon: FileText },
  { label: 'Contact', path: '/contact', icon: Mail },
  { label: 'Wholesale', path: '/wholesale', icon: Building },
  { label: 'Terms of Service', path: '/terms', icon: Terms },
  { label: 'Privacy Policy', path: '/privacy', icon: Shield },
];
