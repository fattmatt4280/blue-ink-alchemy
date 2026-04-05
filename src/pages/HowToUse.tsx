
import { Helmet } from "react-helmet-async";
import ContentPage from "@/components/ContentPage";

const HowToUse = () => {
  return (
    <>
    <Helmet>
      <title>How to Use Blue Dream Budder | Tattoo Aftercare Instructions</title>
      <meta name="description" content="Step-by-step instructions for applying Blue Dream Budder tattoo aftercare. Learn how much to use, how often to apply, and pro tips for optimal healing." />
      <link rel="canonical" href="https://bluedreambudder.com/how-to-use" />
      <meta property="og:title" content="How to Use Blue Dream Budder | Tattoo Aftercare Instructions" />
      <meta property="og:description" content="Apply a thin layer 2-3 times daily for optimal tattoo healing. Full step-by-step guide inside." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://bluedreambudder.com/how-to-use" />
      <meta property="og:image" content="https://bluedreambudder.com/images/invoice-logo-bw.jpeg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="How to Use Blue Dream Budder | Tattoo Aftercare Instructions" />
      <meta name="twitter:description" content="Apply a thin layer 2-3 times daily for optimal tattoo healing. Full step-by-step guide inside." />
      <meta name="twitter:image" content="https://bluedreambudder.com/images/invoice-logo-bw.jpeg" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Use Blue Dream Budder for Tattoo Aftercare",
          "description": "Step-by-step guide for applying Blue Dream Budder to a new or healing tattoo for optimal results.",
          "totalTime": "PT5M",
          "supply": [
            { "@type": "HowToSupply", "name": "Blue Dream Budder tattoo aftercare balm" },
            { "@type": "HowToSupply", "name": "Antibacterial soap" },
            { "@type": "HowToSupply", "name": "Clean towel or paper towel" }
          ],
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Clean Your Hands",
              "text": "Wash your hands thoroughly with antibacterial soap before applying any aftercare product. This prevents infection and contamination of the healing tattoo.",
              "url": "https://bluedreambudder.com/how-to-use#step1"
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Apply a Thin Layer",
              "text": "Take a small amount (about the size of a grain of rice) and gently massage it into your skin. A little goes a long way — over-application can clog pores and slow healing.",
              "url": "https://bluedreambudder.com/how-to-use#step2"
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Apply at the Right Frequency",
              "text": "For fresh tattoos: apply 2-3 times daily for the first week, then as needed. For general skincare: apply once daily or as needed for moisturization.",
              "url": "https://bluedreambudder.com/how-to-use#step3"
            },
            {
              "@type": "HowToStep",
              "position": 4,
              "name": "Store Properly",
              "text": "Store Blue Dream Budder in a cool, dry place away from direct sunlight. The natural ingredients may solidify in cold temperatures — simply warm between your hands before use.",
              "url": "https://bluedreambudder.com/how-to-use#step4"
            }
          ]
        })}
      </script>
    </Helmet>
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
    </>
  );
};

export default HowToUse;
