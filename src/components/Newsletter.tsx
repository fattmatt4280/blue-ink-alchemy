import { useState } from "react";
import { Mail } from "lucide-react";
import NewsletterForm from "./NewsletterForm";
import NewsletterSuccessMessage from "./NewsletterSuccessMessage";
import NewsletterDebugDialog from "./NewsletterDebugDialog";

const Newsletter = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [showDebugDialog, setShowDebugDialog] = useState(false);

  const addDebugMessage = (message: string) => {
    const timestampedMessage = `${new Date().toLocaleTimeString()}: ${message}`;
    setDebugMessages(prev => [...prev, timestampedMessage]);
    console.log(timestampedMessage);
  };

  const handleSubscribed = () => {
    setIsSubscribed(true);
    // Keep dialog open for 10 seconds after completion so user can see final status
    setTimeout(() => {
      setShowDebugDialog(false);
    }, 10000);
  };

  const handleShowDebugDialog = () => {
    setDebugMessages([]); // Clear previous messages
    setShowDebugDialog(true); // Show the debug dialog immediately
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl lg:text-5xl font-light mb-4">
                Stay in the Loop
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                Get exclusive discounts, tattoo aftercare tips, and be the first to know 
                about new products and limited releases.
              </p>
            </div>
            
            {!isSubscribed ? (
              <div className="space-y-4">
                <NewsletterForm 
                  onSubscribed={handleSubscribed}
                  onDebugMessage={addDebugMessage}
                  onShowDebugDialog={handleShowDebugDialog}
                />
              </div>
            ) : (
              <NewsletterSuccessMessage />
            )}
            
            <p className="text-sm opacity-70 mt-6">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <NewsletterDebugDialog 
        isOpen={showDebugDialog}
        onClose={() => setShowDebugDialog(false)}
        debugMessages={debugMessages}
        isSubmitting={false}
      />
    </>
  );
};

export default Newsletter;
