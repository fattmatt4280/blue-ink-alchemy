
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerReview {
  id: string;
  name: string;
  email: string;
  rating: number;
  title: string | null;
  content: string;
  approved: boolean;
  created_at: string;
}

const CustomerReviewsManager = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('customer_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading reviews",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const updateReviewStatus = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from('customer_reviews')
      .update({ approved, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating review",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: approved ? "Review approved!" : "Review rejected",
        description: `Review has been ${approved ? 'approved and published' : 'rejected'}.`,
      });
      fetchReviews();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div>Loading reviews...</div>
        </CardContent>
      </Card>
    );
  }

  const pendingReviews = reviews.filter(review => !review.approved);
  const approvedReviews = reviews.filter(review => review.approved);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {pendingReviews.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-600">
              Pending Approval ({pendingReviews.length})
            </h3>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.name}</span>
                        <Badge variant="secondary">
                          <Mail className="w-3 h-3 mr-1" />
                          {review.email}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateReviewStatus(review.id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateReviewStatus(review.id, false)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-700 mb-2">{review.content}</p>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {approvedReviews.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600">
              Approved Reviews ({approvedReviews.length})
            </h3>
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.name}</span>
                        <Badge variant="secondary" className="bg-green-100">
                          <Mail className="w-3 h-3 mr-1" />
                          {review.email}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <Badge className="bg-green-600">Published</Badge>
                  </div>
                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-700 mb-2">{review.content}</p>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No customer reviews yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerReviewsManager;
