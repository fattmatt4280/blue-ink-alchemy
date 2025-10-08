import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import TrackingComponent from "@/components/TrackingComponent";
import AnimatedBackground from "@/components/AnimatedBackground";

const Tracking = () => {
  return (
    <div className="min-h-screen futuristic-bg py-20">
      <AnimatedBackground />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Track Your Order</h1>
          </div>

          <TrackingComponent />
        </div>
      </div>
    </div>
  );
};

export default Tracking;