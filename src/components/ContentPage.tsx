
import AppHeader from "@/components/AppHeader";

interface ContentPageProps {
  title: string;
  children: React.ReactNode;
}

const ContentPage = ({ title, children }: ContentPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AppHeader />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-light text-gray-900 mb-4">{title}</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            {children}
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1">
                © 2025 Dream Tattoo Company LLC. All rights reserved.
              </p>
              <p className="text-xs text-gray-400">
                Blue Dream Budder™ and Heal-AId™ are trademarks of Dream Tattoo Company LLC.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPage;
