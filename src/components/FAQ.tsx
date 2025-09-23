
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I use Blue Dream Budder on a new tattoo?",
    answer: "Apply a thin layer to clean, dry skin 2-3 times daily. Gently massage until absorbed. Use for 2-4 weeks or until fully healed. Always wash hands before application."
  },
  {
    question: "Is Blue Dream Budder safe for sensitive skin?",
    answer: "Yes! Our formula is made with all-natural ingredients and is gentle enough for sensitive skin. However, we recommend doing a patch test before first use, especially if you have known allergies."
  },
  {
    question: "What makes Blue Dream Budder different from other aftercare products?",
    answer: "Our unique blend combines natural healing ingredients with premium natural butters and botanical oils. This creates a synergistic effect that reduces inflammation, provides comfort, and promotes faster healing naturally."
  },
  {
    question: "How long does shipping take?",
    answer: "We offer free shipping on orders over $50. Standard shipping takes 3-5 business days, and expedited shipping (1-2 business days) is available for an additional cost."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your purchase, contact us for a full refund or exchange. Product must be in original condition."
  },
  {
    question: "Can I use this product on old tattoos?",
    answer: "Absolutely! Blue Dream Budder is excellent for maintaining and revitalizing older tattoos. The natural moisturizers help keep colors vibrant and skin healthy."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Blue Dream Budder and how to get 
            the best results for your tattoo aftercare.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full bg-white rounded-xl p-6 text-left hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 mt-4' : 'max-h-0'
                }`}>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
