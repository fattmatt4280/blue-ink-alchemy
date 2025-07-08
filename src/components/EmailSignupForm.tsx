
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailSignupFormProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const EmailSignupForm = ({ 
  email, 
  setEmail, 
  onSubmit, 
  onClose, 
  isSubmitting 
}: EmailSignupFormProps) => {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Join our newsletter and get an exclusive 10% discount code sent to your email!
      </p>
      
      <form onSubmit={onSubmit} className="space-y-4">
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
  );
};

export default EmailSignupForm;
