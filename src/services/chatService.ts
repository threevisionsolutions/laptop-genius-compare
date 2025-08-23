import { ChatMessage } from '../types/chat';

export const generateChatResponse = async (messages: ChatMessage[], userType?: string, scrapingData?: any[]): Promise<string> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage.content.toLowerCase();
  const conversation = messages.map(m => m.content).join(' ').toLowerCase();
  
  // Handle URL-based comparisons with scraping data
  if (scrapingData && scrapingData.length > 0) {
    return generateComparisonResponse(scrapingData, userMessage);
  }
  
  // Check for URLs in the message
  const urlPattern = /https?:\/\/[^\s]+/g;
  if (userMessage.match(urlPattern)) {
    return generateUrlAnalysisResponse(userMessage);
  }
  
  // Context-aware responses based on conversation history
  const context = analyzeConversationContext(conversation);
  
  // Multi-keyword and context-aware matching
  if (matchesKeywords(userMessage, ['budget', 'cheap', 'affordable', 'under', 'price', 'cost']) || context.budgetFocused) {
    return generateBudgetResponse(userType, context);
  }
  
  if (matchesKeywords(userMessage, ['gaming', 'game', 'fps', 'graphics', 'rtx', 'nvidia']) || context.gamingFocused) {
    return generateGamingResponse(context);
  }
  
  if (matchesKeywords(userMessage, ['programming', 'coding', 'development', 'python', 'javascript', 'ide']) || context.programmingFocused) {
    return generateProgrammingResponse(context);
  }
  
  if (matchesKeywords(userMessage, ['student', 'school', 'university', 'college', 'study']) || context.studentFocused) {
    return generateStudentResponse(context);
  }
  
  if (matchesKeywords(userMessage, ['business', 'work', 'office', 'professional', 'enterprise']) || context.businessFocused) {
    return generateBusinessResponse(context);
  }
  
  if (matchesKeywords(userMessage, ['specs', 'cpu', 'ram', 'processor', 'performance', 'benchmark'])) {
    return generateSpecsResponse(context);
  }
  
  if (matchesKeywords(userMessage, ['brand', 'apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'microsoft'])) {
    return generateBrandResponse(context);
  }
  
  if (matchesKeywords(userMessage, ['compare', 'comparison', 'vs', 'versus', 'difference', 'better'])) {
    return generateComparisonGuideResponse(context);
  }
  
  if (matchesKeywords(userMessage, ['recommend', 'suggestion', 'best', 'top', 'good'])) {
    return generatePersonalizedRecommendation(userType, context, conversation);
  }
  
  // Default contextual response
  return generateContextualResponse(userType, context, userMessage);
};

// Helper functions
const matchesKeywords = (text: string, keywords: string[]): boolean => {
  return keywords.some(keyword => text.includes(keyword));
};

const analyzeConversationContext = (conversation: string) => {
  return {
    budgetFocused: matchesKeywords(conversation, ['budget', 'cheap', 'affordable', 'price']),
    gamingFocused: matchesKeywords(conversation, ['gaming', 'game', 'fps', 'graphics']),
    programmingFocused: matchesKeywords(conversation, ['programming', 'coding', 'development']),
    studentFocused: matchesKeywords(conversation, ['student', 'school', 'university']),
    businessFocused: matchesKeywords(conversation, ['business', 'work', 'office']),
    mentionedBrands: extractMentionedBrands(conversation),
    priceRange: extractPriceRange(conversation)
  };
};

const extractMentionedBrands = (text: string): string[] => {
  const brands = ['apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'microsoft', 'razer', 'alienware'];
  return brands.filter(brand => text.includes(brand));
};

const extractPriceRange = (text: string): string | null => {
  const priceMatch = text.match(/\$?(\d+)/);
  if (priceMatch) {
    const price = parseInt(priceMatch[1]);
    if (price < 500) return 'under-500';
    if (price < 1000) return '500-1000';
    if (price < 1500) return '1000-1500';
    return 'over-1500';
  }
  return null;
};

const generateComparisonResponse = (scrapingData: any[], userMessage: string): string => {
  const laptops = scrapingData.slice(0, 3); // Compare top 3
  
  return `I've analyzed the laptops from the URLs you provided. Here's my comparison:

${laptops.map((laptop, index) => `
**${index + 1}. ${laptop.name}** - $${laptop.price}
• **CPU:** ${laptop.cpu}
• **RAM:** ${laptop.ram}
• **Storage:** ${laptop.storage}
• **Graphics:** ${laptop.graphics || 'Integrated'}
• **Display:** ${laptop.display || 'Standard'}
`).join('')}

**My Recommendation:**
${generateSmartComparison(laptops, userMessage)}

Would you like me to explain any specific aspect of these laptops or help you decide based on your use case?`;
};

const generateSmartComparison = (laptops: any[], userMessage: string): string => {
  const gaming = matchesKeywords(userMessage, ['gaming', 'game']);
  const budget = matchesKeywords(userMessage, ['budget', 'cheap']);
  const programming = matchesKeywords(userMessage, ['programming', 'coding']);
  
  if (gaming) {
    const bestGaming = laptops.find(l => l.graphics && !l.graphics.includes('Integrated'));
    return bestGaming ? `For gaming, I'd recommend the ${bestGaming.name} due to its dedicated graphics card.` : 
           'None of these laptops are ideal for gaming - consider models with dedicated GPUs like RTX or GTX series.';
  }
  
  if (budget) {
    const cheapest = laptops.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
    return `For budget-conscious users, the ${cheapest.name} at $${cheapest.price} offers the best value.`;
  }
  
  const balanced = laptops.find(l => l.ram && parseInt(l.ram) >= 8 && l.cpu && !l.cpu.includes('Celeron'));
  return balanced ? `The ${balanced.name} offers the best overall balance of performance and features.` : 
         'Consider looking for laptops with at least 8GB RAM and modern processors for better performance.';
};

const generateUrlAnalysisResponse = (userMessage: string): string => {
  return `I can see you've shared laptop URLs! Let me analyze them for you...

Unfortunately, I need a moment to process the website data. In the meantime, here's what I can help with:

• **Compare specifications** side by side
• **Explain technical terms** in simple language  
• **Recommend based on your needs** - what will you use the laptop for?
• **Check price-to-performance ratio**
• **Identify potential issues** or limitations

While I process the URLs, could you tell me:
1. What's your primary use case? (work, gaming, school, etc.)
2. What's your budget range?
3. Any specific requirements? (screen size, weight, battery life)

This will help me give you a more targeted analysis once I process the laptop data!`;
};

const generateComparisonGuideResponse = (context: any): string => {
  return `I'd love to help you compare laptops! Here's my systematic approach:

**Key Comparison Areas:**
• **Performance:** CPU (Intel i5/i7 vs AMD Ryzen), RAM (8GB minimum, 16GB ideal)
• **Graphics:** Integrated vs Dedicated (RTX/GTX for gaming)
• **Storage:** SSD vs HDD (SSD is much faster)
• **Display:** Screen size, resolution, refresh rate
• **Build Quality:** Materials, keyboard, trackpad
• **Battery Life:** Real-world usage expectations
• **Price-to-Performance:** Best value for your needs

**To give you specific comparisons, I need:**
1. **Laptop models or URLs** you're considering
2. **Your primary use case** (work, gaming, creative, school)
3. **Budget range**
4. **Must-have features** (touchscreen, 2-in-1, specific ports)

Share some laptops you're looking at, and I'll break down the pros and cons of each!`;
};

const generatePersonalizedRecommendation = (userType: string | undefined, context: any, conversation: string): string => {
  let recommendations = '';
  
  if (context.priceRange === 'under-500') {
    recommendations = `**Budget Recommendations (Under $500):**
• **ASUS VivoBook 15** - AMD Ryzen 5, great performance per dollar
• **Acer Aspire 5** - Intel i5, solid build quality
• **HP Pavilion 15** - Good battery life, reliable brand`;
  } else if (context.priceRange === '500-1000') {
    recommendations = `**Mid-Range Recommendations ($500-$1000):**
• **Lenovo ThinkPad E15** - Excellent keyboard, business-grade durability
• **ASUS ZenBook 14** - Premium design, great display
• **HP Envy x360** - 2-in-1 flexibility, AMD Ryzen power`;
  } else {
    recommendations = `**My Current Top Recommendations:**
• **For Overall Value:** Lenovo ThinkPad E15 - reliable, powerful, great keyboard
• **For Students:** ASUS VivoBook S15 - lightweight, good battery, affordable
• **For Professionals:** HP EliteBook 840 - premium build, security features
• **For Gaming:** ASUS TUF Gaming - dedicated GPU, good cooling`;
  }
  
  return `${recommendations}

**Based on our conversation, I think you'd benefit from:**
${generateContextualSuggestion(context, userType)}

Would you like me to explain why I chose these, or do you have specific models in mind to compare?`;
};

const generateContextualSuggestion = (context: any, userType?: string): string => {
  const suggestions = [];
  
  if (context.programmingFocused) {
    suggestions.push('• At least 16GB RAM for smooth development environment');
    suggestions.push('• SSD storage for fast code compilation');
    suggestions.push('• Good keyboard for long coding sessions');
  }
  
  if (context.studentFocused) {
    suggestions.push('• Lightweight design for portability');
    suggestions.push('• Good battery life for all-day use');
    suggestions.push('• Affordable with solid performance');
  }
  
  if (context.gamingFocused) {
    suggestions.push('• Dedicated graphics card (GTX/RTX series)');
    suggestions.push('• High refresh rate display');
    suggestions.push('• Good cooling system');
  }
  
  return suggestions.length > 0 ? suggestions.join('\n') : 
    '• Focus on overall performance and reliability for your needs';
};

const generateContextualResponse = (userType: string | undefined, context: any, userMessage: string): string => {
  const responses = [
    `I'm here to help you find the perfect laptop! Based on what you've told me, I can provide personalized recommendations.

**What I can help with:**
• Find laptops that match your specific needs and budget
• Explain technical specifications in simple terms
• Compare different models side by side
• Analyze laptop URLs you're considering

**To give you the best advice, tell me:**
1. What will you primarily use the laptop for?
2. What's your budget range?
3. Any preferences for brand, size, or features?

Feel free to share laptop URLs for detailed analysis, or just describe what you're looking for!`,

    `Great question! Let me help you navigate the laptop market.

**Current Market Trends:**
• AMD Ryzen processors offer excellent value vs Intel
• SSD storage is now standard (avoid HDDs)
• 8GB RAM minimum, 16GB recommended for multitasking
• Integrated graphics fine for most tasks, dedicated GPU for gaming/creative work

**Popular Categories:**
• **Ultrabooks:** Thin, light, premium (Dell XPS, MacBook Air)
• **Business:** Durable, secure (ThinkPad, EliteBook)  
• **Gaming:** Powerful graphics, gaming features (ASUS ROG, MSI)
• **Budget:** Good value, basic features (Aspire, VivoBook)

What type of laptop user are you? I can narrow down recommendations based on your needs!`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

const generateBudgetResponse = (userType?: string, context?: any) => {
  return `For budget-friendly laptops, here are my top recommendations:

**Under $500:**
• ASUS VivoBook 15 - Great value with AMD Ryzen processors
• Acer Aspire 5 - Solid performance for everyday tasks
• HP Pavilion 15 - Reliable with good battery life

**$500-$800:**
• Lenovo IdeaPad 5 - Excellent build quality and performance
• ASUS ZenBook 14 - Premium feel at mid-range price
• HP Envy x360 - 2-in-1 versatility

**Money-saving tips:**
• Look for last-gen processors (still very capable)
• Consider refurbished from reputable sellers
• Wait for back-to-school sales (July-September)
• Check manufacturer outlet stores

${userType ? `For ${userType} use, I'd especially recommend focusing on models with sufficient RAM (8GB+) and SSD storage.` : ''}

What's your target budget range?`;
};

const generateGamingResponse = (context?: any) => {
  return `For gaming laptops, here's what you need to know:

**Essential Gaming Specs:**
• GPU: RTX 4060/4070 or RX 7600M/7700S minimum
• CPU: Intel i5-12400H+ or AMD Ryzen 5 7600H+
• RAM: 16GB DDR4/DDR5 (32GB for AAA titles)
• Display: 144Hz+ refresh rate, 1080p minimum

**Top Gaming Laptop Recommendations:**
• **ASUS ROG Strix G15** - Best value performance
• **MSI Katana 15** - Budget-friendly gaming
• **Alienware m15 R7** - Premium gaming experience
• **Lenovo Legion 5 Pro** - Great balance of price/performance

**Gaming-Specific Features:**
• Advanced cooling systems (dual-fan minimum)
• RGB keyboard backlighting
• High refresh rate displays (144Hz-240Hz)
• Adequate port selection (USB-A, USB-C, HDMI)

**Budget Ranges:**
• Entry Gaming: $800-$1,200
• Mid-Range Gaming: $1,200-$1,800
• High-End Gaming: $1,800+

What types of games are you planning to play?`;
};

const generateProgrammingResponse = (context?: any) => {
  return `For programming and development, here are my recommendations:

**Essential Development Specs:**
• CPU: Intel i5/i7 or AMD Ryzen 5/7 (multi-core performance matters)
• RAM: 16GB minimum, 32GB preferred for VMs/containers
• Storage: 512GB+ SSD (fast read/write for compilation)
• Display: 14"+ with good color accuracy

**Top Developer Laptops:**
• **MacBook Air M2** - Excellent for web dev, iOS development
• **ThinkPad X1 Carbon** - Linux-friendly, great keyboard
• **Dell XPS 15** - Powerful Windows option
• **Framework Laptop** - Modular, repairable design

**OS Considerations:**
• **macOS**: Great for web dev, mobile dev, design
• **Linux**: Preferred by many developers, great customization
• **Windows**: Necessary for .NET, game dev, broad compatibility

**Development-Specific Features:**
• Excellent keyboard (you'll be typing a lot!)
• Multiple USB ports for peripherals
• Good webcam for video calls
• Quiet cooling (for those long coding sessions)

**Budget Ranges:**
• Student/Beginner: $600-$1,000
• Professional Dev: $1,000-$2,000
• Specialized Work: $2,000+

What programming languages or frameworks do you primarily work with?`;
};

const generateStudentResponse = (context?: any) => {
  return `For students, here are my budget-friendly recommendations:

**Best Student Laptops:**
• **MacBook Air M1/M2** - Long battery, great for research and papers
• **ASUS VivoBook S15** - Windows alternative with good value
• **Lenovo IdeaPad 3** - Budget-friendly with solid performance
• **HP Pavilion 14** - Compact and portable for campus life

**Student-Essential Features:**
• 8+ hour battery life (for all-day classes)
• Lightweight design (under 4 lbs)
• Good keyboard for note-taking and essays
• Reliable Wi-Fi connectivity
• Webcam for online classes

**Money-Saving Tips for Students:**
• Check for student discounts (Apple, Microsoft, Adobe)
• Consider certified refurbished models
• Look for back-to-school promotions
• Some schools offer laptop rental programs

**Recommended Specs:**
• CPU: Intel i3/i5 or AMD Ryzen 3/5
• RAM: 8GB (upgradeable preferred)
• Storage: 256GB SSD minimum
• Display: 13-15 inches for portability

**Budget Guidelines:**
• Basic needs: $400-$700
• Engineering/Design students: $800-$1,200
• Graduate students: $700-$1,000

What's your field of study? This can help me give more specific recommendations!`;
};

const generateBusinessResponse = (context?: any) => {
  return `For business and professional use, here are my recommendations:

**Top Business Laptops:**
• **ThinkPad X1 Carbon** - Industry standard, excellent keyboard
• **Dell Latitude 9000 Series** - Enterprise features, security
• **MacBook Pro 14"** - Creative professionals, premium build
• **HP EliteBook 800 Series** - Security-focused, durable

**Business-Critical Features:**
• TPM 2.0 chip for security
• Fingerprint reader or Windows Hello
• Docking station compatibility
• Professional appearance and build quality
• Excellent keyboard and trackpad

**Performance Requirements:**
• CPU: Intel i5/i7 vPro or AMD Ryzen Pro
• RAM: 16GB for multitasking
• Storage: 512GB+ SSD with encryption
• Display: Anti-glare, good outdoor visibility

**Connectivity Needs:**
• USB-C with Thunderbolt
• HDMI for presentations
• Ethernet port (or adapter)
• Multiple USB-A ports
• SD card reader (optional)

**Business Software Compatibility:**
• Microsoft Office Suite optimization
• VPN client support
• Video conferencing (Teams, Zoom, WebEx)
• Cloud storage integration

**Budget Ranges:**
• Small Business: $800-$1,200
• Corporate Standard: $1,200-$1,800
• Executive/Premium: $1,800+

What type of business work will you primarily be doing?`;
};

const generateSpecsResponse = (context?: any) => {
  return `Let me break down laptop specs in simple terms:

**CPU (Processor) - The Brain:**
• **Intel**: i3 (basic), i5 (good), i7 (great), i9 (overkill for most)
• **AMD**: Ryzen 3 (basic), Ryzen 5 (good), Ryzen 7 (great)
• **Apple**: M1/M2 (excellent performance and efficiency)

**RAM (Memory) - Multitasking Power:**
• 8GB: Minimum for modern use
• 16GB: Sweet spot for most users
• 32GB: For heavy workloads, video editing

**Storage - Your File Cabinet:**
• **SSD**: Fast, silent, durable (recommended)
• **HDD**: Slower but cheaper (avoid if possible)
• **Size**: 256GB minimum, 512GB+ recommended

**Graphics (GPU) - Visual Processing:**
• **Integrated**: Good for basic tasks, light gaming
• **Dedicated**: Necessary for gaming, video editing, 3D work

**Display - What You See:**
• **Size**: 13-14" (portable), 15-16" (desktop replacement)
• **Resolution**: 1080p minimum, 1440p/4K for professionals
• **Panel**: IPS (better colors) vs TN (cheaper)

**Battery Life:**
• 6-8 hours: Acceptable
• 8-12 hours: Good
• 12+ hours: Excellent (usually Apple or efficient CPUs)

**Build Quality Indicators:**
• Materials: Aluminum > plastic
• Keyboard: Backlit, comfortable key travel
• Ports: USB-C, USB-A, HDMI variety

What specific aspect would you like me to explain further?`;
};

const generateBrandResponse = (context?: any) => {
  return `Here's my honest take on laptop brands:

**Premium Tier:**
• **Apple** - Best build quality, excellent support, macOS ecosystem
• **ThinkPad (Lenovo)** - Business-grade durability, best keyboards
• **Dell XPS** - Premium Windows laptops, great displays

**Solid Mid-Range:**
• **ASUS** - Good value, wide range of options
• **HP** - Reliable, good support network
• **Acer** - Budget-friendly with decent performance

**Gaming Specialists:**
• **ASUS ROG** - Gaming performance leader
• **MSI** - Great gaming features and cooling
• **Alienware (Dell)** - Premium gaming brand

**Budget Champions:**
• **Lenovo IdeaPad** - Best budget Windows laptops
• **ASUS VivoBook** - Good specs for the price
• **HP Pavilion** - Reliable budget option

**Brand Reputation Summary:**
✅ **Most Reliable**: Apple, ThinkPad, Dell Business
✅ **Best Value**: ASUS, Lenovo consumer lines
✅ **Gaming**: ASUS ROG, MSI
✅ **Support**: Apple, Dell, HP
⚠️ **Avoid**: Very cheap unknown brands, old Toshiba

**My Honest Recommendations:**
• **For reliability**: Apple or ThinkPad
• **For value**: ASUS or Lenovo
• **For gaming**: ASUS ROG or MSI
• **For business**: Dell Latitude or ThinkPad

What's most important to you: reliability, performance, price, or specific features?`;
};