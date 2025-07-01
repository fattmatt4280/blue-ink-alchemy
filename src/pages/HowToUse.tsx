
import ContentPage from "@/components/ContentPage";

const HowToUse = () => {
  return (
    <ContentPage title="How to Use Blue Dream Budder">
      <div className="space-y-8">
        <p className="text-lg text-gray-600">
          Follow these simple steps to get the most out of your Blue Dream Budder and ensure optimal healing.
        </p>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6">
            <h2 className="text-2xl font-semibold mb-3">Step 1: Clean Hands</h2>
            <p className="text-gray-600">
              Always wash your hands thoroughly with antibacterial soap before applying any aftercare product 
              to prevent infection and contamination.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-6">
            <h2 className="text-2xl font-semibold mb-3">Step 2: Apply Thin Layer</h2>
            <p className="text-gray-600">
              Take a small amount (about the size of a grain of rice) and gently massage it into your skin. 
              A little goes a long way - over-application can clog pores and slow healing.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-6">
            <h2 className="text-2xl font-semibold mb-3">Step 3: Frequency</h2>
            <p className="text-gray-600">
              For fresh tattoos: Apply 2-3 times daily for the first week, then as needed. 
              For general skincare: Apply once daily or as needed for moisturization.
            </p>
          </div>
          
          <div className="border-l-4 border-blue-500 pl-6">
            <h2 className="text-2xl font-semibold mb-3">Step 4: Storage</h2>
            <p className="text-gray-600">
              Store in a cool, dry place away from direct sunlight. The natural ingredients may solidify 
              in cold temperatures - simply warm between your hands before use.
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Pro Tips</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Less is more - start with a tiny amount</li>
            <li>• Don't apply over scabs or peeling skin</li>
            <li>• If irritation occurs, discontinue use</li>
            <li>• Perfect for daily moisturizing even without fresh ink</li>
          </ul>
        </div>
      </div>
    </ContentPage>
  );
};

export default HowToUse;
