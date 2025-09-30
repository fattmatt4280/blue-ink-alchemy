
import React from 'react';
import { Bot, User } from 'lucide-react';
import TypeWriterMessage from './TypeWriterMessage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  onGreetingComplete?: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, onGreetingComplete }) => {
  return (
    <>
      {messages.map((message, index) => {
        // Use typewriter for the first message (greeting) if it has isTyping: true
        if (message.isTyping && index === 0) {
          return (
            <TypeWriterMessage
              key={message.id}
              text={message.text}
              speed={60}
              isUser={message.isUser}
              onComplete={onGreetingComplete}
            />
          );
        }

        // Regular message display for all other messages
        return (
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
        );
      })}
    </>
  );
};

export default ChatMessages;
