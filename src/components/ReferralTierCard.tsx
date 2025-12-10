import { Check, Lock } from 'lucide-react';
import { TIER_THRESHOLDS, TIER_INFO } from '@/hooks/useReferralProfile';
import { cn } from '@/lib/utils';

interface ReferralTierCardProps {
  tier: keyof typeof TIER_INFO;
  totalReferrals: number;
  currentTier: string;
}

export function ReferralTierCard({ tier, totalReferrals, currentTier }: ReferralTierCardProps) {
  const info = TIER_INFO[tier];
  const threshold = TIER_THRESHOLDS[tier];
  const isAchieved = totalReferrals >= threshold;
  const isCurrent = tier === currentTier;
  const referralsNeeded = Math.max(0, threshold - totalReferrals);

  return (
    <div
      className={cn(
        'relative border rounded-xl p-4 transition-all',
        isCurrent && 'border-primary bg-primary/5 ring-2 ring-primary/20',
        isAchieved && !isCurrent && 'border-green-500/30 bg-green-500/5',
        !isAchieved && !isCurrent && 'border-border bg-card opacity-70'
      )}
    >
      {/* Status badge */}
      <div className="absolute -top-2 -right-2">
        {isCurrent && (
          <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            Current
          </span>
        )}
        {isAchieved && !isCurrent && (
          <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" /> Achieved
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className="text-3xl">{info.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{info.name}</h4>
            <span className="text-xs text-muted-foreground">
              ({threshold} referral{(threshold as number) !== 1 ? 's' : ''})
            </span>
          </div>
          <p className="text-sm text-primary font-medium mt-1">{info.reward}</p>
          <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
        </div>
        
        {!isAchieved && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-xs whitespace-nowrap">
              {referralsNeeded} more
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
