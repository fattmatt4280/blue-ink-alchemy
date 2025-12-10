import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare } from 'lucide-react';
import ReviewForm from './ReviewForm';

const ReviewBanner = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-md border border-amber-500/30 rounded-lg p-4 mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Love your Budder?</h3>
            <p className="text-sm text-gray-300">Share your experience and help others discover the magic!</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2">
              <MessageSquare className="w-4 h-4" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-background border-border">
            <ReviewForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ReviewBanner;
