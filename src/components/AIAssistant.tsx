
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { generateAIResponse } from '@/utils/aiResponseGenerator';
import PredefinedQuestions from './PredefinedQuestions';
import ChatMessages from './ChatMessages';
import TypingIndicator from './TypingIndicator';

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
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 neon-breathing-chat"
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
              <MessageCircle className="w-5 h-5" />
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
            <ChatMessages messages={messages} />
            
            {showQuestions && (
              <PredefinedQuestions onQuestionClick={handleQuestionClick} />
            )}
            
            {isTyping && <TypingIndicator />}
            
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
