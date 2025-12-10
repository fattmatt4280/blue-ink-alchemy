import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReferralLinkShareProps {
  referralCode: string;
}

export function ReferralLinkShare({ referralCode }: ReferralLinkShareProps) {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `${window.location.origin}/r/${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Get 25% off your first Budder order!',
          text: 'I love Budder for tattoo aftercare! Use my link to get 25% off your first order.',
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg text-foreground">Your Unique Referral Link</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Share this link with friends. They get 25% off their first order, and you earn store credit!
      </p>

      <div className="flex gap-2">
        <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm text-foreground truncate">
          {referralLink}
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="icon"
          className="shrink-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleCopy} variant="secondary" className="flex-1">
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
        {navigator.share && (
          <Button onClick={handleShare} className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Your code: <span className="font-mono font-bold text-foreground">{referralCode}</span>
        </p>
      </div>
    </div>
  );
}
