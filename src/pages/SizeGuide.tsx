import ContentPage from "@/components/ContentPage";

const SizeGuide = () => {
  return (
    <ContentPage title="Size Guide">
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold mb-6 text-white">Blue Dream Budder Size Guide</h2>
        
        <p className="text-gray-300 mb-8">
          Choose the right size of Blue Dream Budder based on your tattoo coverage needs. Our premium aftercare balm comes in different sizes to match your specific requirements.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-black/60 backdrop-blur-md p-6 rounded-lg border border-cyan-400/30">
            <h3 className="text-xl font-semibold mb-3 text-white">Baby Budder</h3>
            <p className="text-gray-300 font-medium mb-2">Perfect for:</p>
            <ul className="text-gray-400 space-y-1">
              <li>• Small flash type tattoos</li>
              <li>• Touch ups</li>
              <li>• Detail work</li>
            </ul>
          </div>

          <div className="bg-black/60 backdrop-blur-md p-6 rounded-lg border border-green-400/30">
            <h3 className="text-xl font-semibold mb-3 text-white">1oz Container</h3>
            <p className="text-gray-300 font-medium mb-2">Ideal for:</p>
            <ul className="text-gray-400 space-y-1">
              <li>• Quarter sleeve tattoos</li>
              <li>• Medium-sized pieces</li>
              <li>• 2-3 week healing process</li>
            </ul>
          </div>

          <div className="bg-black/60 backdrop-blur-md p-6 rounded-lg border border-purple-400/30">
            <h3 className="text-xl font-semibold mb-3 text-white">2oz Container</h3>
            <p className="text-gray-300 font-medium mb-2">Great for:</p>
            <ul className="text-gray-400 space-y-1">
              <li>• Half sleeve tattoos</li>
              <li>• Larger single pieces</li>
              <li>• Extended healing period</li>
            </ul>
          </div>

          <div className="bg-black/60 backdrop-blur-md p-6 rounded-lg border border-orange-400/30 md:col-span-2 lg:col-span-3">
            <h3 className="text-xl font-semibold mb-3 text-white">8oz Container</h3>
            <p className="text-gray-300 font-medium mb-2">Best value for:</p>
            <ul className="text-gray-400 space-y-1">
              <li>• Multiple tattoos</li>
              <li>• Multiple sitting sessions</li>
              <li>• Full sleeves or large body pieces</li>
              <li>• Tattoo artists and frequent clients</li>
              <li>• Long-term aftercare needs</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-black/60 backdrop-blur-md rounded-lg border border-cyan-400/30">
          <h3 className="text-lg font-semibold mb-3 text-white">Application Tips</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Apply a thin layer 2-3 times daily</li>
            <li>• Clean hands before each application</li>
            <li>• A little goes a long way - don't over-apply</li>
            <li>• Use consistently throughout the healing process</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-white/20">
          <p className="text-sm text-gray-400">
            <strong className="text-white">Note:</strong> Healing times and product usage may vary based on tattoo size, location, and individual healing factors. Always follow your tattoo artist's specific aftercare instructions.
          </p>
        </div>
      </div>
    </ContentPage>
  );
};

export default SizeGuide;