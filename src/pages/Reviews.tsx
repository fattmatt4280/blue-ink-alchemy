
import { useState } from 'react';
import ContentPage from "@/components/ContentPage";
import Testimonials from "@/components/Testimonials";
import ReviewForm from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Reviews = () => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <ContentPage title="Customer Reviews">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <p className="text-lg text-gray-600">
            See what our customers are saying about Blue Dream Budder and how it's transformed their aftercare routine.
          </p>
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Review
          </Button>
        </div>
        
        {showReviewForm && (
          <div className="mb-8">
            <ReviewForm onClose={() => setShowReviewForm(false)} />
          </div>
        )}
        
        <Testimonials />
        
        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Share Your Experience</h2>
          <p className="text-gray-600 mb-4">
            We'd love to hear about your experience with Blue Dream Budder! 
            Your feedback helps us continue to improve our products and helps other customers make informed decisions.
          </p>
          <p className="text-gray-600">
            Email us at <a href="mailto:reviews@bluedreambudder.com" className="text-blue-600 hover:underline">reviews@bluedreambudder.com</a> 
            with your story and photos (if you're comfortable sharing).
          </p>
        </div>
      </div>
    </ContentPage>
  );
};

export default Reviews;
