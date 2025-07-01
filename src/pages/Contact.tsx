
import ContentPage from "@/components/ContentPage";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <ContentPage title="Contact Us">
      <div className="space-y-8">
        <p className="text-lg text-gray-600">
          Get in touch with our team. We're here to help with any questions about our products or your order.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                <p className="text-gray-600 mb-2">
                  For general inquiries, product questions, or order support:
                </p>
                <a href="mailto:hello@bluedreambudder.com" className="text-blue-600 hover:underline">
                  hello@bluedreambudder.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-2">
                  Speak directly with our customer service team:
                </p>
                <a href="tel:1-800-BUDDER-1" className="text-blue-600 hover:underline">
                  1-800-BUDDER-1
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                <div className="text-gray-600 space-y-1">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM PST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Response Times</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Email responses within 24 hours</li>
                <li>• Phone support during business hours</li>
                <li>• Order inquiries prioritized</li>
                <li>• Wholesale inquiries within 48 hours</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Before You Contact Us</h3>
              <p className="text-gray-600 mb-3">
                For faster service, please have the following information ready:
              </p>
              <ul className="space-y-1 text-gray-600">
                <li>• Order number (if applicable)</li>
                <li>• Product name and size</li>
                <li>• Description of your question or issue</li>
                <li>• Your contact information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ContentPage>
  );
};

export default Contact;
