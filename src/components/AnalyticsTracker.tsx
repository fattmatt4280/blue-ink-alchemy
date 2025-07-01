
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// TikTok Pixel integration
declare global {
  interface Window {
    ttq: any;
  }
}

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize TikTok Pixel
    if (typeof window !== 'undefined' && !window.ttq) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('YOUR_TIKTOK_PIXEL_ID');
          ttq.page();
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
      
      // Track in our database
      await supabase.from('analytics_events').insert({
        event_type: 'page_view',
        event_data: {
          page: location.pathname,
          title: document.title,
          referrer: document.referrer,
        },
        session_id: sessionId,
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      });

      // Track with TikTok Pixel
      if (window.ttq) {
        window.ttq.track('ViewContent', {
          content_type: 'page',
          content_id: location.pathname,
        });
      }

      // Track with Plausible (automatically handled by their script)
      
    } catch (error) {
      console.error('Error tracking page view:', error);
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
    
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      event_data: eventData,
      session_id: sessionId,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });

    // Track with TikTok Pixel
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
