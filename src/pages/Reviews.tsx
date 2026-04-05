
import { useState } from 'react';
import { Helmet } from "react-helmet-async";
import ContentPage from "@/components/ContentPage";
import Testimonials from "@/components/Testimonials";
import ReviewForm from "@/components/ReviewForm";
import PublicReviews from "@/components/PublicReviews";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Reviews = () => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <>
    <Helmet>
      <title>Customer Reviews | Blue Dream Budder Tattoo Aftercare</title>
      <meta name="description" content="Real customer reviews for Blue Dream Budder tattoo aftercare. See how artists and collectors rate our natural healing balm." />
      <link rel="canonical" href="https://bluedreambudder.com/reviews" />
      <meta property="og:title" content="Customer Reviews | Blue Dream Budder" />
      <meta property="og:description" content="Real customer reviews for Blue Dream Budder tattoo aftercare." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://bluedreambudder.com/reviews" />
      <meta property="og:image" content="https://bluedreambudder.com/images/invoice-logo-bw.jpeg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Customer Reviews | Blue Dream Budder" />
      <meta name="twitter:description" content="Real customer reviews for Blue Dream Budder tattoo aftercare." />
      <meta name="twitter:image" content="https://bluedreambudder.com/images/invoice-logo-bw.jpeg" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Blue Dream Budder Tattoo Aftercare Balm",
          "brand": { "@type": "Brand", "name": "Blue Dream Budder" },
          "url": "https://bluedreambudder.com/shop",
          "description": "Premium all-natural tattoo aftercare balm made with natural butters and botanical oils.",
          "review": {
            "@type": "Review",
            "reviewBody": "Best tattoo aftercare I've ever used. Healed faster and colors stayed vibrant.",
            "author": { "@type": "Person", "name": "Verified Customer" },
            "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
          }
        })}
      </script>
    </Helmet>
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
        
        <PublicReviews />
        
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
    </>
  );
};

export default Reviews;
