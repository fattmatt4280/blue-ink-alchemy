import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MFASetup } from './MFASetup';
import { toast } from 'sonner';

interface MFAEnforcementGateProps {
  children: React.ReactNode;
  requireMFA?: boolean;
}

export const MFAEnforcementGate = ({ children, requireMFA = false }: MFAEnforcementGateProps) => {
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('mfa_enabled, mfa_enforced_at')
        .eq('id', user.id)
        .single();

      setMfaEnabled(profile?.mfa_enabled || false);

      // If MFA is required but not enabled, show setup
      if (requireMFA && !profile?.mfa_enabled) {
        // Record enforcement timestamp
        if (!profile?.mfa_enforced_at) {
          await supabase
            .from('profiles')
            .update({ mfa_enforced_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      }
    } catch (error) {
      console.error('MFA status check error:', error);
      toast.error('Failed to verify security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleMFAComplete = async () => {
    await checkMFAStatus();
    toast.success('MFA enabled successfully! Your account is now protected.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking security settings...</p>
        </div>
      </div>
    );
  }

  // If MFA is required and not enabled, force setup
  if (requireMFA && !mfaEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Multi-Factor Authentication Required</CardTitle>
            <CardDescription className="text-base">
              Your account requires MFA for enhanced security. Please complete the setup below to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MFASetup onComplete={handleMFAComplete} />
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Why is this required?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Protects admin access to sensitive data</li>
                <li>• Prevents unauthorized account access</li>
                <li>• Required for compliance and security best practices</li>
                <li>• Ensures only you can access your account</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
