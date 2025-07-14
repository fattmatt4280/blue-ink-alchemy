
import { useState } from "react";
import { Mail, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import NewsletterForm from "./NewsletterForm";
import NewsletterSuccessMessage from "./NewsletterSuccessMessage";
import NewsletterDebugDialog from "./NewsletterDebugDialog";
import { useSiteContent } from "@/hooks/useSiteContent";

const Newsletter = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const { content, loading } = useSiteContent();

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

  const socialPlatforms = [
    { key: 'tiktok', icon: '🎵', name: 'TikTok' },
    { key: 'instagram', icon: Instagram, name: 'Instagram' },
    { key: 'facebook', icon: Facebook, name: 'Facebook' },
    { key: 'twitter', icon: Twitter, name: 'Twitter' },
    { key: 'youtube', icon: Youtube, name: 'YouTube' }
  ];

  const enabledSocialLinks = socialPlatforms.filter(platform => 
    content[`social_${platform.key}_enabled`] === 'true' && 
    content[`social_${platform.key}_url`]
  );

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
              <div className="space-y-6">
                <NewsletterForm 
                  onSubscribed={handleSubscribed}
                  onDebugMessage={addDebugMessage}
                  onShowDebugDialog={handleShowDebugDialog}
                />
                
                {/* Social Links */}
                {!loading && content.social_links_enabled === 'true' && enabledSocialLinks.length > 0 && (
                  <div className="pt-6 border-t border-white/20">
                    <p className="text-lg mb-4 opacity-90">Follow us for tips and updates</p>
                    <div className="flex justify-center space-x-6">
                      {enabledSocialLinks.map((platform) => {
                        const IconComponent = platform.icon;
                        const url = content[`social_${platform.key}_url`];
                        const name = content[`social_${platform.key}_name`] || platform.name;
                        
                        return (
                          <a
                            key={platform.key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors transform hover:scale-110"
                            aria-label={name}
                          >
                            {typeof IconComponent === 'string' ? (
                              <span className="text-3xl">{IconComponent}</span>
                            ) : (
                              <IconComponent className="w-8 h-8" />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
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
