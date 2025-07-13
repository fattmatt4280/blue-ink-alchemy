
import React from 'react';
import { Button } from "@/components/ui/button";

interface PredefinedQuestionsProps {
  onQuestionClick: (question: string) => void;
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

const PredefinedQuestions: React.FC<PredefinedQuestionsProps> = ({ onQuestionClick }) => {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 font-medium">Popular questions:</p>
      <div className="grid grid-cols-1 gap-2">
        {predefinedQuestions.slice(0, 4).map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            className="text-left justify-start h-auto p-2 text-xs hover:bg-blue-50"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PredefinedQuestions;
