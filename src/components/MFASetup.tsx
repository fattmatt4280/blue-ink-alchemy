import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MFASetupProps {
  onComplete?: () => void;
}

export const MFASetup = ({ onComplete }: MFASetupProps) => {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup' | 'complete'>('generate');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [factorId, setFactorId] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

  const resetSetup = async () => {
    try {
      // Unenroll any unverified factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp) {
        for (const factor of factors.totp) {
          if (factor.status === 'unverified') {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
      }
      
      setStep('generate');
      setSecret('');
      setQrCodeUrl('');
      setFactorId('');
      setVerificationCode('');
      toast.success('Setup reset. Please try again.');
    } catch (error: any) {
      console.error('Reset failed:', error);
      toast.error('Failed to reset setup');
    }
  };

  const generateMFA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if there's already an unverified factor and clean it up
      const { data: existingFactors } = await supabase.auth.mfa.listFactors();
      if (existingFactors?.totp) {
        for (const factor of existingFactors.totp) {
          if (factor.status === 'unverified') {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
      }

      // Enroll in MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        console.error('MFA enrollment error:', error);
        if (error.message?.includes('already enrolled')) {
          toast.error('Factor already exists. Use "Reset Setup" to start over.');
          return;
        }
        throw error;
      }

      if (!data?.id || !data.totp?.secret || !data.totp?.uri) {
        throw new Error('Incomplete MFA data returned');
      }

      setFactorId(data.id);
      setSecret(data.totp.secret);
      setQrCodeUrl(data.totp.uri);
      setStep('verify');
    } catch (error: any) {
      console.error('MFA generation failed:', error);
      toast.error(error?.message || 'Failed to generate MFA setup. Please try again.');
    }
  };

  const verifyMFA = async () => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const trimmedCode = verificationCode.trim();
      if (trimmedCode.length !== 6) {
        throw new Error('Verification code must be 6 digits');
      }

      // Use stored factorId or fallback to listing factors
      let currentFactorId = factorId;
      
      if (!currentFactorId) {
        const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
        if (listError) throw listError;
        
        const factor = factors?.totp?.find(f => f.status === 'unverified');
        if (!factor) {
          throw new Error('No pending MFA factor found. Please start setup again.');
        }
        currentFactorId = factor.id;
      }

      // Challenge and verify the code
      const challenge = await supabase.auth.mfa.challenge({ factorId: currentFactorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: currentFactorId,
        challengeId: challenge.data.id,
        code: trimmedCode
      });

      if (verify.error) {
        if (verify.error.message?.includes('Invalid code')) {
          throw new Error('Invalid verification code. Please check your authenticator app and try again.');
        }
        throw verify.error;
      }

      // Generate backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      setBackupCodes(codes);

      // Update profile
      await supabase.from('profiles').update({
        mfa_enabled: true,
        mfa_secret: secret,
        backup_codes: codes
      }).eq('id', user.id);

      setStep('backup');
      toast.success('MFA verified successfully!');
    } catch (error: any) {
      console.error('MFA verification failed:', error);
      toast.error(error?.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Backup codes copied to clipboard');
  };

  const completeSetup = () => {
    setStep('complete');
    onComplete?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your admin account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'generate' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Multi-factor authentication (MFA) requires a second verification code from your phone when signing in.
            </p>
            <div className="flex gap-2">
              <Button onClick={generateMFA}>
                Enable MFA
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <QRCodeSVG value={qrCodeUrl} size={200} />
            </div>
            <Alert>
              <AlertDescription>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                disabled={isVerifying}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={verifyMFA} 
                disabled={verificationCode.length !== 6 || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button variant="outline" onClick={resetSetup}>
                Reset Setup
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Make sure your phone's time is synced. If the code doesn't work, try waiting for a new code.
            </p>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Save these backup codes in a secure place. Each code can only be used once if you lose access to your authenticator app.
              </AlertDescription>
            </Alert>
            <div className="bg-muted p-4 rounded-md font-mono text-sm space-y-1">
              {backupCodes.map((code, i) => (
                <div key={i}>{code}</div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={copyBackupCodes} variant="outline">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Codes'}
              </Button>
              <Button onClick={completeSetup}>
                I've Saved My Codes
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <Alert>
            <AlertDescription className="text-green-600">
              MFA has been successfully enabled! You'll be prompted for a verification code on your next login.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
