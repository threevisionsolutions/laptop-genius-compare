
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ApiKeyInput from './ApiKeyInput';
import { ChatMessage as ChatMessageType, ChatSession } from '../types/chat';
import { generateChatResponse } from '../services/chatService';
import { generateOpenAIResponse } from '../services/openaiService';

interface ChatInterfaceProps {
  userType?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userType }) => {
  const [session, setSession] = useState<ChatSession>({
    id: `chat-${Date.now()}`,
    messages: [],
    createdAt: new Date(),
    lastActivity: new Date()
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isLoading]);

  useEffect(() => {
    // Add welcome message
    if (session.messages.length === 0) {
      const welcomeMessage: ChatMessageType = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Hi! I'm your laptop shopping assistant. I can help you with:\n\n• Finding the right laptop for your needs\n• Comparing different models\n• Understanding specs and features\n• Budget recommendations\n• Brand suggestions\n\nWhat kind of laptop are you looking for${userType ? ` for ${userType} use` : ''}?`,
        timestamp: new Date()
      };
      
      setSession(prev => ({
        ...prev,
        messages: [welcomeMessage]
      }));
    }
  }, [userType]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      lastActivity: new Date()
    }));

    setInputMessage('');
    setIsLoading(true);

    try {
      let response: string;
      
      if (apiKey) {
        // Use real OpenAI API
        console.log('Using OpenAI API for response');
        const openAIMessages = [...session.messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        response = await generateOpenAIResponse(openAIMessages, apiKey);
      } else {
        // Fall back to mock responses
        console.log('Using mock AI responses');
        response = await generateChatResponse([...session.messages, userMessage], userType);
      }
      
      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        lastActivity: new Date()
      }));

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setSession({
      id: `chat-${Date.now()}`,
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date()
    });
    
    toast({
      title: "Chat Cleared",
      description: "Starting a fresh conversation.",
    });
  };

  return (
    <div className="space-y-4">
      {showApiKeyInput && (
        <ApiKeyInput
          onApiKeySet={(key) => {
            setApiKey(key);
            setShowApiKeyInput(false);
            if (key) {
              toast({
                title: "API Key Saved",
                description: "Now using OpenAI for enhanced responses!",
              });
            }
          }}
          currentApiKey={apiKey}
        />
      )}

      <Card className="h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            Chat with AI Assistant
            {apiKey && <span className="text-xs text-green-600 ml-2">• OpenAI Connected</span>}
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {apiKey ? 'API Key' : 'Setup'}
            </Button>
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {session.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask me about laptops, specs, recommendations..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
            {!apiKey && ' • Setup OpenAI API for enhanced responses'}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
