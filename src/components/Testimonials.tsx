
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Plus } from "lucide-react";
import { useSiteContent } from '@/hooks/useSiteContent';
import { useState } from 'react';
import ReviewForm from './ReviewForm';

const Testimonials = () => {
  const { content, loading } = useSiteContent();
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (loading) {
    return (
      <section className="py-20 futuristic-bg">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  const testimonials = [];
  for (let i = 1; i <= 3; i++) {
    const name = content[`testimonial_${i}_name`];
    const role = content[`testimonial_${i}_role`];
    const image = content[`testimonial_${i}_image`];
    const testimonialContent = content[`testimonial_${i}_content`];
    const rating = parseInt(content[`testimonial_${i}_rating`]) || 5;
    
    if (name) {
      testimonials.push({
        id: i,
        name,
        role,
        image,
        content: testimonialContent,
        rating
      });
    }
  }

  return (
    <section className="py-20 futuristic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4 cyber-text">
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
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="neon-card rounded-2xl backdrop-blur-sm">
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-blue-400 text-blue-400" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover neon-image"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
