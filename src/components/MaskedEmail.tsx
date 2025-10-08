import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { maskEmail } from '@/utils/piiAnonymizer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MaskedEmailProps {
  email: string;
  userId: string;
  accessReason?: string;
}

export const MaskedEmail = ({ email, userId, accessReason = 'Admin review' }: MaskedEmailProps) => {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = async () => {
    if (revealed) {
      setRevealed(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Log PII access
      await supabase.from('pii_access_log').insert({
        admin_user_id: user.id,
        accessed_user_id: userId,
        pii_type: 'email',
        access_reason: accessReason,
        ip_address: 'client' // Will be enhanced with actual IP
      });

      setRevealed(true);
    } catch (error) {
      console.error('Failed to log PII access:', error);
      toast.error('Failed to reveal email');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {revealed ? email : maskEmail(email)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReveal}
        className="h-6 w-6 p-0"
      >
        {revealed ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};
