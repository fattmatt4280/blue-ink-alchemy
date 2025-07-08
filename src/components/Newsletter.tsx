import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const { toast } = useToast();

  const addDebugMessage = (message: string) => {
    const timestampedMessage = `${new Date().toLocaleTimeString()}: ${message}`;
    setDebugMessages(prev => [...prev, timestampedMessage]);
    console.log(timestampedMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDebugMessages([]); // Clear previous messages
    setShowDebugDialog(true); // Show the debug dialog immediately

    try {
      addDebugMessage('🚀 Starting newsletter signup for: ' + email);
      
      // First, save the email to the database
      addDebugMessage('💾 Attempting to save email to database...');
      const { error: dbError } = await supabase
        .from('newsletter_signups')
        .insert([{ email }]);

      if (dbError) {
        if (dbError.code === '23505') { // Unique constraint violation (email already exists)
          addDebugMessage('📧 Email already exists in database');
          toast({
            title: "Already subscribed!",
            description: "This email is already signed up for our newsletter.",
            variant: "destructive",
          });
          setEmail("");
          setIsSubmitting(false);
          return;
        } else {
          addDebugMessage('❌ Database error: ' + JSON.stringify(dbError));
          throw dbError;
        }
      }

      addDebugMessage('✅ Email saved to database successfully');
      addDebugMessage('📤 Now attempting to send welcome email...');
      addDebugMessage('🔗 Calling edge function: send-welcome-email');
      addDebugMessage('📋 Function payload: ' + JSON.stringify({ email }));

      // Add timeout and more detailed error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        addDebugMessage('⏰ Starting function call with 30s timeout...');
        
        // Send welcome email with discount code - using correct format for supabase.functions.invoke
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: { email },
          headers: {
            'Content-Type': 'application/json',
          }
        });

        clearTimeout(timeoutId);
        addDebugMessage('📬 Edge function call completed');
        addDebugMessage('📊 Function response data: ' + JSON.stringify(emailData));
        addDebugMessage('⚠️ Function response error: ' + JSON.stringify(emailError));

        if (emailError) {
          addDebugMessage('❌ Email sending error details: ' + JSON.stringify(emailError));
          
          // Check if it's a function execution error
          if (emailError.message) {
            addDebugMessage('💡 Error message: ' + emailError.message);
          }
          
          toast({
            title: "Subscribed with issue",
            description: "You've been subscribed, but there was an issue sending the welcome email. Your discount code is WELCOME10. Please contact support if needed.",
          });
        } else {
          addDebugMessage('✅ Welcome email sent successfully!');
          toast({
            title: "Welcome to the Blue Dream family!",
            description: "Check your email for your exclusive 10% discount code (WELCOME10)!",
          });
        }

      } catch (functionError) {
        clearTimeout(timeoutId);
        addDebugMessage('💥 Function call error: ' + JSON.stringify(functionError));
        addDebugMessage('💥 Function error name: ' + (functionError as Error)?.name);
        addDebugMessage('💥 Function error message: ' + (functionError as Error)?.message);
        
        toast({
          title: "Subscribed with issue",
          description: "You've been subscribed, but there was an issue sending the welcome email. Your discount code is WELCOME10. Please contact support if needed.",
        });
      }

      setIsSubscribed(true);
      setEmail("");
    } catch (error) {
      addDebugMessage('💥 Newsletter signup error: ' + JSON.stringify(error));
      addDebugMessage('💥 Error name: ' + (error as Error)?.name);
      addDebugMessage('💥 Error message: ' + (error as Error)?.message);
      toast({
        title: "Signup failed",
        description: "Please try again later or contact support. Your discount code is WELCOME10 if you need it.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      // Keep dialog open for 5 seconds after completion so user can see final status
      setTimeout(() => {
        setShowDebugDialog(false);
      }, 10000);
    }
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
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:bg-white/20"
                  />
                  <Button 
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-white text-blue-600 hover:bg-blue-50 transition-colors px-8"
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-white/10 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-xl font-medium mb-2">Welcome to the family!</h3>
                <p className="opacity-90">Check your email for your special 10% discount code (WELCOME10)!</p>
              </div>
            )}
            
            <p className="text-sm opacity-70 mt-6">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Debug Dialog - Force it to show with z-index */}
      <Dialog open={showDebugDialog} onOpenChange={setShowDebugDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto z-[9999]">
          <DialogHeader>
            <DialogTitle>Newsletter Signup Debug Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {debugMessages.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                Initializing debug session...
              </div>
            ) : (
              debugMessages.map((message, index) => (
                <div
                  key={index}
                  className="text-sm font-mono p-2 bg-gray-50 rounded border-l-4 border-blue-500"
                >
                  {message}
                </div>
              ))
            )}
            {isSubmitting && (
              <div className="text-center py-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-600">Processing...</span>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowDebugDialog(false)}
              className="px-6"
            >
              Close Debug
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Newsletter;
