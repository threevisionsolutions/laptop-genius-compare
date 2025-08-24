
import React from 'react';
import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-purple-600" />
        </div>
      )}
      
      <Card className={`max-w-[80%] p-4 ${isUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </Card>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
