
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterFormProps {
  onSubscribed: () => void;
  onDebugMessage: (message: string) => void;
  onShowDebugDialog: () => void;
}

const NewsletterForm = ({ onSubscribed, onDebugMessage, onShowDebugDialog }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onShowDebugDialog(); // Show the debug dialog immediately

    try {
      onDebugMessage('🚀 Starting newsletter signup for: ' + email);
      
      // First, save the email to the database
      onDebugMessage('💾 Attempting to save email to database...');
      const { error: dbError } = await supabase
        .from('newsletter_signups')
        .insert([{ email }]);

      if (dbError) {
        if (dbError.code === '23505') { // Unique constraint violation (email already exists)
          onDebugMessage('📧 Email already exists in database');
          toast({
            title: "Already subscribed!",
            description: "This email is already signed up for our newsletter.",
            variant: "destructive",
          });
          setEmail("");
          setIsSubmitting(false);
          return;
        } else {
          onDebugMessage('❌ Database error: ' + JSON.stringify(dbError));
          throw dbError;
        }
      }

      onDebugMessage('✅ Email saved to database successfully');
      onDebugMessage('📤 Now attempting to send welcome email...');
      onDebugMessage('🔗 Calling edge function: send-welcome-email');
      onDebugMessage('📋 Function payload: ' + JSON.stringify({ email }));

      // Add timeout and more detailed error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        onDebugMessage('⏰ Starting function call with 30s timeout...');
        
        // Send welcome email with discount code - using correct format for supabase.functions.invoke
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: { email },
          headers: {
            'Content-Type': 'application/json',
          }
        });

        clearTimeout(timeoutId);
        onDebugMessage('📬 Edge function call completed');
        onDebugMessage('📊 Function response data: ' + JSON.stringify(emailData));
        onDebugMessage('⚠️ Function response error: ' + JSON.stringify(emailError));

        if (emailError) {
          onDebugMessage('❌ Email sending error details: ' + JSON.stringify(emailError));
          
          // Check if it's a function execution error
          if (emailError.message) {
            onDebugMessage('💡 Error message: ' + emailError.message);
          }
          
          toast({
            title: "Subscribed with issue",
            description: "You've been subscribed, but there was an issue sending the welcome email. Your discount code is WELCOME10. Please contact support if needed.",
          });
        } else {
          onDebugMessage('✅ Welcome email sent successfully!');
          toast({
            title: "Welcome to the Blue Dream family!",
            description: "Check your email for your exclusive 10% discount code (WELCOME10)!",
          });
        }

      } catch (functionError) {
        clearTimeout(timeoutId);
        onDebugMessage('💥 Function call error: ' + JSON.stringify(functionError));
        onDebugMessage('💥 Function error name: ' + (functionError as Error)?.name);
        onDebugMessage('💥 Function error message: ' + (functionError as Error)?.message);
        
        toast({
          title: "Subscribed with issue",
          description: "You've been subscribed, but there was an issue sending the welcome email. Your discount code is WELCOME10. Please contact support if needed.",
        });
      }

      onSubscribed();
      setEmail("");
    } catch (error) {
      onDebugMessage('💥 Newsletter signup error: ' + JSON.stringify(error));
      onDebugMessage('💥 Error name: ' + (error as Error)?.name);
      onDebugMessage('💥 Error message: ' + (error as Error)?.message);
      toast({
        title: "Signup failed",
        description: "Please try again later or contact support. Your discount code is WELCOME10 if you need it.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};

export default NewsletterForm;
