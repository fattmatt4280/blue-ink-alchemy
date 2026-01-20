import { Helmet } from "react-helmet-async";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Camera, Bell, Clock, Sparkles } from "lucide-react";

const BudderBuddy = () => {
  const features = [
    {
      icon: Camera,
      title: "Track Your Healing",
      description: "Capture daily progress photos and watch your tattoo heal beautifully"
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss an aftercare step with personalized notifications"
    },
    {
      icon: Clock,
      title: "Photo Timeline",
      description: "See your complete healing journey from day one to fully healed"
    },
    {
      icon: Sparkles,
      title: "Smart Insights",
      description: "Get intelligent healing assessments to track your progress"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Budder Buddy | Blue Dream Budder</title>
        <meta
          name="description"
          content="Budder Buddy - Your companion iOS app for tattoo aftercare and healing tracking. Download on the App Store."
        />
        <link rel="canonical" href="https://bluedreambudder.com/budder-buddy" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader showCart={false} />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
            
            <div className="container relative z-10 mx-auto px-4">
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                {/* App Icon */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
                  <img
                    src="/images/budder-buddy-icon.jpeg"
                    alt="Budder Buddy App Icon"
                    className="relative w-40 h-40 md:w-56 md:h-56 rounded-[2rem] shadow-2xl border-4 border-background"
                  />
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Budder Buddy
                </h1>
                
                {/* Tagline */}
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                  Your tattoo aftercare companion
                </p>

                {/* App Store Button */}
                <Button
                  size="lg"
                  disabled
                  className="bg-foreground text-background hover:bg-foreground/90 h-14 px-8 text-lg rounded-xl opacity-90 cursor-not-allowed"
                >
                  <Apple className="w-6 h-6 mr-2" />
                  Download on the App Store
                  <Badge variant="secondary" className="ml-3 bg-primary/20 text-primary">
                    Coming Soon
                  </Badge>
                </Button>

                <p className="text-sm text-muted-foreground mt-4">
                  Available for iPhone and iPad
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
                Everything you need for perfect healing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-background rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <p className="text-lg text-muted-foreground mb-6">
                In the meantime, explore our premium tattoo aftercare products
              </p>
              <Button asChild size="lg" className="rounded-xl">
                <a href="/shop">Shop Blue Dream Budder</a>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BudderBuddy;
