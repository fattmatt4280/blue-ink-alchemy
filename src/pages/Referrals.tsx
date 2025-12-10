import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Gift, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralProfile, TIER_INFO } from '@/hooks/useReferralProfile';
import { ReferralProgressSlider } from '@/components/ReferralProgressSlider';
import { ReferralLinkShare } from '@/components/ReferralLinkShare';
import { ReferralTierCard } from '@/components/ReferralTierCard';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

const tiers = ['sprout', 'leaf', 'bloom', 'harvest', 'moonflower'] as const;

export default function Referrals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, referrals, loading, error } = useReferralProfile();

  return (
    <>
      <Helmet>
        <title>Grow & Glow Rewards | Budder Referral Program</title>
        <meta
          name="description"
          content="Share the healing and earn rewards! Give friends 25% off their first order and earn store credit, discounts, free shipping, and more."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AppHeader />

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full mb-4">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              🌱 Grow & Glow Rewards
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share the healing, earn rewards! Give friends 25% off their first order and unlock amazing perks as you grow your network.
            </p>
          </div>

          {/* How it works - for everyone */}
          <div className="bg-gradient-to-r from-primary/10 via-cyan-500/10 to-primary/10 rounded-2xl p-6 border border-primary/20">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🔗</div>
                <h3 className="font-medium text-foreground">1. Share Your Link</h3>
                <p className="text-sm text-muted-foreground">Send your unique referral link to friends</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🛒</div>
                <h3 className="font-medium text-foreground">2. Friends Save 25%</h3>
                <p className="text-sm text-muted-foreground">They get 25% off their first Budder order</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-medium text-foreground">3. You Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">Get $5+ store credit per successful referral</p>
              </div>
            </div>
          </div>

          {/* User-specific content */}
          {!user ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Sign in to start earning rewards!
              </h2>
              <p className="text-muted-foreground">
                Create an account or sign in to get your unique referral link and start growing your network.
              </p>
              <Button onClick={() => navigate('/auth')} size="lg">
                Sign In / Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : profile ? (
            <>
              {/* Progress Slider */}
              <ReferralProgressSlider
                totalReferrals={profile.total_referrals}
                currentTier={profile.current_tier}
              />

              {/* Referral Link */}
              <ReferralLinkShare referralCode={profile.referral_code} />

              {/* Current Benefits */}
              {(profile.store_credit_balance > 0 || profile.permanent_discount_percent > 0 || profile.free_shipping_until) && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-3">Your Active Benefits</h3>
                  <div className="space-y-2 text-sm">
                    {profile.store_credit_balance > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-foreground">
                          ${profile.store_credit_balance.toFixed(2)} store credit available
                        </span>
                      </div>
                    )}
                    {profile.permanent_discount_percent > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-foreground">
                          {profile.permanent_discount_percent}% permanent discount on all orders
                        </span>
                      </div>
                    )}
                    {profile.free_shipping_until && new Date(profile.free_shipping_until) > new Date() && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-foreground">
                          Free shipping until {new Date(profile.free_shipping_until).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {profile.current_tier === 'moonflower' && !profile.free_budder_claimed && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-foreground">
                          🌙 Free 8oz Budder ready to claim!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Referrals */}
              {referrals.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Recent Referrals</h3>
                  <div className="space-y-3">
                    {referrals.slice(0, 5).map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <span className="text-foreground">{referral.referred_email}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            referral.status === 'credited'
                              ? 'bg-green-500/20 text-green-500'
                              : referral.status === 'converted'
                              ? 'bg-cyan-500/20 text-cyan-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {referral.status === 'credited' && `+$${referral.credit_amount}`}
                          {referral.status === 'converted' && 'Processing'}
                          {referral.status === 'pending' && 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Tier Breakdown */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground text-center">
              Reward Tiers
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              The more friends you refer, the better your rewards get!
            </p>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <ReferralTierCard
                  key={tier}
                  tier={tier}
                  totalReferrals={profile?.total_referrals || 0}
                  currentTier={profile?.current_tier || 'sprout'}
                />
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">When do I get my store credit?</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive store credit within 24 hours after your friend's first order is confirmed.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-foreground">Is there a limit to how many friends I can refer?</h3>
                <p className="text-sm text-muted-foreground">
                  No limit! Refer as many friends as you want and keep earning rewards.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-foreground">How do tier upgrades work?</h3>
                <p className="text-sm text-muted-foreground">
                  Your tier automatically upgrades when you reach the referral threshold. Benefits are applied immediately!
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-foreground">Can I combine store credit with other discounts?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! Store credit can be combined with your tier discount and any promotional codes.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
