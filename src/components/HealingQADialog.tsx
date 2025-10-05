import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle, Activity, Package, AlertCircle, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TypeWriterMessage from "./TypeWriterMessage";

interface Question {
  id: string;
  question: string;
  category: string;
  icon: string;
  context?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HealingQADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisContext: any;
  userName: string;
  userId?: string;
  healingProgressId?: string;
  initialQuestions: Question[];
}

const HealingQADialog = ({ 
  open, 
  onOpenChange, 
  analysisContext, 
  userName, 
  userId,
  healingProgressId,
  initialQuestions 
}: HealingQADialogProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>(initialQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTyping, setCurrentTyping] = useState(false);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Activity': return Activity;
      case 'Package': return Package;
      case 'AlertCircle': return AlertCircle;
      case 'Heart': return Heart;
      default: return MessageCircle;
    }
  };

  const handleQuestionClick = async (question: Question) => {
    if (isLoading || currentTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: question.question
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage];

      const { data, error } = await supabase.functions.invoke('healing-followup-qa', {
        body: {
          userId,
          userName,
          questionId: question.id,
          questionText: question.question,
          analysisContext,
          conversationHistory,
          healingProgressId
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        toast({
          title: "Error",
          description: data.userMessage || "Failed to get answer. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.result.answer
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentTyping(true);

      // Update available questions with new suggestions
      if (data.result.suggestedFollowUps && data.result.suggestedFollowUps.length > 0) {
        setAvailableQuestions(data.result.suggestedFollowUps);
      }

    } catch (error) {
      console.error('Q&A error:', error);
      toast({
        title: "Error",
        description: "Unable to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Follow-Up Questions
          </DialogTitle>
          <DialogDescription>
            Ask questions about your specific healing analysis
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Conversation History */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a question below to start your follow-up consultation</p>
                </div>
              ) : (
                messages.map((message, idx) => (
                  <div key={idx}>
                    {message.role === 'assistant' && idx === messages.length - 1 ? (
                      <TypeWriterMessage 
                        text={message.content}
                        speed={80}
                        onComplete={() => setCurrentTyping(false)}
                      />
                    ) : (
                      <div className={`flex items-start gap-2 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm ${
                          message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {message.role === 'user' ? userName.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div className={`max-w-[70%] p-3 rounded-lg text-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Matt is thinking...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Available Questions */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">
              {messages.length === 0 ? 'Suggested Questions:' : 'Follow-Up Questions:'}
            </p>
            <div className="grid gap-2">
              {availableQuestions.map((question) => {
                const IconComponent = getIconComponent(question.icon);
                return (
                  <Button
                    key={question.id}
                    variant="outline"
                    className="justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleQuestionClick(question)}
                    disabled={isLoading || currentTyping}
                    title={question.context}
                  >
                    <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-1">{question.question}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealingQADialog;
