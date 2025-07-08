
import { Mail } from "lucide-react";

const EmailSignupSuccess = () => {
  return (
    <div className="text-center py-6">
      <div className="text-green-600 mb-2">
        <Mail className="w-12 h-12 mx-auto mb-3" />
      </div>
      <h3 className="text-lg font-medium text-green-800 mb-2">Welcome to the family!</h3>
      <p className="text-gray-600">Check your email for your special 10% discount code (WELCOME10)!</p>
    </div>
  );
};

export default EmailSignupSuccess;
