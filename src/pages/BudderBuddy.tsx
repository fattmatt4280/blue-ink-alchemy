import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const BudderBuddy = () => {
  const [isLoading, setIsLoading] = useState(true);

  const appUrl = "https://budderbuddy.lovable.app";

  return (
    <>
      <Helmet>
        <title>Budder Buddy | Blue Dream Budder</title>
        <meta
          name="description"
          content="Budder Buddy - Your companion app for tattoo aftercare and healing tracking."
        />
        <link rel="canonical" href="https://bluedreambudder.com/budder-buddy" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader showCart={false} />

        <main className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading Budder Buddy...</p>
              </div>
            </div>
          )}

          <iframe
            src={appUrl}
            title="Budder Buddy App"
            className="w-full h-screen border-0 rounded-xl"
            onLoad={() => setIsLoading(false)}
            allow="camera; geolocation; notifications"
          />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BudderBuddy;
