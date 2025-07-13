import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

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

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Blue Dream Budder assistant. I can help you with questions about our CBD-infused tattoo aftercare products. How can I help you today?",
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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Expand the dialog when user starts typing
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

    // Simulate AI response
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
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const generateAIResponse = (userInput: string, products: Product[]): string => {
    const input = userInput.toLowerCase();
    
    // Product-specific questions
    if (input.includes('sizes') || input.includes('size options')) {
      const sizes = products.map(p => `${p.name} (${p.size})`).join(', ');
      return `We offer several sizes to meet your needs: ${sizes}. Each size is designed for different usage levels - from touch-ups to professional artist needs.`;
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
    
    // Existing responses with enhanced product knowledge
    if (input.includes('tattoo') || input.includes('aftercare')) {
      return "Our Blue Dream Budder is specifically formulated for tattoo aftercare! It contains premium CBD and all-natural ingredients that help reduce inflammation, promote healing, and keep your tattoo vibrant. Apply a thin layer 2-3 times daily on clean, dry skin. We offer multiple sizes to suit your needs.";
    }
    
    if (input.includes('cbd') || input.includes('ingredients')) {
      return "Our formula contains high-quality CBD isolate, organic mango butter, shea butter, avocado oil, coconut oil, and Blue Dream terpenes for aromatherapy. All ingredients are natural and skin-safe, perfect for sensitive post-tattoo skin. The CBD provides anti-inflammatory benefits while the natural butters deeply moisturize.";
    }
    
    if (input.includes('how to use') || input.includes('application')) {
      return "Clean your tattoo gently with mild soap, pat dry, then apply a thin layer of Blue Dream Budder. Massage gently until absorbed. Use 2-3 times daily or as needed during the healing process. A little goes a long way! Start with our smaller sizes if you're trying it for the first time.";
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
