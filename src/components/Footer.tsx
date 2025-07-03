
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

const Footer = () => {
  const { content, loading } = useSiteContent();

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </footer>
    );
  }

  const quickLinks = [];
  const supportLinks = [];

  for (let i = 1; i <= 5; i++) {
    const quickLinkName = content[`quick_link_${i}_name`];
    const quickLinkUrl = content[`quick_link_${i}_url`];
    if (quickLinkName && quickLinkUrl) {
      quickLinks.push({ name: quickLinkName, url: quickLinkUrl });
    }

    const supportLinkName = content[`support_link_${i}_name`];
    const supportLinkUrl = content[`support_link_${i}_url`];
    if (supportLinkName && supportLinkUrl) {
      supportLinks.push({ name: supportLinkName, url: supportLinkUrl });
    }
  }

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          {/* Brand with Contact, Support, and Quick Links */}
          <div>
            <h3 className="text-2xl font-light mb-4">Blue Dream Budder</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              Premium CBD-infused tattoo aftercare balm crafted with all-natural ingredients 
              for optimal healing and skin restoration.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span className="text-gray-300">hello@bluedreambudder.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span className="text-gray-300">1-800-BUDDER-1</span>
              </div>
            </div>
            
            {/* Support and Quick Links side by side */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-4">{content.support_title || 'Support'}</h4>
                <ul className="space-y-2 text-gray-300">
                  {supportLinks.map((link, index) => (
                    <li key={index}>
                      <Link to={link.url} className="hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">{content.quick_links_title || 'Quick Links'}</h4>
                <ul className="space-y-2 text-gray-300">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <Link to={link.url} className="hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2024 Blue Dream Budder. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
