
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

  const renderLink = (link: { name: string; url: string }) => {
    const isExternal = link.url.startsWith('http');
    
    if (isExternal) {
      return (
        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          {link.name}
        </a>
      );
    }
    
    return (
      <Link to={link.url} className="hover:text-white transition-colors">
        {link.name}
      </Link>
    );
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          {/* Brand with Support and Quick Links */}
          <div>
            <h3 className="text-3xl font-bold mb-4">Blue Dream Budder</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              Premium tattoo aftercare balm crafted with all-natural ingredients 
              for optimal healing and skin restoration.
            </p>
            
            {/* Support and Quick Links in 2-column grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-md">
              {supportLinks.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4">{content.support_title || 'Support'}</h4>
                  <ul className="space-y-2 text-gray-300">
                    {supportLinks.map((link, index) => (
                      <li key={index}>
                        {renderLink(link)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {quickLinks.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4">{content.quick_links_title || 'Quick Links'}</h4>
                  <ul className="space-y-2 text-gray-300">
                    {quickLinks.map((link, index) => (
                      <li key={index}>
                        {renderLink(link)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p className="mb-1">© 2025 Dream Tattoo Company LLC. All rights reserved.</p>
              <p className="text-xs">
                Blue Dream Budder™ and Healyn™ are trademarks of Dream Tattoo Company LLC.
              </p>
              <p className="text-xs">
                All product names, logos, and brands are property of their respective owners.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
