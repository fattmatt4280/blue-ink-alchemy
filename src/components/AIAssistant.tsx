import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { ingredientDatabase, findIngredientByName, getIngredientsByCategory, getAllCategories } from '@/utils/ingredientKnowledge';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

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

const predefinedQuestions = [
  "What ingredients are in Blue Dream Budder?",
  "How do I use this for tattoo aftercare?",
  "What sizes are available and which is best?",
  "What are the benefits of CBD for healing?",
  "How does this help with tattoo inflammation?",
  "Is this all natural and organic?",
  "What makes this different from other aftercare products?",
  "How often should I apply this?"
];

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Blue Dream Budder assistant. I can help you with questions about our CBD-infused tattoo aftercare products. Click a question below or ask me anything!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('display_order');

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Auto-open after 3 seconds
  useEffect(() => {
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasShown]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuestionClick = (question: string) => {
    setShowQuestions(false);
    if (!isExpanded) {
      setIsExpanded(true);
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(question, products);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setShowQuestions(false);
    if (!isExpanded) {
      setIsExpanded(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText, products);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleInputFocus = () => {
    setShowQuestions(false);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const generateAIResponse = (userInput: string, products: Product[]): string => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isExpanded ? 'w-80 sm:w-96' : 'w-72 sm:w-80'
    }`}>
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Blue Dream Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className={`overflow-y-auto p-4 space-y-4 transition-all duration-300 ${
            isExpanded ? 'h-80' : 'h-48'
          }`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                  message.isUser ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[70%] p-3 rounded-lg text-sm ${
                    message.isUser
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {/* Predefined Questions */}
            {showQuestions && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Popular questions:</p>
                <div className="grid grid-cols-1 gap-2">
                  {predefinedQuestions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuestionClick(question)}
                      className="text-left justify-start h-auto p-2 text-xs hover:bg-blue-50"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                placeholder="Ask me anything about Blue Dream Budder..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
