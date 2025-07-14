
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

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

  const socialPlatforms = [
    { key: 'tiktok', icon: '🎵', name: 'TikTok' },
    { key: 'instagram', icon: Instagram, name: 'Instagram' },
    { key: 'facebook', icon: Facebook, name: 'Facebook' },
    { key: 'twitter', icon: Twitter, name: 'Twitter' },
    { key: 'youtube', icon: Youtube, name: 'YouTube' }
  ];

  const enabledSocialLinks = socialPlatforms.filter(platform => 
    content[`social_${platform.key}_enabled`] === 'true' && 
    content[`social_${platform.key}_url`]
  );

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
              Premium CBD-infused tattoo aftercare balm crafted with all-natural ingredients 
              for optimal healing and skin restoration.
            </p>
            
            {/* Support and Quick Links in 4-column grid */}
            <div className="grid md:grid-cols-4 gap-4">
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
              
              {/* Social Links */}
              {content.social_links_enabled === 'true' && enabledSocialLinks.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    {enabledSocialLinks.map((platform) => {
                      const IconComponent = platform.icon;
                      const url = content[`social_${platform.key}_url`];
                      const name = content[`social_${platform.key}_name`] || platform.name;
                      
                      return (
                        <a
                          key={platform.key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white transition-colors"
                          aria-label={name}
                        >
                          {typeof IconComponent === 'string' ? (
                            <span className="text-2xl">{IconComponent}</span>
                          ) : (
                            <IconComponent className="w-6 h-6" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Empty column for spacing */}
              <div></div>
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
