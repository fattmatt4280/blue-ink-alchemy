
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MFAChallenge } from '@/components/MFAChallenge';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMFAChallenge, setShowMFAChallenge] = useState(false);
  const { signIn, signUp, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle OAuth PKCE code exchange and redirect authenticated users
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      // If we have a code parameter, exchange it for a session (PKCE flow)
      if (code) {
        console.log('[Google OAuth] PKCE code detected, exchanging for session...');
        setLoading(true);
        
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('[Google OAuth] Code exchange error:', error);
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
          } else {
            console.log('[Google OAuth] Code exchange successful');
            console.log('[Google OAuth] User authenticated:', data.user?.email);
            console.log('[Google OAuth] Session established:', !!data.session);
            
            // Verify profile and role creation
            setTimeout(async () => {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', data.user?.id)
                  .single();
                
                const { data: role } = await supabase
                  .from('user_roles')
                  .select('*')
                  .eq('user_id', data.user?.id)
                  .single();
                
                console.log('[Google OAuth] Profile created:', !!profile, profile);
                console.log('[Google OAuth] Role assigned:', role?.role || 'none', role);
              } catch (verifyError) {
                console.error('[Google OAuth] Error verifying account setup:', verifyError);
              }
            }, 1000);
            
            toast({
              title: "Welcome!",
              description: "You've been signed in successfully.",
            });
          }
          
          // Clean up URL by removing query parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('[Google OAuth] Unexpected error during code exchange:', err);
          toast({
            title: "Unexpected Error",
            description: "An error occurred during sign-in.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
        
        return;
      }
      
      // Only redirect if we're authenticated and not processing OAuth
      if (!authLoading && user) {
        if (isAdmin) {
          console.log('[Auth] Admin user detected, redirecting to admin dashboard');
          toast({
            title: "Admin access detected",
            description: "Redirecting to your dashboard...",
          });
          navigate('/admin', { replace: true });
        } else {
          console.log('[Auth] User is authenticated, redirecting to home page');
          navigate('/', { replace: true });
        }
      }
    };

    handleAuthCallback();
  }, [user, isAdmin, authLoading, navigate, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if account is locked
      const { data: lockCheck, error: lockError } = await supabase.rpc('is_account_locked', {
        check_email: email
      });

      if (lockError) throw lockError;

      if (lockCheck) {
        toast({
          title: "Account Locked",
          description: "Too many failed login attempts. Please try again in 15 minutes.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await signIn(email, password);

      if (error) {
        // Log failed attempt
        await supabase.rpc('log_login_attempt', {
          attempt_email: email,
          attempt_ip: 'client',
          attempt_user_agent: navigator.userAgent,
          attempt_success: false,
          attempt_failure_reason: error.message
        });

        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Log successful attempt
      await supabase.rpc('log_login_attempt', {
        attempt_email: email,
        attempt_ip: 'client',
        attempt_user_agent: navigator.userAgent,
        attempt_success: true
      });

      // Check if user has MFA enabled
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('mfa_enabled')
          .eq('id', currentUser.id)
          .single();

        if (profile?.mfa_enabled) {
          setShowMFAChallenge(true);
          setLoading(false);
          return;
        }
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!firstName.trim()) {
      toast({
        title: "First name required",
        description: "Please enter your first name to continue.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, {
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    console.log('[Google OAuth] Initiating Google sign-in flow...');
    console.log('[Google OAuth] Redirect URL:', `${window.location.origin}/auth`);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      console.log('[Google OAuth] Response received:', { 
        hasData: !!data, 
        hasError: !!error,
        provider: data?.provider,
        url: data?.url 
      });

      if (error) {
        console.error('[Google OAuth] Configuration error:', error);
        console.error('[Google OAuth] Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        toast({
          title: "Google Sign-In Configuration Error",
          description: `${error.message}. Please check if Google provider is enabled in Supabase dashboard.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // OAuth flow initiated successfully, user will be redirected
      console.log('[Google OAuth] Flow initiated successfully, redirecting to Google...');
      
    } catch (err) {
      console.error('[Google OAuth] Unexpected error during sign-in:', err);
      console.error('[Google OAuth] Error type:', err instanceof Error ? err.constructor.name : typeof err);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (showMFAChallenge) {
    return (
      <MFAChallenge
        onSuccess={() => {
          setShowMFAChallenge(false);
          toast({
            title: "MFA Verified",
            description: "You have been signed in successfully.",
          });
        }}
        onCancel={() => {
          setShowMFAChallenge(false);
          supabase.auth.signOut();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-light">Blue Dream Budder</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one.
            <br />
            <span className="text-sm text-muted-foreground mt-1 block">
              Admin features will be available if you have admin permissions.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">First Name *</Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
