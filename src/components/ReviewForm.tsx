import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { checkRateLimit, getRateLimitKey } from '@/utils/rateLimiter';

const reviewSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  title: z.string().trim().max(200, 'Title must be less than 200 characters').optional().or(z.literal('')),
  content: z.string().trim().min(10, 'Review must be at least 10 characters').max(2000, 'Review must be less than 2000 characters'),
  rating: z.number().int().min(1).max(5)
});

interface ReviewFormProps {
  onClose: () => void;
}

const ReviewForm = ({ onClose }: ReviewFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    content: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(formData.email, 'review_submission');
    const rateLimitCheck = checkRateLimit(rateLimitKey, { maxAttempts: 3, windowMs: 3600000 });
    
    if (!rateLimitCheck.allowed) {
      toast({
        title: "Too many attempts",
        description: "You've submitted too many reviews. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);

    try {
      // Validate input data
      const validatedData = reviewSchema.parse(formData);

      const { error } = await supabase
        .from('customer_reviews')
        .insert([{
          name: validatedData.name,
          email: validatedData.email,
          title: validatedData.title || null,
          content: validatedData.content,
          rating: validatedData.rating
        }]);

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Thank you for your review. It will be published after approval.",
      });

      onClose();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error submitting review",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                maxLength={255}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${
                    star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title (optional)</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of your experience"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Tell us about your experience with Blue Dream Budder..."
              rows={4}
              maxLength={2000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.content.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
