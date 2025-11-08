import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
  requireArtist?: boolean;
  requireAdmin?: boolean;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireArtist, 
  requireAdmin,
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { user, isAdmin, isArtist, loading } = useAuth();
  const location = useLocation();
  const [hasArtistProfile, setHasArtistProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkArtistProfile = async () => {
      if (!user || !requireArtist) {
        setCheckingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from('artist_profiles' as any)
        .select('id')
        .eq('user_id', user.id)
        .single();

      setHasArtistProfile(!!data && !error);
      setCheckingProfile(false);
    };

    checkArtistProfile();
  }, [user, requireArtist]);

  if (loading || (requireArtist && checkingProfile)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireArtist && !isArtist) {
    return <Navigate to="/" replace />;
  }

  if (requireArtist && isArtist && hasArtistProfile === false && location.pathname !== '/artist/onboarding') {
    return <Navigate to="/artist/onboarding" replace />;
  }

  return <>{children}</>;
};
