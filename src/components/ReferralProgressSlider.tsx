import { TIER_THRESHOLDS, TIER_INFO } from '@/hooks/useReferralProfile';

interface ReferralProgressSliderProps {
  totalReferrals: number;
  currentTier: string;
}

const tiers = ['sprout', 'leaf', 'bloom', 'harvest', 'moonflower'] as const;

export function ReferralProgressSlider({ totalReferrals, currentTier }: ReferralProgressSliderProps) {
  const maxReferrals = 25;
  const progressPercent = Math.min((totalReferrals / maxReferrals) * 100, 100);
  
  const currentTierIndex = tiers.indexOf(currentTier as typeof tiers[number]);
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  const referralsToNext = nextTier ? TIER_THRESHOLDS[nextTier] - totalReferrals : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{TIER_INFO[currentTier as keyof typeof TIER_INFO]?.icon}</span>
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {TIER_INFO[currentTier as keyof typeof TIER_INFO]?.name} Tier
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalReferrals} / {maxReferrals} referrals
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* Progress bar with tier markers */}
      <div className="relative pt-6">
        {/* Tier markers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between">
          {tiers.map((tier, index) => {
            const position = (TIER_THRESHOLDS[tier] / maxReferrals) * 100;
            const isAchieved = totalReferrals >= TIER_THRESHOLDS[tier];
            const isCurrent = tier === currentTier;
            
            return (
              <div
                key={tier}
                className="absolute flex flex-col items-center"
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                <span 
                  className={`text-lg ${isCurrent ? 'scale-125' : ''} transition-transform`}
                  title={TIER_INFO[tier].name}
                >
                  {TIER_INFO[tier].icon}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress track */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Tier threshold markers on track */}
        <div className="absolute top-6 left-0 right-0 h-3 pointer-events-none">
          {tiers.slice(1).map((tier) => {
            const position = (TIER_THRESHOLDS[tier] / maxReferrals) * 100;
            return (
              <div
                key={tier}
                className="absolute w-0.5 h-3 bg-border"
                style={{ left: `${position}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Next milestone */}
      {nextTier && (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-muted-foreground">
            Next: <span className="text-foreground font-medium">{TIER_INFO[nextTier].name} Tier</span>
          </span>
          <span className="text-primary font-medium">
            {referralsToNext} more referral{referralsToNext !== 1 ? 's' : ''} needed
          </span>
        </div>
      )}

      {currentTier === 'moonflower' && (
        <div className="text-center pt-2">
          <span className="text-sm text-primary font-medium">
            🎉 You've reached the highest tier! Legend status achieved.
          </span>
        </div>
      )}
    </div>
  );
}
