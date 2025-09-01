
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
import { generateGeminiResponse } from '../services/geminiService';
import { EnhancedLaptopService } from '../services/enhancedLaptopService';
import { ProductDiscoveryService } from '../services/productDiscoveryService';

// Helper function for web scraping
const tryWebScraping = async (urls: string[]) => {
  try {
    const scrapedData = await EnhancedLaptopService.searchLaptops(urls);
    return scrapedData.length > 0 ? scrapedData : undefined;
  } catch (error) {
    console.warn('Web scraping failed:', error);
    return undefined;
  }
};

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
  const [aiProvider, setAiProvider] = useState('gemini');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedProvider = localStorage.getItem('ai_provider') || 'gemini';
    const savedApiKey = localStorage.getItem(`${savedProvider}_api_key`);
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setAiProvider(savedProvider);
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
      
      // Enhanced product discovery with structured data
      const urlMatch = userMessage.content.match(/https?:\/\/[^\s]+/g);
      let collectedUrls = urlMatch as string[] | null;
      let productData: any[] | undefined;
      let structuredProducts: any = null;

      if (!collectedUrls) {
        const lower = userMessage.content.toLowerCase();
        const brand = (lower.match(/apple|dell|hp|lenovo|asus|acer|msi|microsoft|samsung/) || [null])[0];
        const intent = /(compare|latest|new|newest|best|show|find|search)/.test(lower);
        if (brand && intent) {
          try {
            // Get structured product data optimized for Gemini
            structuredProducts = await ProductDiscoveryService.discoverStructuredProducts(brand, 3, localStorage.getItem('tavily_api_key') || undefined);
            console.log('Found structured products:', structuredProducts);
            
              // If we have Tavily structured data, use it directly
              if (structuredProducts.source === 'tavily' && structuredProducts.products.length > 0) {
                productData = structuredProducts.products.map((p: any) => ({
                  id: `structured-${Date.now()}-${Math.random()}`,
                  name: p.title || p.name || 'Unknown Model',
                  brand: p.brand || brand,
                  price: p.price?.amount || 0,
                  currency: p.price?.currency || '$',
                  image: p.images?.[0] || '/placeholder.svg',
                  images: p.images || [],
                  cpu: p.specs?.cpu || 'Unknown CPU',
                  ram: p.specs?.ram || 'Unknown RAM',
                  storage: p.specs?.storage || 'Unknown Storage',
                  screen: p.specs?.screen || 'Unknown Display',
                  battery: 'Not specified',
                  weight: 'Not specified',
                  os: p.specs?.os || 'Windows 11', 
                  rating: 4.2,
                  reviewCount: 150,
                  seller: p.url?.includes('amazon') ? 'Amazon' : 
                         p.url?.includes('bestbuy') ? 'Best Buy' :
                         p.url?.includes('dell.com') ? 'Dell' :
                         p.url?.includes('apple.com') ? 'Apple' : 'Official Store',
                  availability: 'Available Online',
                  url: p.url || ''
                }));
            } else if (structuredProducts.urls) {
              // Fallback to URL-based discovery
              collectedUrls = structuredProducts.urls;
            }
          } catch (e) {
            console.warn('Structured discovery failed:', e);
          }
        }
      }

      // Try to get product data from URLs if we don't have structured data
      if (!productData && collectedUrls && collectedUrls.length > 0) {
        try {
          productData = await EnhancedLaptopService.searchLaptops(collectedUrls);
          console.log('Found product data from URLs:', productData);
        } catch (error) {
          console.warn('Failed to get product data:', error);
        }
      }

      if (apiKey) {
        
        let enhancedContent = userMessage.content;
        
        // Create Gemini-optimized product data
        if (productData && productData.length > 0) {
          const geminiProductData = {
            query: userMessage.content,
            productCount: productData.length,
            products: productData.map(laptop => ({
              name: laptop.name,
              brand: laptop.brand,
              price: {
                amount: laptop.price,
                currency: laptop.currency || '$'
              },
              specifications: {
                processor: laptop.cpu,
                memory: laptop.ram,
                storage: laptop.storage,
                display: laptop.display || 'Standard',
                graphics: laptop.graphics || 'Integrated'
              },
              features: {
                rating: laptop.rating || 4.5,
                availability: laptop.availability || 'Available',
                seller: laptop.seller || 'Official Store'
              },
              images: laptop.images || [],
              description: laptop.description || '',
              url: laptop.url || ''
            })),
            source: structuredProducts?.source || 'web-scraping',
            timestamp: new Date().toISOString()
          };

          enhancedContent += `\n\n**STRUCTURED PRODUCT DATA FOR AI ANALYSIS:**
${JSON.stringify(geminiProductData, null, 2)}

Please analyze these ${productData.length} laptops and provide detailed recommendations based on the user's query. Include comparisons, pros/cons, and specific use-case recommendations.`;
        }
        
        try {
          // Enhanced AI with laptop-specific context and product data
          const messages = [...session.messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          
          const enhancedMessage = { ...userMessage, content: enhancedContent };
          const messagesWithEnhanced = [...session.messages, enhancedMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          
          // Add system context for laptop expertise
          const systemMessage = {
            role: 'system' as const,
            content: `You are a laptop shopping expert assistant with web scraping capabilities. You help users find the perfect laptop by:
            - Understanding their specific needs and use cases
            - Providing accurate technical advice about CPUs, RAM, storage, etc.
            - Comparing different brands and models objectively
            - Explaining performance expectations for different tasks
            - Suggesting budget-appropriate options
            - Analyzing laptop URLs and providing detailed comparisons
            - Using real-time web data when URLs are provided
            
            When users provide laptop URLs, use the scraped data to give accurate comparisons and recommendations. Be conversational, helpful, and specific.`
          };
          
          if (aiProvider === 'gemini') {
            response = await generateGeminiResponse([systemMessage, ...messagesWithEnhanced], apiKey);
          } else {
            response = await generateOpenAIResponse([systemMessage, ...messagesWithEnhanced], apiKey);
          }
        } catch (error) {
          console.error(`${aiProvider} API error:`, error);
          // If AI fails, use enhanced fallback with product data
          response = await generateChatResponse([...session.messages, userMessage], userType, productData);
        }
      } else {
        // Enhanced fallback for generic queries using structured discovery
        if (!productData) {
          const lower = userMessage.content.toLowerCase();
          const brand = (lower.match(/apple|dell|hp|lenovo|asus|acer|msi|microsoft|samsung/) || [null])[0];
          const intent = /(compare|latest|new|newest|best|show|find|search|laptop)/.test(lower);
          
          if ((brand && intent) || lower.includes('laptop')) {
            try {
              const searchBrand = brand || 'apple'; // Default to apple if no specific brand
              structuredProducts = await ProductDiscoveryService.discoverStructuredProducts(searchBrand, 3, localStorage.getItem('tavily_api_key') || undefined);
              
              if (structuredProducts.source === 'tavily' && structuredProducts.products.length > 0) {
                productData = structuredProducts.products.map((p: any) => ({
                  id: `fallback-${Date.now()}-${Math.random()}`,
                  name: p.title || p.name || 'Unknown Model',
                  brand: p.brand || searchBrand,
                  price: p.price?.amount || 0,
                  currency: p.price?.currency || '$',
                  image: p.images?.[0] || '/placeholder.svg',
                  images: p.images || [],
                  cpu: p.specs?.cpu || 'Unknown CPU',
                  ram: p.specs?.ram || 'Unknown RAM',
                  storage: p.specs?.storage || 'Unknown Storage',
                  screen: p.specs?.screen || 'Unknown Display',
                  battery: 'Not specified',
                  weight: 'Not specified',
                  os: p.specs?.os || 'Windows 11',
                  rating: 4.2,
                  reviewCount: 150,
                  seller: p.url?.includes('amazon') ? 'Amazon' : 
                         p.url?.includes('bestbuy') ? 'Best Buy' :
                         p.url?.includes('dell.com') ? 'Dell' :
                         p.url?.includes('apple.com') ? 'Apple' : 'Official Store',
                  availability: 'Available Online',
                  url: p.url || ''
                }));
                console.log('Fallback: Found structured product data:', productData);
              } else if (structuredProducts.urls) {
                productData = await EnhancedLaptopService.searchLaptops(structuredProducts.urls);
                console.log('Fallback: Found URL-based product data:', productData);
              }
            } catch (e) {
              console.warn('Enhanced fallback product discovery failed:', e);
            }
          }
        }
        
        // Use product data or enhanced chat service
        response = await generateChatResponse([...session.messages, userMessage], userType, productData);
      }
      
      const assistantMessage: ChatMessageType = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        products: productData && productData.length > 0 ? productData : undefined
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
          onApiKeySet={(key, provider) => {
            setApiKey(key);
            setAiProvider(provider);
            setShowApiKeyInput(false);
            if (key) {
              toast({
                title: "API Key Saved",
                description: `Now using ${provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} for enhanced responses!`,
              });
            }
          }}
          currentApiKey={apiKey}
          currentProvider={aiProvider}
        />
      )}

      <Card className="h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            Chat with AI Assistant
            {apiKey && <span className="text-xs text-green-600 ml-2">• {aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} Connected</span>}
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
            {!apiKey && ' • Setup AI API for enhanced responses with web scraping'}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
