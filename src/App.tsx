
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
import HealingTracker from "./pages/HealingTracker";
import HealingHistory from "./pages/HealingHistory";
import Activate from "./pages/Activate";
import Dashboard from "./pages/Dashboard";
import AdminActivationCodes from "./pages/AdminActivationCodes";
import NotFound from "./pages/NotFound";
import HealAid from "./pages/HealAid";
import ProductDetail from "./pages/ProductDetail";
import ArtistOnboarding from "./pages/ArtistOnboarding";
import ArtistClientsPage from "./pages/ArtistClientsPage";
import ArtistAlertsPage from "./pages/ArtistAlertsPage";
import ArtistChatPage from "./pages/ArtistChatPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
               <Route path="/healing-tracker" element={<HealingTracker />} />
               <Route path="/healing-history" element={<HealingHistory />} />
               <Route path="/activate" element={<Activate />} />
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/admin/activation-codes" element={<AdminActivationCodes />} />
              <Route path="/heal-aid" element={<HealAid />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* Artist routes */}
              <Route path="/artist/onboarding" element={
                <ProtectedRoute requireAuth>
                  <ArtistOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/artist/dashboard" element={
                <ProtectedRoute requireArtist>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/artist/clients" element={
                <ProtectedRoute requireArtist>
                  <ArtistClientsPage />
                </ProtectedRoute>
              } />
              <Route path="/artist/clients/:clientId" element={
                <ProtectedRoute requireArtist>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/artist/alerts" element={
                <ProtectedRoute requireArtist>
                  <ArtistAlertsPage />
                </ProtectedRoute>
              } />
              <Route path="/artist/chat" element={
                <ProtectedRoute requireArtist>
                  <ArtistChatPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
);

export default App;
