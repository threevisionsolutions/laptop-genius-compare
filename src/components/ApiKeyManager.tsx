import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyManagerProps {
  onApiKeyChange: (key: string) => void;
  className?: string;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeyChange, className }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsValid(true);
      onApiKeyChange(savedKey);
    }
  }, [onApiKeyChange]);

  const validateAndSaveKey = () => {
    if (!apiKey.trim()) {
      setIsValid(false);
      return;
    }

    // Basic OpenAI API key validation
    if (apiKey.startsWith('sk-') && apiKey.length > 20) {
      localStorage.setItem('openai_api_key', apiKey);
      setIsValid(true);
      onApiKeyChange(apiKey);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved and validated.",
      });
    } else {
      setIsValid(false);
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key (starts with 'sk-')",
        variant: "destructive",
      });
    }
  };

  const clearKey = () => {
    setApiKey('');
    setIsValid(null);
    localStorage.removeItem('openai_api_key');
    onApiKeyChange('');
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed.",
    });
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-medium">OpenAI API Key</h3>
        {isValid === true && <Check className="w-4 h-4 text-green-600" />}
        {isValid === false && <X className="w-4 h-4 text-red-600" />}
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? 'text' : 'password'}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setIsValid(null);
            }}
            className={`pr-10 ${
              isValid === true ? 'border-green-500' : 
              isValid === false ? 'border-red-500' : ''
            }`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        
        {apiKey ? (
          <div className="flex gap-1">
            <Button onClick={validateAndSaveKey} size="sm">
              Save
            </Button>
            <Button onClick={clearKey} variant="outline" size="sm">
              Clear
            </Button>
          </div>
        ) : null}
      </div>
      
      {!apiKey && (
        <p className="text-xs text-muted-foreground mt-2">
          Add your OpenAI API key to get AI-powered comparisons. Without it, you'll get basic analysis.
        </p>
      )}
    </Card>
  );
};

export default ApiKeyManager;