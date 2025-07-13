
import { findIngredientByName, getIngredientsByCategory } from './ingredientKnowledge';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  size?: string;
  popular?: boolean;
  most_popular?: boolean;
}

export const generateAIResponse = (userInput: string, products: Product[]): string => {
  const input = userInput.toLowerCase();
  
  // Ingredient-specific questions
  if (input.includes('ingredient') || input.includes('what\'s in') || input.includes('formula') || input.includes('contains')) {
    if (input.includes('shea butter') || input.includes('shea')) {
      const ingredient = findIngredientByName('Shea Butter');
      return `Shea Butter is one of our key base ingredients! ${ingredient?.healingProperties} For tattoo care: ${ingredient?.tattooSpecific} Key benefits include: ${ingredient?.benefits.join(', ')}.`;
    }
    
    if (input.includes('cbd') || input.includes('cannabidiol')) {
      const ingredient = findIngredientByName('CBD');
      return `CBD (Cannabidiol) is our star active ingredient! ${ingredient?.healingProperties} For tattoo healing: ${ingredient?.tattooSpecific} Benefits include: ${ingredient?.benefits.join(', ')}. It's completely non-psychoactive and legal.`;
    }
    
    if (input.includes('lavender')) {
      const ingredient = findIngredientByName('Lavender');
      return `Lavender Essential Oil is included for its amazing healing properties! ${ingredient?.healingProperties} For tattoos: ${ingredient?.tattooSpecific} Benefits: ${ingredient?.benefits.join(', ')}.`;
    }
    
    if (input.includes('tea tree')) {
      const ingredient = findIngredientByName('Tea Tree');
      return `Tea Tree Essential Oil is our natural antimicrobial protector! ${ingredient?.healingProperties} For tattoo care: ${ingredient?.tattooSpecific} Benefits: ${ingredient?.benefits.join(', ')}.`;
    }
    
    if (input.includes('jojoba')) {
      const ingredient = findIngredientByName('Jojoba');
      return `Jojoba Oil is perfect for tattoo care! ${ingredient?.healingProperties} For tattoos: ${ingredient?.tattooSpecific} Benefits: ${ingredient?.benefits.join(', ')}.`;
    }
    
    if (input.includes('all ingredients') || input.includes('full ingredient') || input.includes('complete formula')) {
      return `Our Blue Dream Budder contains a carefully crafted blend of premium ingredients:

🧈 **Base Butters**: Shea Butter, Avocado Butter, Mango Butter, Coconut Oil - for deep moisturization and protection

🌿 **Carrier Oils**: Jojoba, Apricot Kernel, Hemp Seed - for gentle absorption and nourishment  

🌸 **Essential Oils**: Lavender (soothing), Helichrysum (regenerative), Tea Tree (antimicrobial), Sweet Orange (uplifting), Pomegranate (antioxidant), Rosehip Seed (healing)

🌺 **Fragrant Oil**: Brazilian Grapefruit Mango - for aromatherapy

💎 **Active Compounds**: CBD for anti-inflammatory benefits, Terpenes for enhanced absorption

Each ingredient is specifically chosen for its healing properties and synergistic effects in tattoo aftercare!`;
    }
    
    return `Our formula contains premium natural ingredients including CBD, healing butters (Shea, Avocado, Mango), nourishing oils (Jojoba, Hemp Seed, Apricot), and therapeutic essential oils (Lavender, Helichrysum, Tea Tree). Each ingredient supports the tattoo healing process naturally. What specific ingredient would you like to know more about?`;
  }
  
  // Benefits and healing questions
  if (input.includes('benefit') || input.includes('healing') || input.includes('help') || input.includes('good for')) {
    if (input.includes('anti-inflammatory') || input.includes('inflammation')) {
      return `Several of our ingredients provide powerful anti-inflammatory benefits: CBD (our main anti-inflammatory compound), Hemp Seed Oil (omega fatty acids), Shea Butter (cinnamic acid esters), Lavender Essential Oil, and Helichrysum. Together they significantly reduce tattoo swelling, redness, and discomfort during healing.`;
    }
    
    if (input.includes('infection') || input.includes('bacteria') || input.includes('antimicrobial')) {
      return `We have multiple natural antimicrobial ingredients: Tea Tree Essential Oil (broad-spectrum antimicrobial), Coconut Oil (lauric acid), and Lavender Oil (natural antiseptic). These work together to prevent infections in fresh tattoos without harsh chemicals.`;
    }
    
    if (input.includes('scar') || input.includes('scarring')) {
      return `For scar prevention, we include Helichrysum Essential Oil (known as 'immortelle' for regeneration), Rosehip Seed Oil (promotes even healing), and Pomegranate Seed Oil (antioxidant protection). These help ensure your tattoo heals with clean, sharp lines.`;
    }
    
    return `Our formula provides comprehensive healing benefits: anti-inflammatory (CBD, Hemp Seed Oil), antimicrobial protection (Tea Tree, Coconut Oil), deep moisturization (Shea, Avocado, Mango butters), pain relief (CBD, Lavender), and scar prevention (Helichrysum, Rosehip). Each ingredient supports optimal tattoo healing!`;
  }
  
  // Category-based questions
  if (input.includes('essential oil') || input.includes('aromatherapy')) {
    const essentialOils = getIngredientsByCategory('Essential Oil');
    return `We use ${essentialOils.length} therapeutic essential oils: ${essentialOils.map(oil => oil.name).join(', ')}. Each provides specific healing benefits - Lavender for soothing, Helichrysum for regeneration, Tea Tree for protection, Orange for mood, Pomegranate for antioxidants, and Rosehip for healing. Plus Brazilian Grapefruit Mango for delightful aromatherapy!`;
  }
  
  if (input.includes('butter') || input.includes('moisturizer')) {
    const butters = getIngredientsByCategory('Base Butter').concat(getIngredientsByCategory('Base Oil'));
    return `Our moisturizing base includes premium butters and oils: ${butters.map(butter => butter.name).join(', ')}. These provide deep, long-lasting hydration while supporting your skin's natural barrier function during tattoo healing.`;
  }
  
  // Product-specific questions
  if (input.includes('sizes') || input.includes('size options')) {
    const sizes = products.map(p => `${p.name} (${p.size})`).join(', ');
    return `We offer several sizes to meet your needs: ${sizes}. Each contains our full-spectrum healing formula with 18+ premium ingredients including CBD, therapeutic essential oils, and nourishing butters.`;
  }
  
  if (input.includes('most popular') || input.includes('bestseller') || input.includes('recommend')) {
    const mostPopular = products.find(p => p.most_popular);
    const popular = products.filter(p => p.popular && !p.most_popular);
    
    if (mostPopular) {
      return `Our most popular product is the ${mostPopular.name} at $${mostPopular.price}${mostPopular.size ? ` (${mostPopular.size})` : ''}. ${mostPopular.description || 'It\'s perfect for professional use and offers great value.'} ${popular.length > 0 ? `We also have other popular options like ${popular.map(p => p.name).join(' and ')}.` : ''}`;
    }
    return "Our Blue Dream Budder 8oz is our most popular size, perfect for professional artists and frequent use.";
  }
  
  if (input.includes('price') || input.includes('cost') || input.includes('how much')) {
    const priceList = products.map(p => {
      const priceText = p.original_price && p.original_price > p.price 
        ? `$${p.price} (normally $${p.original_price})` 
        : `$${p.price}`;
      return `${p.name}: ${priceText}`;
    }).join(', ');
    
    return `Here are our current prices: ${priceList}. All products contain the same high-quality CBD formula, just in different sizes to meet your needs.`;
  }
  
  if (input.includes('difference') || input.includes('compare')) {
    return `All our Blue Dream Budder products contain the same premium CBD formula with natural healing ingredients. The main differences are the sizes: ${products.map(p => `${p.name} (${p.size})`).join(', ')}. Choose based on how often you'll use it - smaller sizes for occasional touch-ups, larger sizes for new tattoos or professional use.`;
  }
  
  if (input.includes('tattoo') || input.includes('aftercare')) {
    return "Our Blue Dream Budder contains 18+ premium ingredients specifically chosen for tattoo healing! Key components include CBD for anti-inflammatory benefits, Shea and Avocado butters for deep moisturization, Tea Tree and Lavender oils for protection and soothing, plus Hemp Seed Oil rich in omega fatty acids. Apply thin layers 2-3 times daily for optimal healing.";
  }
  
  if (input.includes('natural') || input.includes('organic')) {
    return "Yes! All our ingredients are natural and carefully sourced: premium butters (Shea, Avocado, Mango), nourishing oils (Jojoba, Hemp Seed, Apricot), therapeutic essential oils (Lavender, Helichrysum, Tea Tree), plus CBD and natural terpenes. No harsh chemicals, just nature's best healing compounds.";
  }
  
  if (input.includes('cbd') || input.includes('ingredients')) {
    return "Our formula contains high-quality CBD isolate, organic mango butter, shea butter, avocado oil, coconut oil, and Blue Dream terpenes for aromatherapy. All ingredients are natural and skin-safe, perfect for sensitive post-tattoo skin. The CBD provides anti-inflammatory benefits while the natural butters deeply moisturize.";
  }
  
  if (input.includes('how to use') || input.includes('application')) {
    return "Clean your tattoo gently with mild soap, pat dry, then apply a thin layer of Blue Dream Budder. The Jojoba oil ensures quick absorption while Shea and Avocado butters provide lasting moisture. Use 2-3 times daily. The CBD and essential oils work continuously to reduce inflammation and promote healing.";
  }
  
  if (input.includes('shipping') || input.includes('delivery')) {
    return "We offer fast and reliable shipping options. Most orders are processed within 1-2 business days. You'll receive tracking information once your order ships. Free shipping is available on qualifying orders!";
  }
  
  if (input.includes('professional') || input.includes('artist')) {
    const professionalSize = products.find(p => p.name.includes('8oz'));
    return `Many professional tattoo artists recommend our products! ${professionalSize ? `Our ${professionalSize.name} at $${professionalSize.price} is specifically designed for professional use and high-volume applications.` : 'Our larger sizes are perfect for professional studios.'} The natural ingredients and CBD formula help ensure optimal healing for your clients.`;
  }
  
  if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
    return "Hello! I'm here to help you learn more about Blue Dream Budder and how it can help with your tattoo aftercare needs. We have several sizes available, each with the same premium CBD formula. What would you like to know?";
  }
  
  return `That's a great question! Our Blue Dream Budder line offers premium CBD-infused tattoo aftercare in multiple sizes: ${products.map(p => p.name).join(', ')}. Each contains the same healing formula with natural ingredients. Feel free to ask me about specific sizes, ingredients, pricing, or usage instructions!`;
};
