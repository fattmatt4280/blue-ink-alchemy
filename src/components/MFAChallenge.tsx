import { useState } from 'react';
import { Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MFAChallengeProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const MFAChallenge = ({ onSuccess, onCancel }: MFAChallengeProps) => {
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (!totpFactor) {
        toast.error('MFA not configured');
        return;
      }

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code,
      });

      if (error) {
        // Track failed attempt
        const { data: profile } = await supabase
          .from('profiles')
          .select('failed_mfa_attempts')
          .eq('id', user.id)
          .single();

        const failedAttempts = (profile?.failed_mfa_attempts || 0) + 1;

        // Lock account after 5 failed attempts for 15 minutes
        if (failedAttempts >= 5) {
          await supabase
            .from('profiles')
            .update({
              failed_mfa_attempts: failedAttempts,
              mfa_locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            })
            .eq('id', user.id);

          toast.error('Account locked due to multiple failed attempts. Try again in 15 minutes.');
          await supabase.auth.signOut();
          onCancel();
          return;
        }

        await supabase
          .from('profiles')
          .update({ failed_mfa_attempts: failedAttempts })
          .eq('id', user.id);

        toast.error(`Invalid code. ${5 - failedAttempts} attempts remaining.`);
        setCode('');
        return;
      }

      // Reset failed attempts on success
      await supabase
        .from('profiles')
        .update({ 
          failed_mfa_attempts: 0,
          mfa_locked_until: null 
        })
        .eq('id', user.id);

      toast.success('MFA verification successful!');
      onSuccess();
    } catch (error: any) {
      console.error('MFA verification error:', error);
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCode = async () => {
    if (!code) {
      toast.error('Please enter a backup code');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('backup_codes')
        .eq('id', user.id)
        .single();

      const backupCodes = (profile?.backup_codes as string[]) || [];
      
      if (!backupCodes.includes(code)) {
        toast.error('Invalid backup code');
        setCode('');
        return;
      }

      // Remove used backup code
      const updatedCodes = backupCodes.filter(c => c !== code);
      await supabase
        .from('profiles')
        .update({ 
          backup_codes: updatedCodes,
          failed_mfa_attempts: 0,
          mfa_locked_until: null
        })
        .eq('id', user.id);

      toast.success('Backup code verified!');
      if (updatedCodes.length === 0) {
        toast.warning('All backup codes used. Please generate new ones.');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Backup code error:', error);
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={isBackupCode ? "Enter backup code" : "000000"}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={isBackupCode ? 12 : 6}
              className="text-center text-2xl tracking-widest"
              disabled={loading}
            />
          </div>

          <Button
            onClick={isBackupCode ? handleBackupCode : handleVerify}
            className="w-full"
            disabled={loading || !code}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setIsBackupCode(!isBackupCode);
              setCode('');
            }}
            className="w-full"
            disabled={loading}
          >
            <Key className="w-4 h-4 mr-2" />
            {isBackupCode ? 'Use authenticator code' : 'Use backup code instead'}
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
            disabled={loading}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
