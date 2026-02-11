
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  promoType?: string;
}

interface CartContextType {
  items: CartItem[];
  customerEmail: string | null;
  setEmail: (email: string) => void;
  addToCart: (product: { id: string; name: string; price: number; image_url: string | null; promoType?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCustomerEmail(user.email);
        setUserId(user.id);
      }
    };
    getEmail();
  }, []);

  // Save abandoned cart to database with debounce
  const saveAbandonedCart = useCallback(async () => {
    if (items.length === 0 || !customerEmail) return;

    try {
      const cartValue = items.reduce((total, item) => total + (item.price * item.quantity), 0);

      console.log('Saving abandoned cart for:', customerEmail);

      // Check for existing recent abandoned cart
      const { data: existing } = await supabase
        .from('abandoned_carts')
        .select('id')
        .eq('email', customerEmail)
        .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .eq('converted', false)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('abandoned_carts')
          .update({
            cart_items: items as any,
            cart_value: cartValue,
            created_at: new Date().toISOString() // Reset timer
          })
          .eq('id', existing.id);
        
        console.log('Updated existing abandoned cart:', existing.id);
      } else {
        // Create new record
        const { error } = await supabase
          .from('abandoned_carts')
          .insert([{
            email: customerEmail,
            user_id: userId || undefined,
            cart_items: items as any,
            cart_value: cartValue
          }]);

        if (!error) {
          console.log('Created new abandoned cart record');
          
          // Track analytics event
          await supabase.from('analytics_events').insert({
            event_type: 'abandoned_cart_created',
            event_data: {
              email: customerEmail,
              cart_value: cartValue,
              items_count: items.length
            },
            user_id: userId
          });
        }
      }
    } catch (error) {
      console.error('Error saving abandoned cart:', error);
    }
  }, [items, customerEmail, userId]);

  // Debounced save - wait 30 seconds after last cart change
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    if (items.length > 0 && customerEmail) {
      saveTimerRef.current = setTimeout(() => {
        saveAbandonedCart();
      }, 30000); // 30 seconds
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [items, customerEmail, saveAbandonedCart]);

  const setEmail = (email: string) => {
    setCustomerEmail(email);
  };

  const addToCart = (product: { id: string; name: string; price: number; image_url: string | null; promoType?: string }) => {
    try {
      setItems(prevItems => {
        try {
          const existingItem = prevItems.find(item => item.id === product.id);
          if (existingItem) {
            return prevItems.map(item =>
              item.id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return [...prevItems, { ...product, quantity: 1 }];
        } catch (error) {
          console.error('Error in addToCart state update:', error);
          return prevItems;
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = (id: string) => {
    try {
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setItems(prevItems =>
        prevItems.map(item => {
          if (item.id === id) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = () => {
    try {
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotalItems = () => {
    try {
      return items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error calculating total items:', error);
      return 0;
    }
  };

  const getTotalPrice = () => {
    try {
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
      console.error('Error calculating total price:', error);
      return 0;
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      customerEmail,
      setEmail,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
