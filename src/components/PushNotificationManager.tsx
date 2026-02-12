import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushNotificationManager = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get VAPID public key from Supabase secrets
  const [vapidPublicKey, setVapidPublicKey] = useState<string>('');

  useEffect(() => {
    // Fetch VAPID public key from edge function or use a known key
    // For now, we'll use a placeholder - in production, this should come from your backend
    const fetchVapidKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-vapid-key');
        if (data?.publicKey) {
          setVapidPublicKey(data.publicKey);
        } else {
          // Fallback VAPID key - replace with your actual key
          setVapidPublicKey('BNxR5GYHD4-JSzZX0X0S9G5K7H7F9K1Y2D6L9W9R8P5M3Q0N7V4B2C6E8F1G3H9J2K5L8M1N4O7P0Q3R6S9T2V5W8');
        }
      } catch (error) {
        console.error('Error fetching VAPID key:', error);
        // Fallback VAPID key - replace with your actual key
        setVapidPublicKey('BNxR5GYHD4-JSzZX0X0S9G5K7H7F9K1Y2D6L9W9R8P5M3Q0N7V4B2C6E8F1G3H9J2K5L8M1N4O7P0Q3R6S9T2V5W8');
      }
    };
    
    fetchVapidKey();
  }, []);

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      
      if (subscription && user) {
        // Check if this subscription exists in our database
        const { data } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', user.id)
          .eq('active', true)
          .single();
        
        setIsSubscribed(!!data);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  };

  const subscribeToPush = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enable push notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Register service worker
      const registration = await registerServiceWorker();
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push manager
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not available');
      }
      
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.getKey('p256dh') ? 
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
          auth_key: subscription.getKey('auth') ? 
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : '',
          user_agent: navigator.userAgent,
          active: true,
        }, {
          onConflict: 'endpoint',
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for new orders.",
      });

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: "Failed to enable push notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase
          .from('push_subscriptions')
          .update({ active: false })
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', user?.id);
      }

      setIsSubscribed(false);
      toast({
        title: "Notifications Disabled",
        description: "Push notifications have been disabled.",
      });

    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to disable push notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'Test Notification',
          body: 'This is a test push notification!',
          data: { type: 'test' },
          userId: user?.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Test Sent",
        description: "Test notification has been sent.",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified instantly when new orders are placed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {isSubscribed ? (
            <>
              <Button 
                onClick={unsubscribeFromPush} 
                variant="outline"
                disabled={isLoading}
              >
                Disable Notifications
              </Button>
              <Button 
                onClick={testNotification} 
                variant="secondary"
                disabled={isLoading}
              >
                Test Notification
              </Button>
            </>
          ) : (
            <Button 
              onClick={subscribeToPush} 
              disabled={isLoading}
            >
              Enable Push Notifications
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isSubscribed 
            ? "✓ You're subscribed to push notifications" 
            : "Enable notifications to get alerted about new orders"
          }
        </p>
      </CardContent>
    </Card>
  );
};