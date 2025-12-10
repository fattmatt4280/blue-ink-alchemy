import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare, Sparkles } from 'lucide-react';
import ReviewForm from './ReviewForm';

const ReviewSubmissionSection = () => {
  const [open, setOpen] = useState(false);

  const benefits = [
    "Help others discover effective aftercare",
    "Share your healing journey with the community",
    "Your feedback shapes our products",
    "Join thousands of satisfied customers"
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-amber-500/30 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <span className="text-amber-400 font-semibold uppercase tracking-wider text-sm">
                  Community Stories
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Share Your Healing Journey
              </h2>
              
              <p className="text-gray-300 text-lg">
                Your experience matters! Help fellow tattoo enthusiasts make informed decisions 
                by sharing your Blue Dream Budder story.
              </p>

              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-200">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side - CTA */}
            <div className="flex flex-col items-center text-center space-y-6 bg-black/30 rounded-xl p-8 border border-white/10">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-8 h-8 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <h3 className="text-2xl font-bold text-white">
                Rate Your Experience
              </h3>
              
              <p className="text-gray-400">
                Takes less than 2 minutes. Your review will be published after approval.
              </p>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-lg px-8 py-6 gap-2 shadow-lg shadow-amber-500/25"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-background border-border">
                  <ReviewForm onClose={() => setOpen(false)} />
                </DialogContent>
              </Dialog>

              <p className="text-xs text-gray-500">
                Reviews are moderated to ensure quality
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSubmissionSection;
