export interface IngredientInfo {
  name: string;
  category: string;
  benefits: string[];
  healingProperties: string;
  tattooSpecific: string;
}

export const ingredientDatabase: IngredientInfo[] = [
  // Base Butters
  {
    name: "Shea Butter",
    category: "Base Butter",
    benefits: ["Deep moisturization", "Anti-inflammatory", "Skin barrier protection", "Wound healing"],
    healingProperties: "Rich in vitamins A, E, and F. Contains cinnamic acid esters that provide natural anti-inflammatory properties.",
    tattooSpecific: "Forms a protective barrier over fresh tattoos while allowing skin to breathe. Reduces scabbing and peeling."
  },
  {
    name: "Avocado Butter",
    category: "Base Butter",
    benefits: ["Intense hydration", "Skin regeneration", "Antioxidant protection", "Collagen support"],
    healingProperties: "High in oleic acid, vitamins A, D, and E. Penetrates deeply to nourish skin cells.",
    tattooSpecific: "Promotes faster healing by supporting cellular regeneration and maintaining optimal moisture levels."
  },
  {
    name: "Mango Butter",
    category: "Base Butter",
    benefits: ["Non-comedogenic moisturizing", "Skin softening", "UV protection", "Anti-aging"],
    healingProperties: "Contains stearic and oleic acids. Natural emollient that doesn't clog pores.",
    tattooSpecific: "Keeps tattoo ink vibrant by maintaining skin elasticity and preventing excessive dryness."
  },
  {
    name: "Coconut Oil",
    category: "Base Oil",
    benefits: ["Antimicrobial protection", "Deep moisturizing", "Anti-inflammatory", "Skin barrier repair"],
    healingProperties: "High in lauric acid with natural antibacterial and antifungal properties.",
    tattooSpecific: "Prevents infection in fresh tattoos while providing gentle, non-irritating moisture."
  },

  // Carrier Oils
  {
    name: "Jojoba Oil",
    category: "Carrier Oil",
    benefits: ["Mimics natural sebum", "Non-comedogenic", "Long-lasting moisture", "Anti-bacterial"],
    healingProperties: "Technically a wax ester, closely matches skin's natural oils. Rich in vitamin E.",
    tattooSpecific: "Absorbs quickly without leaving residue. Ideal for daily tattoo maintenance without clogging pores."
  },
  {
    name: "Apricot Kernel Oil",
    category: "Carrier Oil",
    benefits: ["Gentle moisturizing", "Vitamin A & E rich", "Skin regeneration", "Anti-inflammatory"],
    healingProperties: "High in oleic and linoleic acids. Contains natural retinoids for skin renewal.",
    tattooSpecific: "Perfect for sensitive skin around new tattoos. Promotes healing without irritation."
  },
  {
    name: "Hemp Seed Oil",
    category: "Carrier Oil",
    benefits: ["Omega fatty acids", "Anti-inflammatory", "Skin barrier support", "Non-psychoactive"],
    healingProperties: "Perfect 3:1 ratio of omega-6 to omega-3 fatty acids. Rich in gamma-linolenic acid.",
    tattooSpecific: "Reduces inflammation and redness in healing tattoos. Supports skin's natural repair process."
  },

  // Essential Oils
  {
    name: "Lavender Essential Oil",
    category: "Essential Oil",
    benefits: ["Calming & soothing", "Antimicrobial", "Pain relief", "Wound healing"],
    healingProperties: "Contains linalool and linalyl acetate. Natural antiseptic and analgesic properties.",
    tattooSpecific: "Reduces tattoo pain and discomfort. Promotes faster healing while preventing infection."
  },
  {
    name: "Helichrysum Essential Oil",
    category: "Essential Oil",
    benefits: ["Powerful regenerative", "Anti-inflammatory", "Scar reduction", "Wound healing"],
    healingProperties: "Contains rare compounds like italidione. Known as 'immortelle' for its regenerative properties.",
    tattooSpecific: "Prevents scarring and promotes clean healing lines. Maintains tattoo clarity and definition."
  },
  {
    name: "Tea Tree Essential Oil",
    category: "Essential Oil",
    benefits: ["Strong antimicrobial", "Anti-inflammatory", "Purifying", "Infection prevention"],
    healingProperties: "High in terpinen-4-ol. Broad-spectrum antimicrobial without antibiotic resistance.",
    tattooSpecific: "Prevents bacterial infections in fresh tattoos. Used in very small amounts due to potency."
  },
  {
    name: "Sweet Orange Essential Oil",
    category: "Essential Oil",
    benefits: ["Uplifting aromatherapy", "Vitamin C boost", "Circulation support", "Mood enhancement"],
    healingProperties: "High in limonene. Natural antioxidant and mood booster.",
    tattooSpecific: "Provides aromatherapy benefits during the healing process. Supports overall well-being."
  },
  {
    name: "Pomegranate Seed Oil",
    category: "Essential Oil",
    benefits: ["Antioxidant powerhouse", "Anti-aging", "Skin regeneration", "UV protection"],
    healingProperties: "Rich in punicic acid and ellagic acid. Exceptional antioxidant capacity.",
    tattooSpecific: "Protects tattoo colors from fading. Supports long-term tattoo vibrancy and skin health."
  },
  {
    name: "Rosehip Seed Oil",
    category: "Essential Oil",
    benefits: ["Scar healing", "Skin regeneration", "Vitamin C & A rich", "Anti-aging"],
    healingProperties: "High in essential fatty acids and natural retinoids. Promotes cellular turnover.",
    tattooSpecific: "Minimizes scarring and promotes even healing. Helps maintain tattoo sharpness over time."
  },

  // Fragrant Essential Oils
  {
    name: "Brazilian Grapefruit Mango",
    category: "Fragrant Essential Oil",
    benefits: ["Uplifting scent", "Aromatherapy", "Mood enhancement", "Energizing"],
    healingProperties: "Natural citrus and tropical fruit essences. Mood-boosting aromatherapy properties.",
    tattooSpecific: "Makes the healing process more pleasant with tropical aromatherapy. Reduces stress during recovery."
  }
];

export const getIngredientsByCategory = (category: string): IngredientInfo[] => {
  return ingredientDatabase.filter(ingredient => ingredient.category === category);
};

export const findIngredientByName = (name: string): IngredientInfo | undefined => {
  return ingredientDatabase.find(ingredient => 
    ingredient.name.toLowerCase().includes(name.toLowerCase())
  );
};

export const getAllCategories = (): string[] => {
  return [...new Set(ingredientDatabase.map(ingredient => ingredient.category))];
};