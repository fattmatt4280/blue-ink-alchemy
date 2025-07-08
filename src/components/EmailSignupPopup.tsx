import { useState } from "react";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmailSignupForm from "./EmailSignupForm";
import EmailSignupSuccess from "./EmailSignupSuccess";
import EmailSignupDebugDialog from "./EmailSignupDebugDialog";

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
      
      // Prepare the request data
      const requestData = { email };
      addDebugMessage('📋 Function payload: ' + JSON.stringify(requestData));

      try {
        addDebugMessage('⏰ Starting function call...');
        
        // Send welcome email with discount code
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: requestData
        });

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
            <EmailSignupForm
              email={email}
              setEmail={setEmail}
              onSubmit={handleSubmit}
              onClose={onClose}
              isSubmitting={isSubmitting}
            />
          ) : (
            <EmailSignupSuccess />
          )}
        </DialogContent>
      </Dialog>

      <EmailSignupDebugDialog 
        isOpen={showDebugDialog}
        onClose={() => setShowDebugDialog(false)}
        debugMessages={debugMessages}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default EmailSignupPopup;
