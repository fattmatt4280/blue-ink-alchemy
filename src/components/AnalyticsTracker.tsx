import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { anonymizeEventData, anonymizeUserAgent, anonymizeURL } from '@/utils/piiAnonymizer';

// TikTok Pixel integration
declare global {
  interface Window {
    ttq: any;
  }
}

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize TikTok Pixel only if we have a valid pixel ID
    if (typeof window !== 'undefined' && !window.ttq) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          // Only initialize if we have a real pixel ID (not placeholder)
          var pixelId = 'C9NJBLJC77U6A9H6KRG0'; // Replace with your actual TikTok Pixel ID
          if (pixelId && pixelId !== 'YOUR_TIKTOK_PIXEL_ID') {
            ttq.load(pixelId);
            ttq.page();
          }
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
    }

    // Initialize Plausible Analytics
    if (typeof window !== 'undefined') {
      const plausibleScript = document.createElement('script');
      plausibleScript.defer = true;
      plausibleScript.dataset.domain = 'bluedreambudder.com';
      plausibleScript.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(plausibleScript);
    }
  }, []);

  useEffect(() => {
    // Track page views
    trackPageView();
  }, [location]);

  const trackPageView = async () => {
    try {
      const sessionId = getSessionId();
      
      console.log('Tracking page view for:', location.pathname);
      
      // Anonymize event data before storing
      const eventData = {
        page: location.pathname,
        title: document.title,
        referrer: document.referrer,
      };
      const { anonymized } = anonymizeEventData(eventData);

      // Track in our database with anonymized data
      const { error } = await supabase.from('analytics_events').insert({
        event_type: 'page_view',
        event_data: anonymized,
        session_id: sessionId,
        page_url: anonymizeURL(window.location.href),
        referrer: document.referrer ? anonymizeURL(document.referrer) : null,
        user_agent: anonymizeUserAgent(navigator.userAgent),
      });

      if (error) {
        console.error('Error saving analytics event:', error);
      } else {
        console.log('Page view tracked successfully');
      }

      // Track with TikTok Pixel - use valid content type
      if (window.ttq) {
        window.ttq.track('ViewContent', {
          content_type: 'product_group', // Use valid TikTok content type
          content_name: document.title,
          content_category: 'website',
        });
      }

      // Update daily website metrics
      await updateWebsiteMetrics();
      
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  const updateWebsiteMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Use RPC function to increment page views - cast to any to bypass TypeScript
      const { error: pageViewError } = await (supabase as any)
        .rpc('increment_daily_metric', {
          metric_date: today,
          metric_name: 'page_views'
        });

      if (pageViewError) {
        console.error('Error updating page views:', pageViewError);
      }

      // Track unique visitors (simplified - in production you'd want more sophisticated tracking)
      const sessionId = getSessionId();
      const isNewSession = !sessionStorage.getItem('session_tracked');
      
      if (isNewSession) {
        sessionStorage.setItem('session_tracked', 'true');
        
        // Use RPC function to increment visits - cast to any to bypass TypeScript
        const { error: visitError } = await (supabase as any)
          .rpc('increment_daily_metric', {
            metric_date: today,
            metric_name: 'visits'
          });

        if (visitError) {
          console.error('Error updating visits:', visitError);
        }
      }
    } catch (error) {
      console.error('Error updating website metrics:', error);
    }
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  };

  return null; // This component doesn't render anything
};

// Export tracking functions for use in components
export const trackEvent = async (eventType: string, eventData: any) => {
  try {
    const sessionId = getSessionId();
    
    console.log('Tracking event:', eventType, eventData);
    
    // Anonymize event data before storing
    const { anonymized } = anonymizeEventData(eventData);
    
    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_data: anonymized,
      session_id: sessionId,
      page_url: anonymizeURL(window.location.href),
      user_agent: anonymizeUserAgent(navigator.userAgent),
    });

    if (error) {
      console.error('Error saving event:', error);
    } else {
      console.log('Event tracked successfully:', eventType);
    }

    // Track with TikTok Pixel using valid content types
    if (window.ttq) {
      switch (eventType) {
        case 'product_view':
          window.ttq.track('ViewContent', {
            content_type: 'product',
            content_id: eventData.product_id,
            value: eventData.price,
            currency: 'USD',
          });
          break;
        case 'add_to_cart':
          window.ttq.track('AddToCart', {
            content_type: 'product',
            content_id: eventData.product_id,
            value: eventData.price,
            currency: 'USD',
          });
          break;
        case 'checkout_start':
          window.ttq.track('InitiateCheckout', {
            value: eventData.total,
            currency: 'USD',
          });
          break;
        case 'purchase':
          window.ttq.track('CompletePayment', {
            value: eventData.total,
            currency: 'USD',
            content_ids: eventData.product_ids,
          });
          break;
      }
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export default AnalyticsTracker;
