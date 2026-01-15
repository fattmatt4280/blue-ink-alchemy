import { Home, ShoppingBag, BookOpen, Star, FileText, Ruler, Info, Mail, Building, Shield, FileText as Terms, Gift, LogIn, LogOut, Bandage } from "lucide-react";

export const mainNavItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Shop', path: '/shop', icon: ShoppingBag },
  { label: 'Tattoo Aftercare Guide', path: '/tattoo-aftercare-guide', icon: Bandage },
  { label: 'Blog', path: '/blog', icon: BookOpen },
  { label: 'Reviews', path: '/reviews', icon: Star },
];

// Get free credits item for logged-in users
export const getFreeCreditsNavItem = { label: 'Get free credits', path: '/referrals', icon: Gift };

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
