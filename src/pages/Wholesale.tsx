
import ContentPage from "@/components/ContentPage";

const Wholesale = () => {
  return (
    <ContentPage title="Wholesale Program">
      <div className="space-y-8">
        <p className="text-lg text-gray-600">
          Join our wholesale program and offer your clients the premium aftercare they deserve.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">For Tattoo Shops</h2>
            <p className="text-gray-600 mb-4">
              Partner with Blue Dream Budder to provide your clients with superior aftercare products 
              while generating additional revenue for your shop.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Competitive wholesale pricing</li>
              <li>• No minimum order requirements</li>
              <li>• Fast shipping and reliable supply</li>
              <li>• Marketing materials and displays included</li>
              <li>• Dedicated wholesale support team</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Benefits</h2>
            <p className="text-gray-600 mb-4">
              Enhance your client experience while building a profitable retail component 
              to your tattoo business.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Up to 50% wholesale discount</li>
              <li>• Increase client satisfaction and retention</li>
              <li>• Additional revenue stream</li>
              <li>• Premium product your clients will love</li>
              <li>• Professional packaging and branding</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-semibold mb-4">Get Started Today</h3>
          <p className="text-gray-600 mb-6">
            Ready to join our wholesale program? Contact our wholesale team to learn more 
            about pricing, ordering, and how we can support your business.
          </p>
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Email:</strong> <a href="mailto:wholesale@bluedreambudder.com" className="text-blue-600 hover:underline">wholesale@bluedreambudder.com</a>
            </p>
            <p className="text-gray-600">
              <strong>Phone:</strong> <a href="tel:1-800-BUDDER-2" className="text-blue-600 hover:underline">1-800-BUDDER-2</a>
            </p>
          </div>
        </div>
      </div>
    </ContentPage>
  );
};

export default Wholesale;
