import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import AppHeader from "@/components/AppHeader";
import { 
  Camera, 
  Brain, 
  CheckCircle, 
  Shield, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  MessageSquare,
  Award,
  Zap
} from "lucide-react";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import heroImage from "@/assets/healaid-ai-doctor.jpeg";
import problemImage from "@/assets/healaid-medical-interface.jpeg";
import howItWorksImage from "@/assets/healaid-examining-tattoo.jpeg";
import techImage from "@/assets/healaid-doctor-tablet.jpeg";
import featuresImage from "@/assets/healaid-tech-interface.webp";
import ctaImage from "@/assets/healaid-medical-hand.jpeg";
import shieldLogo from "@/assets/healaid-shield-logo.jpeg";

const HealAid = () => {
  const navigate = useNavigate();
  const { elementRef: heroRef, isIntersecting: heroVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { elementRef: problemRef, isIntersecting: problemVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { elementRef: howItWorksRef, isIntersecting: howItWorksVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { elementRef: featuresRef, isIntersecting: featuresVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { elementRef: pricingRef, isIntersecting: pricingVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { elementRef: useCasesRef, isIntersecting: useCasesVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { elementRef: techRef, isIntersecting: techVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { elementRef: finalCtaRef, isIntersecting: finalCtaVisible } = useIntersectionObserver({ threshold: 0.1 });

  const handleShopClick = () => {
    navigate("/shop");
    setTimeout(() => {
      const freeTrialElement = document.getElementById("free-trial-product");
      if (freeTrialElement) {
        freeTrialElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleTryNowClick = () => {
    navigate("/healing-tracker");
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Heal-AId™ - AI Tattoo Healing Tracker | Expert Analysis in Seconds</title>
        <meta name="description" content="Get instant AI-powered tattoo healing analysis. Upload a photo, get expert recommendations. Free 3-day trial included with every purchase." />
        <meta name="keywords" content="tattoo healing, AI tattoo analysis, tattoo aftercare tracker, healing progress" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AppHeader transparent />
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60"></div>
          
          <div className={`relative z-10 container mx-auto px-4 py-20 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto text-center text-white">
              <Badge className="mb-6 bg-primary/20 text-primary-foreground border-primary/50 backdrop-blur-sm text-lg py-2 px-6">
                Powered by Advanced AI
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                <span className="font-rajdhani">Heal-AId™</span>
              </h1>
              
              <p className="text-2xl md:text-3xl font-semibold mb-4">
                Your AI Tattoo Healing Doctor
              </p>
              
              <p className="text-lg md:text-xl mb-8 text-gray-300">
                24/7 AI-Powered Analysis | Personalized Healing Guidance | Track Your Journey
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 hover:scale-105 transition-transform"
                  onClick={handleShopClick}
                >
                  Start Free 3-Day Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={scrollToHowItWorks}
                >
                  See How It Works
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Instant Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Expert-Trained AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>HIPAA-Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section 
          ref={problemRef}
          className="relative py-20 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${problemImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95"></div>
          
          <div className={`relative z-10 container mx-auto px-4 transition-all duration-1000 ${problemVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
              Worried About Your Tattoo Healing?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <h3 className="text-xl font-semibold mb-2">Is this normal or infected?</h3>
                  <p className="text-muted-foreground">Get instant answers to your healing concerns</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Am I using the right products?</h3>
                  <p className="text-muted-foreground">Personalized product recommendations for your tattoo</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">Should I see a doctor?</h3>
                  <p className="text-muted-foreground">Early warnings for potential complications</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl md:text-2xl font-semibold text-foreground">
                <span className="font-rajdhani">Heal-AId</span> uses advanced AI trained on thousands of tattoo healing cases to give you instant, expert-level guidance
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          ref={howItWorksRef}
          className="relative py-20 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${howItWorksImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90"></div>
          
          <div className={`relative z-10 container mx-auto px-4 transition-all duration-1000 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
              Get Expert Analysis in 3 Simple Steps
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
              <div className="text-center text-white">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">1. Upload</h3>
                <p className="text-gray-300">Take a photo of your tattoo</p>
              </div>
              
              <div className="text-center text-white">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">2. Analyze</h3>
                <p className="text-gray-300">AI examines healing progress</p>
              </div>
              
              <div className="text-center text-white">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">3. Heal</h3>
                <p className="text-gray-300">Get personalized recommendations</p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 hover:scale-105 transition-transform"
                onClick={handleShopClick}
              >
                Try It Now - Free for 3 Days
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section 
          ref={featuresRef}
          className="relative py-20 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${featuresImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95"></div>
          
          <div className={`relative z-10 container mx-auto px-4 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
              Powerful AI Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <Zap className="w-10 h-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Real-Time Analysis</h3>
                  <p className="text-muted-foreground">Instant feedback on healing progress in under 30 seconds</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <TrendingUp className="w-10 h-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Healing Stage Detection</h3>
                  <p className="text-muted-foreground">Know exactly where you are: Fresh, Peeling, Settling, or Healed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <AlertCircle className="w-10 h-10 mb-4 text-destructive" />
                  <h3 className="text-xl font-bold mb-2">Risk Assessment</h3>
                  <p className="text-muted-foreground">Early warning for potential infections or complications</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <Award className="w-10 h-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Product Recommendations</h3>
                  <p className="text-muted-foreground">Personalized aftercare product suggestions</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <Clock className="w-10 h-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                  <p className="text-muted-foreground">Photo timeline to visualize your healing journey</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/80 backdrop-blur-sm hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <MessageSquare className="w-10 h-10 mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">Ask Questions</h3>
                  <p className="text-muted-foreground">Interactive Q&A about your specific tattoo</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Tiers Section */}
        <section ref={pricingRef} className="py-20 bg-muted/30">
          <div className={`container mx-auto px-4 transition-all duration-1000 ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Choose Your Healing Journey
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-12">
              💡 All budder purchases include a FREE 3-day trial!
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Trial */}
              <Card className="relative border-primary border-2 shadow-lg hover:scale-105 transition-transform">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">FREE TRIAL</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$0.00</span>
                    <span className="text-muted-foreground"> / 3 Days</span>
                  </div>
                  <Badge className="mb-6 bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50">
                    FREE with every budder purchase!
                  </Badge>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Upload up to 10 photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Full AI analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Healing stage detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Personalized recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Interactive Q&A</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    size="lg"
                    onClick={handleShopClick}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>

              {/* 7-Day Access */}
              <Card className="hover:scale-105 transition-transform">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">7-DAY ACCESS</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$0.99</span>
                    <span className="text-muted-foreground"> / 7 Days</span>
                  </div>
                  <div className="h-8 mb-6"></div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Everything in Free Trial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Extended tracking period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Healing progress history</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    size="lg"
                    onClick={handleShopClick}
                  >
                    Upgrade to 7 Days
                  </Button>
                </CardContent>
              </Card>

              {/* 30-Day Access */}
              <Card className="relative hover:scale-105 transition-transform">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white">
                  Best Value
                </Badge>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">30-DAY ACCESS</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$3.99</span>
                    <span className="text-muted-foreground"> / 30 Days</span>
                  </div>
                  <div className="h-8 mb-6"></div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Everything in 7-Day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Complete healing journey</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Full photo timeline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Expert trend analysis</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                    size="lg"
                    onClick={handleShopClick}
                  >
                    Get 30 Days
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section ref={useCasesRef} className="py-20 bg-background">
          <div className={`container mx-auto px-4 transition-all duration-1000 ${useCasesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-12">
              <img src={shieldLogo} alt="Heal-AId Shield" className="w-20 h-20 mx-auto mb-6 rounded-full" />
              <h2 className="text-4xl md:text-5xl font-bold">
                Perfect For Every Tattoo Owner
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-card hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">First-Timers</h3>
                  <p className="text-muted-foreground">
                    Never had a tattoo? Get expert guidance from day one. Learn what's normal, what's not, and how to care for your new ink.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Experienced Collectors</h3>
                  <p className="text-muted-foreground">
                    Track multiple tattoos and compare healing patterns. Get insights into what works best for your skin type.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Concerned Owners</h3>
                  <p className="text-muted-foreground">
                    Get peace of mind with instant AI assessment. Know when to relax and when to seek professional medical help.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technology Showcase */}
        <section 
          ref={techRef}
          className="relative py-20 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${techImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/85 to-black/90"></div>
          
          <div className={`relative z-10 container mx-auto px-4 transition-all duration-1000 ${techVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                AI-Powered Precision
              </h2>
              <p className="text-xl mb-12 text-gray-300">
                <span className="font-rajdhani">Heal-AId</span> uses advanced computer vision and machine learning trained on thousands of tattoo healing progressions. Our AI analyzes color, texture, inflammation, and healing patterns to provide expert-level assessments in seconds.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 text-primary">10,000+</div>
                  <div className="text-gray-300">Analyses Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 text-primary">98%</div>
                  <div className="text-gray-300">User Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 text-primary">&lt; 30s</div>
                  <div className="text-gray-300">Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">Is <span className="font-rajdhani">Heal-AId</span> a medical device?</AccordionTrigger>
                  <AccordionContent>
                    No, <span className="font-rajdhani">Heal-AId</span> is an informational tool designed to help you track and understand your tattoo healing process. It is not a medical device and should not replace professional medical advice. If you have concerns about your tattoo, always consult with a healthcare provider.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">How accurate is the AI?</AccordionTrigger>
                  <AccordionContent>
                    Our AI has been trained on thousands of tattoo healing cases reviewed by experts. While it provides highly accurate assessments, it's designed to supplement—not replace—professional medical judgment. We continuously improve our models based on user feedback and expert validation.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">What if I need a doctor?</AccordionTrigger>
                  <AccordionContent>
                    <span className="font-rajdhani">Heal-AId</span> will alert you if it detects signs that warrant professional medical attention. We err on the side of caution and will always recommend seeking medical care if there are any concerning indicators of infection or complications.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">Can I track multiple tattoos?</AccordionTrigger>
                  <AccordionContent>
                    Yes! You can upload and track as many tattoos as you'd like during your subscription period. The AI treats each tattoo individually and provides personalized recommendations for each one.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">Is my data private?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. We take your privacy seriously. All data is encrypted in transit and at rest, stored securely, and handled in compliance with HIPAA standards. Your photos and personal information are never shared with third parties without your explicit consent.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">What's included in the free trial?</AccordionTrigger>
                  <AccordionContent>
                    The free 3-day trial includes full feature access: unlimited photo uploads, AI analysis, healing stage detection, personalized recommendations, and interactive Q&A. It's the same experience as our paid tiers, just for 3 days. Plus, every budder purchase includes a free trial!
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section 
          ref={finalCtaRef}
          className="relative py-20 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${ctaImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/90"></div>
          
          <div className={`relative z-10 container mx-auto px-4 transition-all duration-1000 ${finalCtaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Start Your Healing Journey Today
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of tattoo owners who trust <span className="font-rajdhani">Heal-AId</span> for expert healing guidance
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 hover:scale-105 transition-transform"
                  onClick={handleShopClick}
                >
                  Get Free 3-Day Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 bg-white/10 border-white text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={handleTryNowClick}
                >
                  Try <span className="font-rajdhani">Heal-AId</span> Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HealAid;
