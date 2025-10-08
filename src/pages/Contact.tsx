
import ContentPage from "@/components/ContentPage";
import { Mail, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

const Contact = () => {
  return (
    <ContentPage title="Contact Us">
      <div className="space-y-8">
        <p className="text-lg text-muted-foreground">
          Get in touch with our team. We're here to help with any questions about our products or your order.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="order-2 md:order-1">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Send us a message</h2>
              <ContactForm />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 order-1 md:order-2">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-2">
                  For general inquiries, product questions, or order support:
                </p>
                <a href="mailto:bluedreambudder@gmail.com" className="text-primary hover:underline">
                  bluedreambudder@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                <p className="text-muted-foreground mb-2">
                  Speak directly with our customer service team:
                </p>
                <a href="tel:331-643-5463" className="text-primary hover:underline">
                  331-643-5463
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                <div className="text-muted-foreground space-y-1">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM PST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Response Times</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Email responses within 24 hours</li>
                <li>• Phone support during business hours</li>
                <li>• Order inquiries prioritized</li>
                <li>• Wholesale inquiries within 48 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ContentPage>
  );
};

export default Contact;
