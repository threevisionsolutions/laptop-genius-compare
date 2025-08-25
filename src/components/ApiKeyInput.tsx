
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Key, Bot } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string, provider: string) => void;
  currentApiKey?: string;
  currentProvider?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet, currentApiKey, currentProvider }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [provider, setProvider] = useState(currentProvider || 'gemini');
  const [showKey, setShowKey] = useState(false);
  const [tavilyKey, setTavilyKey] = useState(localStorage.getItem('tavily_api_key') || '');
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(`${provider}_api_key`, apiKey.trim());
      localStorage.setItem('ai_provider', provider);
      onApiKeySet(apiKey.trim(), provider);
    }
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem(`${provider}_api_key`);
    localStorage.removeItem('ai_provider');
    onApiKeySet('', provider);
  };

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-blue-600" />
        <h4 className="font-medium text-blue-900">AI Provider Configuration</h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="provider" className="text-sm">
            Choose AI Provider
          </Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Google Gemini (Free)</SelectItem>
              <SelectItem value="openai">OpenAI GPT-4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="api-key" className="text-sm">
            Enter your {provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} API key for enhanced AI responses
          </Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder={provider === 'gemini' ? 'AIza...' : 'sk-...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button onClick={handleSave} disabled={!apiKey.trim()}>
              Save
            </Button>
            {currentApiKey && (
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Label htmlFor="tavily-key" className="text-sm">
            Tavily Web Search API key (optional)
          </Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Input
                id="tavily-key"
                type={showTavilyKey ? "text" : "password"}
                placeholder="tvly-..."
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowTavilyKey(!showTavilyKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showTavilyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              onClick={() => tavilyKey.trim() && localStorage.setItem('tavily_api_key', tavilyKey.trim())}
              disabled={!tavilyKey.trim()}
            >
              Save
            </Button>
            {tavilyKey && (
              <Button
                variant="outline"
                onClick={() => { setTavilyKey(''); localStorage.removeItem('tavily_api_key'); }}
              >
                Clear
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Improves web discovery via Tavily. Get a key at
            {' '}<a href="https://docs.tavily.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Tavily</a>.
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Your API key is stored locally and never sent to our servers. 
          Get your key from {provider === 'gemini' ? (
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
          ) : (
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI's platform</a>
          )}.
        </p>
      </div>
    </Card>
  );
};

export default ApiKeyInput;
