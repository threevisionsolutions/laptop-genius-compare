import { LaptopSpecs } from '../types/laptop';
import { WebScrapingService } from './webScrapingService';
import { generateOpenAIResponse } from './openaiService';

// Enhanced mock data with more realistic specs
const mockLaptops: Record<string, LaptopSpecs> = {
  'macbook-air-m2': {
    id: 'macbook-air-m2',
    name: 'MacBook Air 13" with M2 Chip',
    brand: 'Apple',
    price: 1099,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'Apple M2 8-core CPU',
    ram: '8GB Unified Memory',
    storage: '256GB SSD',
    screen: '13.6" Liquid Retina (2560x1664)',
    battery: 'Up to 18 hours',
    weight: '2.7 lbs (1.24 kg)',
    os: 'macOS Ventura',
    rating: 4.8,
    reviewCount: 1247,
    seller: 'Apple Store',
    availability: 'In Stock',
    url: 'https://apple.com/macbook-air'
  },
  'dell-xps-13-plus': {
    id: 'dell-xps-13-plus',
    name: 'Dell XPS 13 Plus',
    brand: 'Dell',
    price: 1299,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'Intel Core i7-1260P',
    ram: '16GB LPDDR5',
    storage: '512GB PCIe NVMe SSD',
    screen: '13.4" FHD+ (1920x1200)',
    battery: 'Up to 12 hours',
    weight: '2.73 lbs (1.24 kg)',
    os: 'Windows 11 Home',
    rating: 4.5,
    reviewCount: 892,
    seller: 'Dell',
    availability: 'In Stock',
    url: 'https://dell.com/xps-13-plus'
  },
  'thinkpad-x1-carbon-gen-11': {
    id: 'thinkpad-x1-carbon-gen-11',
    name: 'Lenovo ThinkPad X1 Carbon Gen 11',
    brand: 'Lenovo',
    price: 1449,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'Intel Core i7-1365U vPro',
    ram: '16GB LPDDR5',
    storage: '512GB PCIe Gen4 SSD',
    screen: '14" WUXGA (1920x1200) IPS',
    battery: 'Up to 15 hours',
    weight: '2.48 lbs (1.12 kg)',
    os: 'Windows 11 Pro',
    rating: 4.6,
    reviewCount: 634,
    seller: 'Lenovo',
    availability: 'In Stock',
    url: 'https://lenovo.com/thinkpad-x1-carbon'
  },
  'asus-zenbook-14': {
    id: 'asus-zenbook-14',
    name: 'ASUS ZenBook 14 OLED',
    brand: 'ASUS',
    price: 899,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'AMD Ryzen 7 5825U',
    ram: '16GB DDR4',
    storage: '512GB PCIe SSD',
    screen: '14" OLED (2880x1800)',
    battery: 'Up to 13 hours',
    weight: '3.09 lbs (1.4 kg)',
    os: 'Windows 11 Home',
    rating: 4.3,
    reviewCount: 423,
    seller: 'ASUS',
    availability: 'In Stock',
    url: 'https://asus.com/zenbook-14'
  },
  'macbook-pro-14': {
    id: 'macbook-pro-14',
    name: 'MacBook Pro 14" M2 Pro',
    brand: 'Apple',
    price: 1999,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'Apple M2 Pro 10-core CPU',
    ram: '16GB Unified Memory',
    storage: '512GB SSD',
    screen: '14.2" Liquid Retina XDR (3024x1964)',
    battery: 'Up to 18 hours',
    weight: '3.5 lbs (1.6 kg)',
    os: 'macOS Ventura',
    rating: 4.9,
    reviewCount: 567,
    seller: 'Apple Store',
    availability: 'In Stock',
    url: 'https://apple.com/macbook-pro-14'
  },
  'hp-spectre-x360': {
    id: 'hp-spectre-x360',
    name: 'HP Spectre x360 14"',
    brand: 'HP',
    price: 1199,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'Intel Core i7-1255U',
    ram: '16GB LPDDR4x',
    storage: '512GB PCIe NVMe SSD',
    screen: '13.5" OLED (3000x2000)',
    battery: 'Up to 11 hours',
    weight: '2.95 lbs (1.34 kg)',
    os: 'Windows 11 Home',
    rating: 4.4,
    reviewCount: 298,
    seller: 'HP',
    availability: 'In Stock',
    url: 'https://hp.com/spectre-x360'
  }
};

interface SearchQuery {
  original: string;
  normalized: string;
  isUrl: boolean;
  brand?: string;
  model?: string;
  specs?: string[];
}

export class EnhancedLaptopService {
  
  static async searchLaptops(queries: string[], userType?: string): Promise<LaptopSpecs[]> {
    console.log('Enhanced search with queries:', queries);
    
    const results: LaptopSpecs[] = [];
    const processedQueries = queries.map(q => this.parseQuery(q));
    
    for (let i = 0; i < processedQueries.length; i++) {
      const query = processedQueries[i];
      let laptop: LaptopSpecs | null = null;
      
      if (query.isUrl) {
        // Try to scrape the URL
        laptop = await this.scrapeLaptopFromUrl(query.original);
        if (!laptop) {
          console.warn(`Failed to scrape ${query.original}, falling back to mock data`);
          laptop = this.findBestMockMatch(query);
        }
      } else {
        // Search in mock data with enhanced matching
        laptop = this.findBestMockMatch(query);
      }
      
      if (laptop) {
        // Ensure unique ID for comparison
        const uniqueLaptop = {
          ...laptop,
          id: `${laptop.id}-${i}`,
          url: query.original
        };
        results.push(uniqueLaptop);
      }
    }
    
    // If no results found, provide some default recommendations
    if (results.length === 0) {
      console.log('No matches found, providing default recommendations');
      const defaultLaptops = Object.values(mockLaptops).slice(0, Math.min(3, queries.length));
      results.push(...defaultLaptops.map((laptop, index) => ({
        ...laptop,
        id: `${laptop.id}-default-${index}`
      })));
    }
    
    return results;
  }

  private static parseQuery(query: string): SearchQuery {
    const isUrl = this.isValidUrl(query);
    const normalized = query.toLowerCase().trim();
    
    const searchQuery: SearchQuery = {
      original: query,
      normalized,
      isUrl
    };

    if (!isUrl) {
      // Extract brand information
      const brands = ['apple', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'microsoft', 'samsung'];
      searchQuery.brand = brands.find(brand => normalized.includes(brand));
      
      // Extract model information
      const models = [
        'macbook', 'air', 'pro', 'xps', 'inspiron', 'latitude',
        'thinkpad', 'ideapad', 'yoga', 'zenbook', 'vivobook',
        'pavilion', 'envy', 'spectre', 'surface', 'galaxy'
      ];
      searchQuery.model = models.find(model => normalized.includes(model));
      
      // Extract specs
      searchQuery.specs = this.extractSpecs(normalized);
    }
    
    return searchQuery;
  }

  private static extractSpecs(query: string): string[] {
    const specs = [];
    
    // CPU detection
    if (query.match(/i[3579]/)) specs.push('intel');
    if (query.match(/ryzen/)) specs.push('amd');
    if (query.match(/m[12]/)) specs.push('apple-silicon');
    
    // RAM detection
    const ramMatch = query.match(/(\d+)\s*gb/);
    if (ramMatch) specs.push(`${ramMatch[1]}gb-ram`);
    
    // Storage detection
    if (query.match(/ssd/)) specs.push('ssd');
    if (query.match(/(\d+)\s*(gb|tb)/)) specs.push('storage-specified');
    
    // Use case detection
    if (query.match(/gaming/)) specs.push('gaming');
    if (query.match(/business|work/)) specs.push('business');
    if (query.match(/student/)) specs.push('student');
    if (query.match(/creative|design/)) specs.push('creative');
    
    return specs;
  }

  private static isValidUrl(str: string): boolean {
    try {
      new URL(str);
      return WebScrapingService.validateLaptopUrl(str);
    } catch {
      return false;
    }
  }

  private static async scrapeLaptopFromUrl(url: string): Promise<LaptopSpecs | null> {
    try {
      return await WebScrapingService.scrapeLaptopFromUrl(url);
    } catch (error) {
      console.error('Error scraping laptop:', error);
      return null;
    }
  }

  private static findBestMockMatch(query: SearchQuery): LaptopSpecs | null {
    const laptops = Object.values(mockLaptops);
    let bestMatch: LaptopSpecs | null = null;
    let bestScore = 0;

    for (const laptop of laptops) {
      const score = this.calculateMatchScore(laptop, query);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = laptop;
      }
    }

    // If no good match found (score < 0.3), try fuzzy matching
    if (bestScore < 0.3) {
      bestMatch = this.fuzzyMatch(query, laptops);
    }

    return bestMatch || laptops[0];
  }

  private static calculateMatchScore(laptop: LaptopSpecs, query: SearchQuery): number {
    let score = 0;
    const maxScore = 10;

    // Brand matching (high priority)
    if (query.brand && laptop.brand.toLowerCase().includes(query.brand)) {
      score += 3;
    }

    // Model matching
    if (query.model) {
      const laptopName = laptop.name.toLowerCase();
      if (laptopName.includes(query.model)) {
        score += 2;
      }
    }

    // Spec matching
    if (query.specs) {
      for (const spec of query.specs) {
        if (spec === 'intel' && laptop.cpu.toLowerCase().includes('intel')) score += 1;
        if (spec === 'amd' && laptop.cpu.toLowerCase().includes('amd')) score += 1;
        if (spec === 'apple-silicon' && laptop.cpu.toLowerCase().includes('m1') || laptop.cpu.toLowerCase().includes('m2')) score += 1;
        if (spec.includes('gb-ram')) {
          const ramAmount = spec.split('-')[0];
          if (laptop.ram.toLowerCase().includes(ramAmount)) score += 1;
        }
        if (spec === 'gaming' && laptop.price > 1000) score += 0.5;
        if (spec === 'business' && laptop.os.includes('Pro')) score += 0.5;
        if (spec === 'student' && laptop.price < 1200) score += 0.5;
      }
    }

    // General name similarity
    const similarity = this.stringSimilarity(query.normalized, laptop.name.toLowerCase());
    score += similarity * 2;

    return Math.min(score / maxScore, 1);
  }

  private static fuzzyMatch(query: SearchQuery, laptops: LaptopSpecs[]): LaptopSpecs | null {
    let bestMatch: LaptopSpecs | null = null;
    let bestSimilarity = 0;

    for (const laptop of laptops) {
      const nameSimilarity = this.stringSimilarity(
        query.normalized,
        laptop.name.toLowerCase()
      );
      
      const brandSimilarity = this.stringSimilarity(
        query.normalized,
        laptop.brand.toLowerCase()
      );

      const maxSimilarity = Math.max(nameSimilarity, brandSimilarity);
      
      if (maxSimilarity > bestSimilarity && maxSimilarity > 0.3) {
        bestSimilarity = maxSimilarity;
        bestMatch = laptop;
      }
    }

    return bestMatch;
  }

  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static async generateAIComparison(
    laptops: LaptopSpecs[], 
    userType?: string, 
    apiKey?: string
  ): Promise<string> {
    if (!apiKey) {
      console.log('No API key provided, using enhanced mock comparison');
      return this.generateEnhancedMockComparison(laptops, userType);
    }

    try {
      const laptopData = laptops.map(laptop => ({
        name: laptop.name,
        brand: laptop.brand,
        price: laptop.price,
        cpu: laptop.cpu,
        ram: laptop.ram,
        storage: laptop.storage,
        screen: laptop.screen,
        battery: laptop.battery,
        weight: laptop.weight,
        rating: laptop.rating,
        os: laptop.os
      }));

      const userContext = userType ? ` for ${userType} use` : '';
      const prompt = `Compare these laptops${userContext} and provide a detailed analysis:

${JSON.stringify(laptopData, null, 2)}

Please provide:
1. A clear recommendation with reasoning
2. Detailed specs comparison
3. Pros and cons for each laptop
4. Value assessment
5. Best use case for each laptop
6. Final recommendation based on the user type: ${userType || 'general use'}

Format your response with clear sections and be specific about performance expectations.`;

      const messages = [
        { role: 'user' as const, content: prompt }
      ];

      return await generateOpenAIResponse(messages, apiKey);
    } catch (error) {
      console.error('Error generating AI comparison:', error);
      return this.generateEnhancedMockComparison(laptops, userType);
    }
  }

  private static generateEnhancedMockComparison(laptops: LaptopSpecs[], userType?: string): string {
    const sortedByValue = [...laptops].sort((a, b) => {
      const aValue = this.calculateValueScore(a);
      const bValue = this.calculateValueScore(b);
      return bValue - aValue;
    });

    const winner = sortedByValue[0];
    const userContext = userType ? ` for ${userType} use` : '';

    return `# 🎯 Laptop Comparison Analysis${userContext}

## 🏆 **Top Recommendation: ${winner.name}**

${this.getRecommendationReasoning(winner, userType)}

## 📊 **Detailed Specifications**

${laptops.map((laptop, index) => `
### ${index + 1}. ${laptop.name} - $${laptop.price}

**Performance:**
- **CPU:** ${laptop.cpu}
- **RAM:** ${laptop.ram}
- **Storage:** ${laptop.storage}

**Display & Design:**
- **Screen:** ${laptop.screen}
- **Weight:** ${laptop.weight}
- **OS:** ${laptop.os}

**User Experience:**
- **Battery:** ${laptop.battery}
- **Rating:** ${laptop.rating}/5 ⭐ (${laptop.reviewCount} reviews)
- **Availability:** ${laptop.availability}

${this.getPerformanceAssessment(laptop)}
`).join('')}

## ⚖️ **Head-to-Head Comparison**

| Feature | ${laptops.map(l => l.name.split(' ').slice(0, 2).join(' ')).join(' | ')} |
|---------|${laptops.map(() => '---').join('|')}|
| **Price** | ${laptops.map(l => `$${l.price}`).join(' | ')} |
| **CPU Performance** | ${laptops.map(l => this.getCPUScore(l.cpu)).join(' | ')} |
| **RAM** | ${laptops.map(l => l.ram).join(' | ')} |
| **Storage** | ${laptops.map(l => l.storage).join(' | ')} |
| **Portability** | ${laptops.map(l => this.getPortabilityScore(l.weight)).join(' | ')} |
| **Value Score** | ${laptops.map(l => `${this.calculateValueScore(l)}/10`).join(' | ')} |

## ✅ **Pros & Cons Analysis**

${laptops.map(laptop => `
### ${laptop.name}

**✅ Strengths:**
${this.getLaptopPros(laptop, userType).map(pro => `- ${pro}`).join('\n')}

**❌ Considerations:**
${this.getLaptopCons(laptop, userType).map(con => `- ${con}`).join('\n')}
`).join('')}

## 🎯 **Final Recommendation**

${this.getFinalRecommendation(laptops, userType)}

**Best Value:** ${winner.name} - Outstanding ${this.getValueProposition(winner)}
**Budget Range:** $${Math.min(...laptops.map(l => l.price))} - $${Math.max(...laptops.map(l => l.price))}
**Performance Tier:** ${this.getPerformanceTier(laptops)}

---
*Analysis based on current specifications, pricing, and user requirements${userType ? ` for ${userType} use` : ''}*`;
  }

  private static calculateValueScore(laptop: LaptopSpecs): number {
    let score = 5; // Base score
    
    // Performance factors
    if (laptop.cpu.includes('i7') || laptop.cpu.includes('Ryzen 7') || laptop.cpu.includes('M2')) score += 2;
    if (laptop.cpu.includes('i5') || laptop.cpu.includes('Ryzen 5') || laptop.cpu.includes('M1')) score += 1;
    
    // RAM scoring
    const ramAmount = parseInt(laptop.ram.match(/\d+/)?.[0] || '0');
    if (ramAmount >= 16) score += 2;
    else if (ramAmount >= 8) score += 1;
    
    // Storage scoring
    if (laptop.storage.includes('SSD')) score += 1;
    if (laptop.storage.includes('512GB') || laptop.storage.includes('1TB')) score += 1;
    
    // Price factor (inverse relationship)
    if (laptop.price < 1000) score += 1;
    else if (laptop.price > 2000) score -= 1;
    
    // Rating factor
    if (laptop.rating >= 4.5) score += 1;
    
    return Math.min(score, 10);
  }

  private static getRecommendationReasoning(laptop: LaptopSpecs, userType?: string): string {
    const reasons = [];
    
    if (laptop.rating >= 4.5) reasons.push("excellent user ratings");
    if (laptop.cpu.includes('M2') || laptop.cpu.includes('M1')) reasons.push("exceptional performance and efficiency");
    if (laptop.cpu.includes('i7') || laptop.cpu.includes('Ryzen 7')) reasons.push("powerful processing capabilities");
    if (laptop.ram.includes('16GB')) reasons.push("ample memory for multitasking");
    if (laptop.storage.includes('SSD')) reasons.push("fast storage performance");
    if (laptop.price < 1200) reasons.push("competitive pricing");
    
    const userSpecificReason = this.getUserSpecificReason(laptop, userType);
    if (userSpecificReason) reasons.push(userSpecificReason);
    
    return `The **${laptop.name}** stands out with ${reasons.slice(0, 3).join(', ')}, making it the best overall choice in this comparison.`;
  }

  private static getUserSpecificReason(laptop: LaptopSpecs, userType?: string): string {
    switch (userType) {
      case 'student':
        return laptop.price < 1200 ? "student-friendly pricing" : "reliable performance for coursework";
      case 'business':
        return laptop.os.includes('Pro') ? "professional features and security" : "business-ready reliability";
      case 'gamer':
        return laptop.price > 1000 ? "gaming-capable performance" : "decent entry-level gaming potential";
      case 'creative':
        return laptop.screen.includes('OLED') || laptop.screen.includes('Retina') ? "excellent display quality" : "solid creative workflow support";
      default:
        return '';
    }
  }

  private static getCPUScore(cpu: string): string {
    if (cpu.includes('M2')) return 'Excellent';
    if (cpu.includes('M1')) return 'Excellent';
    if (cpu.includes('i7') || cpu.includes('Ryzen 7')) return 'Very Good';
    if (cpu.includes('i5') || cpu.includes('Ryzen 5')) return 'Good';
    return 'Fair';
  }

  private static getPortabilityScore(weight: string): string {
    const weightNum = parseFloat(weight.match(/[\d.]+/)?.[0] || '5');
    if (weightNum < 2.5) return 'Excellent';
    if (weightNum < 3.5) return 'Very Good';
    if (weightNum < 4.5) return 'Good';
    return 'Fair';
  }

  private static getLaptopPros(laptop: LaptopSpecs, userType?: string): string[] {
    const pros = [];
    
    if (laptop.cpu.includes('M1') || laptop.cpu.includes('M2')) pros.push("Exceptional performance and battery efficiency");
    if (laptop.cpu.includes('i7') || laptop.cpu.includes('Ryzen 7')) pros.push("High-performance processor");
    if (laptop.ram.includes('16GB')) pros.push("Generous RAM for smooth multitasking");
    if (laptop.storage.includes('512GB') || laptop.storage.includes('1TB')) pros.push("Ample storage space");
    if (laptop.rating >= 4.5) pros.push(`Outstanding ${laptop.rating}/5 user rating`);
    if (laptop.screen.includes('OLED') || laptop.screen.includes('Retina')) pros.push("Premium display quality");
    if (parseFloat(laptop.weight.match(/[\d.]+/)?.[0] || '5') < 3) pros.push("Lightweight and portable design");
    if (laptop.price < 1200) pros.push("Competitive pricing for the specs");
    
    return pros.slice(0, 4);
  }

  private static getLaptopCons(laptop: LaptopSpecs, userType?: string): string[] {
    const cons = [];
    
    if (laptop.ram.includes('8GB') && !laptop.ram.includes('16GB')) cons.push("Limited RAM may affect heavy multitasking");
    if (laptop.storage.includes('256GB')) cons.push("Storage may be limiting for large files");
    if (laptop.price > 1800) cons.push("Premium pricing");
    if (laptop.brand === 'Apple') cons.push("Limited upgrade options and macOS ecosystem dependency");
    if (!laptop.storage.includes('SSD')) cons.push("Traditional storage may be slower");
    if (parseFloat(laptop.weight.match(/[\d.]+/)?.[0] || '5') > 4) cons.push("Heavier than ultraportable alternatives");
    if (laptop.rating < 4.3) cons.push("Mixed user reviews");
    
    return cons.slice(0, 3);
  }

  private static getFinalRecommendation(laptops: LaptopSpecs[], userType?: string): string {
    const winner = laptops.reduce((prev, current) => 
      this.calculateValueScore(current) > this.calculateValueScore(prev) ? current : prev
    );

    const budget = laptops.find(l => l.price < 1000);
    const premium = laptops.find(l => l.price > 1500);

    let recommendation = `For most users, the **${winner.name}** offers the best combination of performance, features, and value.`;

    if (userType === 'student' && budget) {
      recommendation += ` However, students on a tight budget should strongly consider the **${budget.name}** for excellent value.`;
    } else if (userType === 'business' && premium) {
      recommendation += ` For professional users requiring maximum performance, the **${premium.name}** provides enterprise-grade capabilities.`;
    } else if (userType === 'creative' && premium) {
      recommendation += ` Creative professionals will benefit from the **${premium.name}**'s superior display and processing power.`;
    }

    return recommendation;
  }

  private static getValueProposition(laptop: LaptopSpecs): string {
    if (laptop.price < 1000) return "performance per dollar";
    if (laptop.cpu.includes('M1') || laptop.cpu.includes('M2')) return "efficiency and performance";
    if (laptop.rating >= 4.7) return "user satisfaction and reliability";
    return "balanced features and pricing";
  }

  private static getPerformanceTier(laptops: LaptopSpecs[]): string {
    const avgPrice = laptops.reduce((sum, laptop) => sum + laptop.price, 0) / laptops.length;
    
    if (avgPrice > 1800) return "Premium/Professional";
    if (avgPrice > 1200) return "Mid-to-High Range";
    if (avgPrice > 800) return "Mid-Range";
    return "Budget-Friendly";
  }

  private static getPerformanceAssessment(laptop: LaptopSpecs): string {
    const assessments = [];
    
    if (laptop.cpu.includes('M1') || laptop.cpu.includes('M2')) {
      assessments.push("🚀 **Exceptional Performance**: Industry-leading efficiency and speed");
    } else if (laptop.cpu.includes('i7') || laptop.cpu.includes('Ryzen 7')) {
      assessments.push("⚡ **High Performance**: Excellent for demanding tasks and multitasking");
    } else if (laptop.cpu.includes('i5') || laptop.cpu.includes('Ryzen 5')) {
      assessments.push("✅ **Solid Performance**: Great for everyday computing and light professional work");
    }

    if (laptop.ram.includes('16GB')) {
      assessments.push("💾 **Future-Proof Memory**: Handles multiple applications smoothly");
    }

    if (laptop.storage.includes('SSD')) {
      assessments.push("⚡ **Fast Storage**: Quick boot times and responsive file access");
    }

    return assessments.join('\n');
  }
}