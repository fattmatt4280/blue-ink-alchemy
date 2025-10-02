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

interface EmailSignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailSignupPopup = ({ isOpen, onClose }: EmailSignupPopupProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save the email to the database
      const { error: dbError } = await supabase
        .from('newsletter_signups')
        .insert([{ email }]);

      if (dbError) {
        if (dbError.code === '23505') {
          toast({
            title: "Already subscribed!",
            description: "This email is already signed up for our newsletter.",
            variant: "destructive",
          });
          setEmail("");
          setIsSubmitting(false);
          return;
        } else {
          throw dbError;
        }
      }

      // Send welcome email with discount code
      const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
        body: { email }
      });

      if (emailError) {
        toast({
          title: "Subscribed with issue",
          description: "You've been subscribed, but there was an issue sending the welcome email. Your discount code is WELCOME10.",
        });
      } else {
        toast({
          title: "Welcome to the Blue Dream family!",
          description: "Check your email for your exclusive 10% discount code (WELCOME10)!",
        });
      }

      setIsSubscribed(true);
      setEmail("");
      
      // Close the popup after successful signup
      setTimeout(() => {
        onClose();
        setIsSubscribed(false);
      }, 3000);

    } catch (error) {
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
  );
};

export default EmailSignupPopup;
