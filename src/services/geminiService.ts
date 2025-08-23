interface GeminiMessage {
  role: 'system' | 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export const generateGeminiResponse = async (messages: Array<{role: string, content: string}>, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  // Convert messages to Gemini format
  const geminiMessages: GeminiMessage[] = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role as 'user' | 'model',
      parts: [{ text: msg.content }]
    }));

  // Add system prompt as first user message
  const systemPrompt = `You are a helpful laptop shopping assistant. You provide expert advice on:
- Laptop specifications and their real-world impact
- Brand comparisons and reliability  
- Budget recommendations for different use cases
- Performance expectations for various tasks
- Current market trends and best deals
- Analyzing laptop URLs and specifications when provided

Keep responses conversational, helpful, and specific. Include practical advice and real product recommendations when possible. Format responses with clear sections using markdown when helpful.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...geminiMessages
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1000,
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API request failed');
  }

  const data: GeminiResponse = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I couldn\'t generate a response.';
};