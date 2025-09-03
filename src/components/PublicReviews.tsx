import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PublicReview {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
}

const PublicReviews = () => {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicReviews();
  }, []);

  const fetchPublicReviews = async () => {
    // Only select public-safe fields, email is excluded for privacy
    const { data, error } = await supabase
      .from('customer_reviews')
      .select('id, name, rating, title, content, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div>Loading reviews...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold mb-6">Customer Reviews</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <Card key={review.id} className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {review.title && (
                <h4 className="font-semibold mb-2">{review.title}</h4>
              )}
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                "{review.content}"
              </p>
              
              <div className="border-t pt-4">
                <div className="font-medium text-gray-900">{review.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicReviews;