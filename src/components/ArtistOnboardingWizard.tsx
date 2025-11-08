import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, MessageSquare, Bell, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  businessInfoSchema,
  professionalInfoSchema,
  notificationPrefsSchema,
  type BusinessInfo,
  type ProfessionalInfo,
  type NotificationPrefs,
} from '@/schemas/artistOnboarding';

const SPECIALTIES = [
  'Traditional',
  'Realism',
  'Japanese',
  'Black & Grey',
  'Color',
  'Watercolor',
  'Geometric',
  'Tribal',
  'Neo-Traditional',
  'Fine Line',
  'Portrait',
  'Biomechanical',
  'Other',
];

export const ArtistOnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BusinessInfo & ProfessionalInfo & NotificationPrefs>>({});
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const businessForm = useForm<BusinessInfo>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: formData as BusinessInfo,
  });

  const professionalForm = useForm<ProfessionalInfo>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: { ...formData, specialties: selectedSpecialties } as ProfessionalInfo,
  });

  const notificationForm = useForm<NotificationPrefs>({
    resolver: zodResolver(notificationPrefsSchema),
    defaultValues: { alerts: 'both', chats: 'both', ...formData } as NotificationPrefs,
  });

  const progress = (step / 4) * 100;

  const handleBusinessNext = businessForm.handleSubmit((data) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  });

  const handleProfessionalNext = professionalForm.handleSubmit((data) => {
    if (selectedSpecialties.length === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one specialty',
        variant: 'destructive',
      });
      return;
    }
    setFormData({ ...formData, ...data, specialties: selectedSpecialties });
    setStep(3);
  });

  const handleFinalSubmit = notificationForm.handleSubmit(async (data) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Create artist role
      const { error: roleError } = await supabase
        .from('user_roles' as any)
        .insert({ user_id: user.id, role: 'artist' } as any);

      if (roleError) throw roleError;

      // Create artist profile
      const { error: profileError } = await supabase
        .from('artist_profiles' as any)
        .insert({
          user_id: user.id,
          business_name: formData.business_name,
          bio: formData.bio || null,
          studio_location: formData.studio_location,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
          specialties: selectedSpecialties,
          years_experience: formData.years_experience,
          accepting_clients: formData.accepting_clients ?? true,
          notification_preferences: {
            alerts: data.alerts,
            chats: data.chats,
          },
        });

      if (profileError) throw profileError;

      toast({
        title: 'Welcome to Heal-AId for Artists!',
        description: 'Your profile has been created successfully.',
      });

      navigate('/artist/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create artist profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to Heal-AId for Artists!</h1>
          <p className="text-muted-foreground">
            Join hundreds of tattoo artists using Heal-AId to provide better aftercare for their clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 space-y-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Direct Client Communication</h3>
            <p className="text-sm text-muted-foreground">
              Stay connected with your clients throughout their healing journey
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <Bell className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Automated Healing Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Get notified immediately if issues are detected
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Track Client Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor healing progress with AI-powered analysis
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <Shield className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Reduce Liability</h3>
            <p className="text-sm text-muted-foreground">
              Document healing progress and provide timely interventions
            </p>
          </Card>
        </div>

        <Button onClick={() => setStep(2)} className="w-full" size="lg">
          Get Started
        </Button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-muted-foreground">Step 1 of 3</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Business Information</h2>
          <p className="text-muted-foreground">Tell us about your tattoo business</p>
        </div>

        <form onSubmit={handleBusinessNext} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business/Studio Name *</Label>
            <Input
              id="business_name"
              {...businessForm.register('business_name')}
              placeholder="Your Studio Name"
            />
            {businessForm.formState.errors.business_name && (
              <p className="text-sm text-destructive">
                {businessForm.formState.errors.business_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              {...businessForm.register('bio')}
              placeholder="Tell clients about your style and approach..."
              rows={4}
              maxLength={500}
            />
            {businessForm.formState.errors.bio && (
              <p className="text-sm text-destructive">{businessForm.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="studio_location">Studio Location *</Label>
            <Input
              id="studio_location"
              {...businessForm.register('studio_location')}
              placeholder="City, State"
            />
            {businessForm.formState.errors.studio_location && (
              <p className="text-sm text-destructive">
                {businessForm.formState.errors.studio_location.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              {...businessForm.register('contact_email')}
              placeholder="your@email.com"
            />
            {businessForm.formState.errors.contact_email && (
              <p className="text-sm text-destructive">
                {businessForm.formState.errors.contact_email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Phone (Optional)</Label>
            <Input
              id="contact_phone"
              type="tel"
              {...businessForm.register('contact_phone')}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Next
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-6">
        <div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-muted-foreground">Step 2 of 3</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Professional Information</h2>
          <p className="text-muted-foreground">Share your expertise and specialties</p>
        </div>

        <form onSubmit={handleProfessionalNext} className="space-y-6">
          <div className="space-y-2">
            <Label>Specialties * (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SPECIALTIES.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty}
                    checked={selectedSpecialties.includes(specialty)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSpecialties([...selectedSpecialties, specialty]);
                      } else {
                        setSelectedSpecialties(selectedSpecialties.filter((s) => s !== specialty));
                      }
                    }}
                  />
                  <Label htmlFor={specialty} className="cursor-pointer">
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="years_experience">Years of Experience *</Label>
            <Input
              id="years_experience"
              type="number"
              min="0"
              max="50"
              {...professionalForm.register('years_experience', { valueAsNumber: true })}
              placeholder="5"
            />
            {professionalForm.formState.errors.years_experience && (
              <p className="text-sm text-destructive">
                {professionalForm.formState.errors.years_experience.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="accepting_clients">Currently Accepting New Clients</Label>
              <p className="text-sm text-muted-foreground">
                Clients can see if you're available for new work
              </p>
            </div>
            <Switch
              id="accepting_clients"
              defaultChecked={true}
              onCheckedChange={(checked) => professionalForm.setValue('accepting_clients', checked)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Next
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="space-y-6">
        <div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-muted-foreground">Step 3 of 3</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Notification Preferences</h2>
          <p className="text-muted-foreground">Choose how you'd like to be notified</p>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Healing Alerts (Urgent Issues)</Label>
            <RadioGroup
              defaultValue="both"
              onValueChange={(value) => notificationForm.setValue('alerts', value as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="alerts-email" />
                <Label htmlFor="alerts-email" className="cursor-pointer">
                  Email only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="push" id="alerts-push" />
                <Label htmlFor="alerts-push" className="cursor-pointer">
                  Push notifications only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="alerts-both" />
                <Label htmlFor="alerts-both" className="cursor-pointer">
                  Both email and push (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="alerts-none" />
                <Label htmlFor="alerts-none" className="cursor-pointer">
                  No alerts
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Chat Messages</Label>
            <RadioGroup
              defaultValue="both"
              onValueChange={(value) => notificationForm.setValue('chats', value as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="chats-email" />
                <Label htmlFor="chats-email" className="cursor-pointer">
                  Email only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="push" id="chats-push" />
                <Label htmlFor="chats-push" className="cursor-pointer">
                  Push notifications only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="chats-both" />
                <Label htmlFor="chats-both" className="cursor-pointer">
                  Both email and push
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="chats-none" />
                <Label htmlFor="chats-none" className="cursor-pointer">
                  No notifications
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Almost there!</p>
                <p className="text-sm text-muted-foreground">
                  You can change these preferences anytime in your settings.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return null;
};
