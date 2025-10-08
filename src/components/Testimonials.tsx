
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Plus } from "lucide-react";
import { useSiteContent } from '@/hooks/useSiteContent';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import ReviewForm from './ReviewForm';
import { PublicCustomerReview, PUBLIC_REVIEW_COLUMNS } from '@/types/reviews';
const Testimonials = () => {
  const { content, loading } = useSiteContent();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [customerReviews, setCustomerReviews] = useState<PublicCustomerReview[]>([]);

  useEffect(() => {
    fetchCustomerReviews();
    
    // Set up real-time subscription for new approved reviews
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_reviews',
          filter: 'approved=eq.true'
        },
        () => {
          fetchCustomerReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCustomerReviews = async () => {
    // Use secure function that excludes email addresses and only returns approved reviews
    const { data, error } = await supabase
      .rpc('get_approved_reviews');

    if (!error && data) {
      setCustomerReviews(data.slice(0, 4));
    }
  };

  if (loading) {
    return (
      <section className="py-20 futuristic-bg">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  // Transform customer reviews to testimonial format
  const customerTestimonials = customerReviews.map((review) => ({
    id: review.id,
    name: review.name,
    role: 'Verified Customer',
    image: '/placeholder.svg',
    content: review.content,
    rating: review.rating,
    isCustomerReview: true,
    isPlaceholder: false
  }));

  // Get static testimonials from site content
  const staticTestimonials = [];
  for (let i = 1; i <= 4; i++) {
    const name = content[`testimonial_${i}_name`];
    const role = content[`testimonial_${i}_role`];
    const image = content[`testimonial_${i}_image`];
    const testimonialContent = content[`testimonial_${i}_content`];
    const rating = parseInt(content[`testimonial_${i}_rating`]) || 5;
    
    if (name) {
      staticTestimonials.push({
        id: `static_${i}`,
        name,
        role,
        image,
        content: testimonialContent,
        rating,
        isCustomerReview: false,
        isPlaceholder: false
      });
    }
  }

  // Combine testimonials: prioritize customer reviews, then static, then placeholder
  let testimonials = [...customerTestimonials];
  
  // Fill remaining spots with static testimonials
  const remainingSlots = 4 - testimonials.length;
  if (remainingSlots > 0) {
    testimonials = [...testimonials, ...staticTestimonials.slice(0, remainingSlots)];
  }

  // Add placeholder for remaining spots if needed
  while (testimonials.length < 4) {
    testimonials.push({
      id: `placeholder_${testimonials.length + 1}`,
      name: 'Your Name Here',
      role: 'Future Customer',
      image: '/placeholder.svg',
      content: 'Share your experience with Blue Dream Budder and help others discover our amazing products!',
      rating: 5,
      isCustomerReview: false,
      isPlaceholder: true
    });
  }


  return (
    <section className="py-20 futuristic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-white mb-4 cyber-text">
            Trusted by Artists & Clients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            See why tattoo professionals and skincare enthusiasts choose Blue Dream Budder 
            for superior healing and nourishment.
          </p>
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your Review
          </Button>
        </div>

        {showReviewForm && (
          <div className="mb-12">
            <ReviewForm onClose={() => setShowReviewForm(false)} />
          </div>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`neon-card rounded-2xl backdrop-blur-sm opacity-100 ${
                testimonial.isPlaceholder ? 'border-dashed border-2 border-blue-300 bg-blue-50/50' : ''
              }`}
            >
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${testimonial.isPlaceholder ? 'fill-blue-300 text-blue-300' : 'fill-blue-400 text-blue-400'}`} 
                    />
                  ))}
                </div>
                
                <blockquote className={`mb-6 leading-relaxed ${testimonial.isPlaceholder ? 'text-blue-600 italic' : 'text-gray-700'}`}>
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className={`w-12 h-12 rounded-full object-cover ${testimonial.isPlaceholder ? 'opacity-50' : 'neon-image'}`}
                  />
                  <div>
                    <div className={`font-medium ${testimonial.isPlaceholder ? 'text-blue-700' : 'text-white'}`}>
                      {testimonial.name}
                    </div>
                    <div className={`text-sm ${testimonial.isPlaceholder ? 'text-blue-500' : 'text-gray-600'}`}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                
                {testimonial.isPlaceholder && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <Button 
                      onClick={() => setShowReviewForm(true)}
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Your Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
