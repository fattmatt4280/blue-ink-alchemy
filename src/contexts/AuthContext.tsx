
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isArtist: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: { firstName?: string; lastName?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_TIME = 25 * 60 * 1000;

  const checkRoles = useCallback(async (userId: string) => {
    try {
      const { data: adminData } = await supabase.rpc('is_admin', { user_id: userId });
      setIsAdmin(adminData || false);

      const { data: artistData } = await supabase.rpc('is_artist' as any, { p_user_id: userId } as any);
      setIsArtist(artistData || false);
    } catch (error) {
      console.error('[AuthContext] Error checking roles:', error);
      setIsAdmin(false);
      setIsArtist(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await checkRoles(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setIsArtist(false);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
          }
        }

        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await checkRoles(initialSession.user.id);
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkRoles]);

  // Session timeout monitoring
  useEffect(() => {
    if (!session || !user) return;

    const checkActivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        signOut();
      }
    };

    const interval = setInterval(checkActivity, 60000);
    const resetActivity = () => { lastActivityRef.current = Date.now(); };
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetActivity));

    return () => {
      clearInterval(interval);
      events.forEach(event => window.removeEventListener(event, resetActivity));
    };
  }, [session, user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: { firstName?: string; lastName?: string }) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { first_name: metadata?.firstName, last_name: metadata?.lastName }
        }
      });

      if (!error && data.user && metadata) {
        await supabase
          .from('profiles')
          .update({ first_name: metadata.firstName, last_name: metadata.lastName })
          .eq('id', data.user.id);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isArtist, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
