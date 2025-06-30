
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Mail, Apple } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailSignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailSignupPopup = ({ isOpen, onClose }: EmailSignupPopupProps) => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual newsletter signup logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Welcome to Blue Dream Budder!",
        description: "Check your email for your 10% discount code.",
      });
      
      // Reset form and close popup
      setFormData({ email: "", firstName: "", lastName: "", phone: "" });
      onClose();
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    // Handle social login - replace with actual implementation
    toast({
      title: `${provider} signup`,
      description: "Social signup functionality will be implemented soon.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-blue-900">
            Get 10% Off Your First Order!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Sign up for exclusive discounts and tattoo aftercare tips
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Signup Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-12"
              onClick={() => handleSocialSignup("Google")}
            >
              <Mail className="w-5 h-5" />
              Continue with Google
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-12"
              onClick={() => handleSocialSignup("Apple")}
            >
              <Apple className="w-5 h-5" />
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing Up..." : "Get My 10% Discount"}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to receive marketing emails. You can unsubscribe at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSignupPopup;
