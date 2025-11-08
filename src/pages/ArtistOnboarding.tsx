import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArtistOnboardingWizard } from '@/components/ArtistOnboardingWizard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart } from 'lucide-react';

const ArtistOnboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user || loading) return;

      const { data } = await supabase
        .from('artist_profiles' as any)
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (data) {
        navigate('/artist/dashboard');
      }
    };

    checkExistingProfile();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            <span className="text-2xl font-bold">Heal-AId</span>
            <span className="text-muted-foreground">for Artists</span>
          </div>
        </div>

        <Card className="p-8">
          <ArtistOnboardingWizard />
        </Card>
      </div>
    </div>
  );
};

export default ArtistOnboarding;
