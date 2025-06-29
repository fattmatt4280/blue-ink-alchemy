
const ingredients = [
  {
    name: "CBD Isolate",
    benefit: "Anti-inflammatory & pain relief",
    description: "Pure CBD for optimal healing and comfort"
  },
  {
    name: "Blue Dream Terpenes",
    benefit: "Aromatherapy & relaxation",
    description: "Signature blend for soothing experience"
  },
  {
    name: "Mango Butter",
    benefit: "Deep moisturization",
    description: "Rich vitamins A, C, and E for skin regeneration"
  },
  {
    name: "Avocado Oil",
    benefit: "Penetrating hydration",
    description: "Omega-rich oil that absorbs quickly"
  },
  {
    name: "Shea Butter",
    benefit: "Protective barrier",
    description: "Natural healing with anti-inflammatory properties"
  },
  {
    name: "Coconut Oil",
    benefit: "Antimicrobial protection",
    description: "Natural antibacterial and antifungal properties"
  }
];

const Ingredients = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Pure, Natural Ingredients
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every jar is crafted with carefully selected, premium ingredients that work 
            synergistically to provide superior healing and nourishment for your skin.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-700 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {ingredient.name}
                </h3>
                
                <p className="text-blue-600 font-medium mb-3">
                  {ingredient.benefit}
                </p>
                
                <p className="text-gray-600 leading-relaxed">
                  {ingredient.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium">All Natural • CBD Infused • Cruelty Free</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ingredients;
