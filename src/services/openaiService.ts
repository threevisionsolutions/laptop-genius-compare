
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

/**
 * Get API key from localStorage or environment
 */
const getApiKey = (): string | null => {
  return localStorage.getItem('openai_api_key') || null;
};

export const generateOpenAIResponse = async (messages: OpenAIMessage[], apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const systemPrompt = `You are a helpful laptop shopping assistant. You provide expert advice on:
- Laptop specifications and their real-world impact
- Brand comparisons and reliability
- Budget recommendations for different use cases
- Performance expectations for various tasks
- Current market trends and best deals

Keep responses conversational, helpful, and specific. Include practical advice and real product recommendations when possible. Format responses with clear sections using markdown when helpful.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API request failed');
  }

  const data: OpenAIResponse = await response.json();
  return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
};

/**
 * Wrapper function for chatService integration
 */
export const callOpenAI = async (opts: {
  messages: OpenAIMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<{ text: string; usage?: { total_tokens?: number } }> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please configure it in settings.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API request failed');
  }

  const data: OpenAIResponse = await response.json();
  
  return {
    text: data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.',
    usage: data.usage
  };
};
