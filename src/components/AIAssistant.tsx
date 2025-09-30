
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
import WelcomeConciergePopup from './WelcomeConciergePopup';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [welcomePopupShown, setWelcomePopupShown] = useState(() => {
    // Check if welcome popup has been shown in this browser session
    return sessionStorage.getItem('welcome-popup-shown') === 'true';
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Blue Dream Budder assistant. I can help you with questions about our all-natural tattoo aftercare products. Click a question below or ask me anything! When you're done, I'll be living down in the tab below.",
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    }
  ]);
  const [greetingTyped, setGreetingTyped] = useState(false);
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

  // Show welcome popup and then auto-open chat
  useEffect(() => {
    if (!hasShown && !welcomePopupShown) {
      // Show welcome popup first
      const welcomeTimer = setTimeout(() => {
        setShowWelcomePopup(true);
        sessionStorage.setItem('welcome-popup-shown', 'true');
        setWelcomePopupShown(true);
        
        // Auto-close welcome popup after 4 seconds
        const closeTimer = setTimeout(() => {
          setShowWelcomePopup(false);
        }, 4000);

        return () => clearTimeout(closeTimer);
      }, 2000);

      // Auto-open chat after welcome popup sequence
      const chatTimer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, 8000); // 2s delay + 4s popup display + 2s buffer

      return () => {
        clearTimeout(welcomeTimer);
        clearTimeout(chatTimer);
      };
    } else if (!hasShown && welcomePopupShown) {
      // If welcome popup was already shown, just auto-open chat
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasShown, welcomePopupShown]);

  // Auto-close chat after 30 seconds when opened
  useEffect(() => {
    if (isOpen) {
      const autoCloseTimer = setTimeout(() => {
        setIsOpen(false);
      }, 30000); // 30 seconds

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isOpen]);

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

  const handleWelcomePopupClose = () => {
    setShowWelcomePopup(false);
  };

  if (!isOpen) {
    return (
      <>
        <WelcomeConciergePopup 
          isVisible={showWelcomePopup}
          onClose={handleWelcomePopupClose}
        />
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 neon-breathing-chat"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isExpanded ? 'w-80 sm:w-96' : 'w-72 sm:w-80'
    }`}>
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardHeader className="cyber-chat-header rounded-t-lg">
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
            isExpanded ? 'h-96' : 'h-64'
          }`}>
            <ChatMessages 
              messages={messages} 
              onGreetingComplete={() => {
                setGreetingTyped(true);
                // Update the greeting message to remove typing flag
                setMessages(prev => prev.map((msg, idx) => 
                  idx === 0 ? { ...msg, isTyping: false } : msg
                ));
              }}
            />
            
            {showQuestions && greetingTyped && (
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
