
import ContentPage from "@/components/ContentPage";

const Shop = () => {
  return (
    <ContentPage title="Shop All Products">
      <div className="space-y-6">
        <p className="text-lg text-gray-600">
          Discover our complete range of premium CBD-infused aftercare products.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
            <p className="text-gray-600 mb-4">
              Our signature Blue Dream Budder is crafted with the finest natural ingredients 
              and premium CBD isolate for superior healing and comfort.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Premium CBD isolate for anti-inflammatory benefits</li>
              <li>• Blue Dream terpenes for aromatherapy</li>
              <li>• All-natural moisturizing ingredients</li>
              <li>• Perfect for tattoo aftercare and daily skincare</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 mb-4">
              We're committed to providing the highest quality aftercare products 
              that promote healing and maintain the vibrancy of your artwork.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• Lab-tested for purity and potency</li>
              <li>• Made with organic, sustainably sourced ingredients</li>
              <li>• Recommended by professional tattoo artists</li>
              <li>• Fast, discreet shipping</li>
            </ul>
          </div>
        </div>
      </div>
    </ContentPage>
  );
};

export default Shop;
