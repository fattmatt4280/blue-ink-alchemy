
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setIsSubscribed(true);
    setEmail("");
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
                className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:bg-white/20"
              />
              <Button 
                type="submit"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 transition-colors px-8"
              >
                Subscribe
              </Button>
            </form>
          ) : (
            <div className="bg-white/10 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-xl font-medium mb-2">Welcome to the family!</h3>
              <p className="opacity-90">Check your email for a special welcome discount.</p>
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
