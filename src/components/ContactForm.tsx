import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit, getRateLimitKey } from '@/utils/rateLimiter';
import { sanitizeText, sanitizeEmail } from '@/utils/sanitizeInput';
import { Loader2 } from 'lucide-react';

const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  subject: z.string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Rate limiting check (3 submissions per hour per email)
      const rateLimitKey = getRateLimitKey(data.email, 'contact_form');
      const rateLimitResult = checkRateLimit(rateLimitKey, {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
      });

      if (!rateLimitResult.allowed) {
        const resetTime = new Date(rateLimitResult.resetAt);
        toast({
          title: 'Too many submissions',
          description: `Please wait until ${resetTime.toLocaleTimeString()} before submitting again.`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Sanitize inputs
      const sanitizedData = {
        name: sanitizeText(data.name),
        email: sanitizeEmail(data.email),
        subject: sanitizeText(data.subject),
        message: sanitizeText(data.message),
      };

      // Submit via edge function
      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: sanitizedData,
      });

      if (error) {
        console.error('Contact form error:', error);
        toast({
          title: 'Submission failed',
          description: 'Please try again or email us directly.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Message sent!',
        description: 'We\'ll get back to you within 24 hours.',
      });

      reset();
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name *
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Your name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email *
        </label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="your.email@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject *
        </label>
        <Input
          id="subject"
          {...register('subject')}
          placeholder="How can we help?"
          disabled={isSubmitting}
        />
        {errors.subject && (
          <p className="text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message *
        </label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Tell us more about your question or concern..."
          rows={6}
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>
    </form>
  );
};
