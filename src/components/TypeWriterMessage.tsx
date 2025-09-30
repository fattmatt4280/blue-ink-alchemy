import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface TypeWriterMessageProps {
  text: string;
  speed?: number; // characters per second
  onComplete?: () => void;
  isUser?: boolean;
}

const TypeWriterMessage: React.FC<TypeWriterMessageProps> = ({ 
  text, 
  speed = 60, 
  onComplete,
  isUser = false 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 1000 / speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  const handleClick = () => {
    if (!isComplete) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <div
      className={`flex items-start gap-2 cursor-pointer ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
      onClick={handleClick}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
        isUser ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isUser ? <Bot className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[70%] p-3 rounded-lg text-sm ${
          isUser
            ? 'bg-blue-600 text-white ml-auto'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {displayedText}
        {!isComplete && (
          <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default TypeWriterMessage;