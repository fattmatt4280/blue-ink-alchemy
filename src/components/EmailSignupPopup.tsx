import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailSignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailSignupPopup = ({ isOpen, onClose }: EmailSignupPopupProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
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
        
        // Send welcome email with discount code
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
      
      // Close the popup after successful signup
      setTimeout(() => {
        onClose();
        setIsSubscribed(false); // Reset for next time
      }, 3000);

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
      // Keep debug dialog open for 10 seconds after completion so user can see final status
      setTimeout(() => {
        setShowDebugDialog(false);
      }, 10000);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Get Your 10% Discount
            </DialogTitle>
          </DialogHeader>
          
          {!isSubscribed ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Join our newsletter and get an exclusive 10% discount code sent to your email!
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
                
                <div className="flex gap-2">
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "Subscribing..." : "Get My 10% Off"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              
              <p className="text-xs text-gray-500 text-center">
                No spam, ever. Unsubscribe at any time.
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-green-600 mb-2">
                <Mail className="w-12 h-12 mx-auto mb-3" />
              </div>
              <h3 className="text-lg font-medium text-green-800 mb-2">Welcome to the family!</h3>
              <p className="text-gray-600">Check your email for your special 10% discount code (WELCOME10)!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Debug Dialog */}
      <Dialog open={showDebugDialog} onOpenChange={setShowDebugDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto z-[9999]">
          <DialogHeader>
            <DialogTitle>Email Signup Popup Debug Log</DialogTitle>
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

export default EmailSignupPopup;
