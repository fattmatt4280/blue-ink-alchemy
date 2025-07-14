import ContentPage from "@/components/ContentPage";

const SizeGuide = () => {
  return (
    <ContentPage title="Size Guide">
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Baby Budder Size Guide</h2>
        
        <p className="text-gray-700 mb-8">
          Choose the right size of Baby Budder based on your tattoo coverage needs. Our premium aftercare balm comes in different sizes to match your specific requirements.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Baby Budder</h3>
            <p className="text-gray-700 font-medium mb-2">Perfect for:</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Small flash type tattoos</li>
              <li>• Touch ups</li>
              <li>• Detail work</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">1oz Container</h3>
            <p className="text-gray-700 font-medium mb-2">Ideal for:</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Quarter sleeve tattoos</li>
              <li>• Medium-sized pieces</li>
              <li>• 2-3 week healing process</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-100">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">2oz Container</h3>
            <p className="text-gray-700 font-medium mb-2">Great for:</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Half sleeve tattoos</li>
              <li>• Larger single pieces</li>
              <li>• Extended healing period</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-100 md:col-span-2 lg:col-span-3">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">8oz Container</h3>
            <p className="text-gray-700 font-medium mb-2">Best value for:</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Multiple tattoos</li>
              <li>• Multiple sitting sessions</li>
              <li>• Full sleeves or large body pieces</li>
              <li>• Tattoo artists and frequent clients</li>
              <li>• Long-term aftercare needs</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Application Tips</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Apply a thin layer 2-3 times daily</li>
            <li>• Clean hands before each application</li>
            <li>• A little goes a long way - don't over-apply</li>
            <li>• Use consistently throughout the healing process</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Healing times and product usage may vary based on tattoo size, location, and individual healing factors. Always follow your tattoo artist's specific aftercare instructions.
          </p>
        </div>
      </div>
    </ContentPage>
  );
};

export default SizeGuide;