
import { ChatMessage } from '../types/chat';

export const generateChatResponse = async (messages: ChatMessage[], userType?: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage.content.toLowerCase();
  
  // Simulate intelligent responses based on common laptop queries
  if (userMessage.includes('budget') || userMessage.includes('cheap') || userMessage.includes('affordable')) {
    return generateBudgetResponse(userType);
  }
  
  if (userMessage.includes('gaming') || userMessage.includes('game')) {
    return generateGamingResponse();
  }
  
  if (userMessage.includes('programming') || userMessage.includes('coding') || userMessage.includes('development')) {
    return generateProgrammingResponse();
  }
  
  if (userMessage.includes('student') || userMessage.includes('school') || userMessage.includes('university')) {
    return generateStudentResponse();
  }
  
  if (userMessage.includes('business') || userMessage.includes('work') || userMessage.includes('office')) {
    return generateBusinessResponse();
  }
  
  if (userMessage.includes('specs') || userMessage.includes('cpu') || userMessage.includes('ram') || userMessage.includes('processor')) {
    return generateSpecsResponse();
  }
  
  if (userMessage.includes('brand') || userMessage.includes('apple') || userMessage.includes('dell') || userMessage.includes('hp')) {
    return generateBrandResponse();
  }
  
  // Default helpful response
  return generateGeneralResponse(userType);
};

const generateBudgetResponse = (userType?: string) => {
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

const generateGamingResponse = () => {
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

const generateProgrammingResponse = () => {
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

const generateStudentResponse = () => {
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

const generateBusinessResponse = () => {
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

const generateSpecsResponse = () => {
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

const generateBrandResponse = () => {
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

const generateGeneralResponse = (userType?: string) => {
  const responses = [
    `I'd be happy to help you find the perfect laptop! To give you the best recommendations, could you tell me:

• What's your primary use case? (work, gaming, school, general use)
• What's your budget range?
• Do you prefer Windows, Mac, or have no preference?
• Any specific requirements? (screen size, weight, battery life)

${userType ? `Since you mentioned ${userType} use, I can tailor my suggestions accordingly.` : ''}`,

    `Great question! Here are some popular laptop topics I can help with:

**Shopping Guidance:**
• Budget recommendations for different needs
• Brand comparisons and reliability
• Spec explanations in simple terms

**Use Case Specific:**
• Student laptops (budget-friendly, portable)
• Gaming laptops (performance, cooling)
• Business laptops (security, durability)
• Creative work (displays, processing power)

**Technical Help:**
• Understanding CPU, RAM, storage differences
• Display technologies and what matters
• Port selection and connectivity

What would you like to know more about?`,

    `I'm here to make laptop shopping easier! Some ways I can assist:

🔍 **Product Research**: Help you understand specs and features
💰 **Budget Planning**: Recommend best value in your price range  
🆚 **Comparisons**: Side-by-side analysis of different models
🎯 **Personalized Advice**: Tailored to your specific needs
🛡️ **Avoid Pitfalls**: Common mistakes when laptop shopping

What's your biggest question or concern about finding the right laptop?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};
