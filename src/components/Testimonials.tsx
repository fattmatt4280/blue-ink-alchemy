
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Tattoo Artist",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=80&h=80&fit=crop&crop=face",
    content: "Blue Dream Budder has revolutionized how my clients heal. The natural ingredients work incredibly well, and the CBD provides amazing anti-inflammatory benefits.",
    rating: 5
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Client",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=80&h=80&fit=crop&crop=face",
    content: "After trying countless aftercare products, this is the only one that actually helped my tattoo heal without irritation. The Blue Dream terpenes are genius!",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Turner",
    role: "Skin Care Enthusiast",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=80&h=80&fit=crop&crop=face",
    content: "I use this even when I don't have fresh ink. The mango and shea butter combination leaves my skin so soft and nourished. Premium quality!",
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 futuristic-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4 cyber-text">
            Trusted by Artists & Clients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See why tattoo professionals and skincare enthusiasts choose Blue Dream Budder 
            for superior healing and nourishment.
          </p>
        </div>
        
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
