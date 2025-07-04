
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('🚀 Starting newsletter signup for:', email);
      
      // First, save the email to the database
      const { error: dbError } = await supabase
        .from('newsletter_signups')
        .insert([{ email }]);

      if (dbError) {
        if (dbError.code === '23505') { // Unique constraint violation (email already exists)
          console.log('📧 Email already exists in database');
          toast({
            title: "Already subscribed!",
            description: "This email is already signed up for our newsletter.",
            variant: "destructive",
          });
          setEmail("");
          setIsSubmitting(false);
          return;
        } else {
          console.error('❌ Database error:', dbError);
          throw dbError;
        }
      }

      console.log('✅ Email saved to database successfully');
      console.log('📤 Now attempting to send welcome email...');

      // Send welcome email with discount code
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-welcome-email', {
        body: { email }
      });

      console.log('📬 Email function response:', { emailData, emailError });

      if (emailError) {
        console.error('❌ Email sending error:', emailError);
        toast({
          title: "Subscribed with issue",
          description: "You've been subscribed, but there was an issue sending the welcome email. Your discount code is WELCOME10. Please contact support if needed.",
        });
      } else {
        console.log('✅ Welcome email sent successfully!');
        toast({
          title: "Welcome to the Blue Dream family!",
          description: "Check your email for your exclusive 10% discount code (WELCOME10)!",
        });
      }

      setIsSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error('💥 Newsletter signup error:', error);
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
  );
};

export default Newsletter;
