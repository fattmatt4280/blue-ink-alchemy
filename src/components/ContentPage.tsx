
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentPageProps {
  title: string;
  children: React.ReactNode;
}

const ContentPage = ({ title, children }: ContentPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-4xl font-light text-gray-900 mb-4">{title}</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
