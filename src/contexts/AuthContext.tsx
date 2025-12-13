
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

  // Session timeout: 30 minutes of inactivity
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 25 * 60 * 1000; // Show warning at 25 minutes

  useEffect(() => {
    let mounted = true;
    
    console.log('[AuthContext] Initializing auth state');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('[AuthContext] Auth state changed:', event, session?.user?.email || 'no user');
        
        // Handle different auth events with enhanced logging
        if (event === 'SIGNED_IN') {
          console.log('[AuthContext] ✓ User signed in successfully');
          console.log('[AuthContext] User ID:', session?.user?.id);
          console.log('[AuthContext] User email:', session?.user?.email);
          console.log('[AuthContext] Auth provider:', session?.user?.app_metadata?.provider);
          console.log('[AuthContext] Session expires at:', session?.expires_at);
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthContext] User signed out');
          setIsAdmin(false);
          setIsArtist(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[AuthContext] Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          console.log('[AuthContext] User data updated');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've processed the auth state change
        if (event !== 'TOKEN_REFRESHED') {
          setLoading(false);
        }
      }
    );

    // Get initial session AFTER setting up the listener
    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          
          // Handle refresh token errors gracefully
          if (error.message.includes('refresh_token_not_found') || 
              error.message.includes('Invalid Refresh Token')) {
            console.log('[AuthContext] Invalid session detected, clearing auth state');
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        }
        
        if (mounted) {
          console.log('[AuthContext] Initial session:', session?.user?.email || 'no user');
          if (session) {
            console.log('[AuthContext] Session details:', {
              userId: session.user?.id,
              email: session.user?.email,
              provider: session.user?.app_metadata?.provider,
              expiresAt: session.expires_at
            });
          }
          setSession(session);
          setUser(session?.user ?? null);
          
          // Only set loading to false if we haven't already done so via auth state change
          setTimeout(() => {
            if (mounted) {
              setLoading(false);
            }
          }, 100);
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Separate effect to handle admin status checking
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          console.log('[AuthContext] Checking admin status for user:', user.email);
          const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
          
          if (error) {
            console.error('[AuthContext] RPC error checking admin status:', error);
            setIsAdmin(false);
            return;
          }
          
          console.log('[AuthContext] Admin check result:', data ? 'IS ADMIN' : 'NOT ADMIN');
          setIsAdmin(data || false);
          
      // Check artist status
      const { data: artistData, error: artistError } = await supabase.rpc('is_artist' as any, { p_user_id: user.id } as any);
          
          if (artistError) {
            console.error('[AuthContext] RPC error checking artist status:', artistError);
            setIsArtist(false);
          } else {
            console.log('[AuthContext] Artist check result:', artistData ? 'IS ARTIST' : 'NOT ARTIST');
            setIsArtist(artistData || false);
          }
          
          // Verify profile and role exist for this user
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          const { data: role, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (profileError) {
            console.error('[AuthContext] Profile check error:', profileError);
          } else {
            console.log('[AuthContext] ✓ Profile exists:', !!profile);
          }
          
          if (roleError) {
            console.error('[AuthContext] Role check error:', roleError);
          } else {
            console.log('[AuthContext] ✓ Role assigned:', role?.role || 'none');
          }
        } catch (error) {
          console.error('[AuthContext] Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        console.log('[AuthContext] No user, setting isAdmin and isArtist to false');
        setIsAdmin(false);
        setIsArtist(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Session timeout monitoring
  useEffect(() => {
    if (!session || !user) return;

    const checkActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        console.log('[AuthContext] Session timeout - signing out due to inactivity');
        signOut();
      } else if (timeSinceLastActivity > WARNING_TIME) {
        const timeUntilTimeout = SESSION_TIMEOUT - timeSinceLastActivity;
        const minutesRemaining = Math.ceil(timeUntilTimeout / 60000);
        console.log(`[AuthContext] Session expiring in ${minutesRemaining} minutes`);
      }
    };

    const interval = setInterval(checkActivity, 60000); // Check every minute

    // Track user activity - update ref instead of state to avoid re-renders
    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetActivity));

    return () => {
      clearInterval(interval);
      events.forEach(event => window.removeEventListener(event, resetActivity));
    };
  }, [session, user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
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
          data: {
            first_name: metadata?.firstName,
            last_name: metadata?.lastName
          }
        }
      });

      // Update profile with names after sign up
      if (!error && data.user && metadata) {
        await supabase
          .from('profiles')
          .update({
            first_name: metadata.firstName,
            last_name: metadata.lastName
          })
          .eq('id', data.user.id);
      }

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
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

  const value = {
    user,
    session,
    isAdmin,
    isArtist,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
