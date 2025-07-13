
import React from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  return (
    <>
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
    </>
  );
};

export default ChatMessages;
