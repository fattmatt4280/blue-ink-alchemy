
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSecurity from "./pages/AdminSecurity";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Checkout from "./pages/Checkout";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Shop from "./pages/Shop";
import Shop2 from "./pages/Shop2";
import HowToUse from "./pages/HowToUse";
import Reviews from "./pages/Reviews";
import Wholesale from "./pages/Wholesale";
import Contact from "./pages/Contact";
import SizeGuide from "./pages/SizeGuide";
import Tracking from "./pages/Tracking";
import TattooAftercare from "./pages/TattooAftercare";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Referrals from "./pages/Referrals";
import Unsubscribe from "./pages/Unsubscribe";
import BudderBuddy from "./pages/BudderBuddy";
import FreeBudder from "./pages/FreeBudder";
import TikTokConnect from "./pages/TikTokConnect";
import TikTokCallback from "./pages/TikTokCallback";
import { DynamicPageHandler } from "./components/DynamicPageHandler";

const App = () => (
  <TooltipProvider>
    <AuthProvider>
      <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/security" element={<AdminSecurity />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop2" element={<Shop2 />} />
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/wholesale" element={<Wholesale />} />
               <Route path="/contact" element={<Contact />} />
               <Route path="/size-guide" element={<SizeGuide />} />
               <Route path="/tracking" element={<Tracking />} />
               <Route path="/tattoo-aftercare" element={<TattooAftercare />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/budder-buddy" element={<BudderBuddy />} />
              <Route path="/free-budder" element={<FreeBudder />} />
              <Route path="/tiktok-connect" element={<TikTokConnect />} />
              
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              
              {/* Dynamic CMS Pages - must be before catch-all */}
              <Route path="/:parentSlug" element={<DynamicPageHandler />} />
              <Route path="/:parentSlug/:childSlug" element={<DynamicPageHandler />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
);

export default App;
