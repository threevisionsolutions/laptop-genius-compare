import { LaptopSpecs } from '../types/laptop';

interface ScrapedLaptopData {
  name?: string;
  brand?: string;
  price?: number;
  currency?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  screen?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  availability?: string;
}

export class WebScrapingService {
  
  static async scrapeLaptopFromUrl(url: string): Promise<LaptopSpecs | null> {
    try {
      console.log(`Scraping laptop data from: ${url}`);
      
      // Simulate web scraping with enhanced patterns
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch website content');
      }

      const content = await response.text();
      
      // Parse the content to extract laptop specifications
      const laptopData = this.parseContent(content, url);
      
      if (!laptopData) {
        console.warn(`Could not extract laptop data from ${url}`);
        return null;
      }

      // Convert to LaptopSpecs format
      return this.convertToLaptopSpecs(laptopData, url);
      
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return null;
    }
  }

  private static parseContent(content: string, url: string): ScrapedLaptopData | null {
    const data: ScrapedLaptopData = {};
    const lowerContent = content.toLowerCase();

    // Detect retailer and use specific parsing logic
    if (url.includes('amazon.')) {
      return this.parseAmazonContent(content);
    } else if (url.includes('bestbuy.')) {
      return this.parseBestBuyContent(content);
    } else if (url.includes('newegg.')) {
      return this.parseNeweggContent(content);
    } else if (url.includes('apple.com')) {
      return this.parseAppleContent(content);
    } else if (url.includes('dell.com')) {
      return this.parseDellContent(content);
    } else {
      return this.parseGenericContent(content);
    }
  }

  private static parseAmazonContent(content: string): ScrapedLaptopData | null {
    const data: ScrapedLaptopData = {};
    
    // Extract title/name
    const titleMatch = content.match(/productTitle[^>]*>([^<]+)/i) || 
                      content.match(/<title>([^<]*laptop[^<]*)/i);
    if (titleMatch) {
      data.name = titleMatch[1].trim().replace(' - Amazon.com', '');
    }

    // Extract price
    const priceMatch = content.match(/\$[\d,]+\.?\d*/g);
    if (priceMatch) {
      const price = priceMatch[0].replace(/[$,]/g, '');
      data.price = parseFloat(price);
      data.currency = '$';
    }

    // Extract specs from bullet points or description
    this.extractCommonSpecs(content, data);
    
    // Extract rating
    const ratingMatch = content.match(/(\d+\.?\d*)\s*out of 5/i);
    if (ratingMatch) {
      data.rating = parseFloat(ratingMatch[1]);
    }

    return Object.keys(data).length > 0 ? data : null;
  }

  private static parseBestBuyContent(content: string): ScrapedLaptopData | null {
    const data: ScrapedLaptopData = {};
    
    // Extract title
    const titleMatch = content.match(/<h1[^>]*>([^<]*laptop[^<]*)/i) ||
                      content.match(/productTitle[^>]*>([^<]+)/i);
    if (titleMatch) {
      data.name = titleMatch[1].trim();
    }

    // Extract price
    const priceMatch = content.match(/current price[^$]*\$([0-9,]+\.?\d*)/i) ||
                      content.match(/\$([0-9,]+\.?\d*)/);
    if (priceMatch) {
      data.price = parseFloat(priceMatch[1].replace(/,/g, ''));
      data.currency = '$';
    }

    this.extractCommonSpecs(content, data);
    
    return Object.keys(data).length > 0 ? data : null;
  }

  private static parseNeweggContent(content: string): ScrapedLaptopData | null {
    const data: ScrapedLaptopData = {};
    
    // Similar parsing logic for Newegg
    const titleMatch = content.match(/<h1[^>]*>([^<]*)/i);
    if (titleMatch) {
      data.name = titleMatch[1].trim();
    }

    const priceMatch = content.match(/\$([0-9,]+\.?\d*)/);
    if (priceMatch) {
      data.price = parseFloat(priceMatch[1].replace(/,/g, ''));
      data.currency = '$';
    }

    this.extractCommonSpecs(content, data);
    
    return Object.keys(data).length > 0 ? data : null;
  }

  private static parseAppleContent(content: string): ScrapedLaptopData | null {
    const data: ScrapedLaptopData = {};
    data.brand = 'Apple';
    
    // Apple-specific parsing
    const titleMatch = content.match(/MacBook[^<\n]*/i);
    if (titleMatch) {
      data.name = titleMatch[0].trim();
    }

    const priceMatch = content.match(/from \$([0-9,]+)/i) ||
                      content.match(/\$([0-9,]+)/);
    if (priceMatch) {
      data.price = parseFloat(priceMatch[1].replace(/,/g, ''));
      data.currency = '$';
    }

    this.extractCommonSpecs(content, data);
    
    return Object.keys(data).length > 0 ? data : null;
  }

  private static parseDellContent(content: string): ScrapedLaptopData | null {
    const data: ScrapedLaptopData = {};
    data.brand = 'Dell';
    
    const titleMatch = content.match(/<h1[^>]*>([^<]*)/i);
    if (titleMatch) {
      data.name = titleMatch[1].trim();
    }

    const priceMatch = content.match(/\$([0-9,]+\.?\d*)/);
    if (priceMatch) {
      data.price = parseFloat(priceMatch[1].replace(/,/g, ''));
      data.currency = '$';
    }

    this.extractCommonSpecs(content, data);
    
    return Object.keys(data).length > 0 ? data : null;
  }

  private static parseGenericContent(content: string): ScrapedLaptopData | null {
    const data: ScrapedLaptopData = {};
    
    // Generic parsing for unknown retailers
    const titleMatch = content.match(/<title>([^<]*laptop[^<]*)/i) ||
                      content.match(/<h1[^>]*>([^<]*laptop[^<]*)/i);
    if (titleMatch) {
      data.name = titleMatch[1].trim();
    }

    const priceMatch = content.match(/\$([0-9,]+\.?\d*)/);
    if (priceMatch) {
      data.price = parseFloat(priceMatch[1].replace(/,/g, ''));
      data.currency = '$';
    }

    this.extractCommonSpecs(content, data);
    
    return Object.keys(data).length > 0 ? data : null;
  }

  private static extractCommonSpecs(content: string, data: ScrapedLaptopData): void {
    const lowerContent = content.toLowerCase();

    // Extract CPU
    const cpuPatterns = [
      /intel core i[3579][- ]?\d*[a-z]*/gi,
      /amd ryzen [3579][- ]?\d*[a-z]*/gi,
      /apple m[12][- ]?(max|pro|ultra)?/gi,
      /intel celeron[^,\n]*/gi,
      /intel pentium[^,\n]*/gi
    ];
    
    for (const pattern of cpuPatterns) {
      const match = content.match(pattern);
      if (match) {
        data.cpu = match[0].trim();
        break;
      }
    }

    // Extract RAM
    const ramMatch = content.match(/(\d+)\s*gb\s*(ram|memory|lpddr|ddr)/gi);
    if (ramMatch) {
      const ramValue = ramMatch[0];
      data.ram = ramValue.toUpperCase().replace(/\s+/g, ' ');
    }

    // Extract Storage
    const storagePatterns = [
      /(\d+)\s*(gb|tb)\s*(ssd|nvme|pcie)/gi,
      /(\d+)\s*(gb|tb)\s*storage/gi,
      /(\d+)\s*(gb|tb)\s*hard drive/gi
    ];
    
    for (const pattern of storagePatterns) {
      const match = content.match(pattern);
      if (match) {
        data.storage = match[0].toUpperCase().replace(/\s+/g, ' ');
        break;
      }
    }

    // Extract Screen
    const screenMatch = content.match(/(\d+\.?\d*)["\s]*(inch|in).*?(\d{3,4}\s*x\s*\d{3,4})/gi) ||
                       content.match(/(\d+\.?\d*)["\s]*(inch|in)/gi);
    if (screenMatch) {
      data.screen = screenMatch[0];
    }

    // Extract brand if not already set
    if (!data.brand) {
      const brandPatterns = [
        /apple/gi, /dell/gi, /hp/gi, /lenovo/gi, /asus/gi, 
        /acer/gi, /msi/gi, /samsung/gi, /microsoft/gi, /lg/gi
      ];
      
      for (const pattern of brandPatterns) {
        if (pattern.test(content)) {
          data.brand = pattern.source.charAt(0).toUpperCase() + pattern.source.slice(1).toLowerCase();
          break;
        }
      }
    }
  }

  private static convertToLaptopSpecs(data: ScrapedLaptopData, url: string): LaptopSpecs {
    const id = this.generateIdFromUrl(url);
    
    return {
      id,
      name: data.name || 'Unknown Laptop',
      brand: data.brand || 'Unknown',
      price: data.price || 0,
      currency: data.currency || '$',
      image: data.image || '/placeholder.svg',
      cpu: data.cpu || 'Not specified',
      ram: data.ram || 'Not specified',
      storage: data.storage || 'Not specified',
      screen: data.screen || 'Not specified',
      battery: 'Not specified',
      weight: 'Not specified',
      os: this.inferOS(data.brand, data.name),
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      seller: this.extractSellerFromUrl(url),
      availability: data.availability || 'Unknown',
      url
    };
  }

  private static generateIdFromUrl(url: string): string {
    return url.split('/').pop()?.split('?')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 
           Math.random().toString(36).substr(2, 9);
  }

  private static inferOS(brand?: string, name?: string): string {
    if (brand?.toLowerCase() === 'apple' || name?.toLowerCase().includes('macbook')) {
      return 'macOS';
    }
    return 'Windows 11';
  }

  private static extractSellerFromUrl(url: string): string {
    if (url.includes('amazon.')) return 'Amazon';
    if (url.includes('bestbuy.')) return 'Best Buy';
    if (url.includes('newegg.')) return 'Newegg';
    if (url.includes('apple.com')) return 'Apple Store';
    if (url.includes('dell.com')) return 'Dell';
    if (url.includes('hp.com')) return 'HP';
    if (url.includes('lenovo.com')) return 'Lenovo';
    
    const domain = new URL(url).hostname;
    return domain.replace('www.', '').split('.')[0];
  }

  static validateLaptopUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();
      
      // Check if it's from a known retailer
      const knownRetailers = [
        'amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de',
        'bestbuy.com', 'newegg.com', 'apple.com', 'dell.com',
        'hp.com', 'lenovo.com', 'asus.com', 'acer.com',
        'microsoft.com', 'costco.com', 'walmart.com'
      ];
      
      const isKnownRetailer = knownRetailers.some(retailer => 
        hostname.includes(retailer)
      );
      
      // Check if URL likely contains laptop-related content
      const laptopKeywords = [
        'laptop', 'notebook', 'macbook', 'thinkpad', 'inspiron',
        'pavilion', 'envy', 'zenbook', 'vivobook', 'ideapad'
      ];
      
      const hasLaptopKeywords = laptopKeywords.some(keyword =>
        pathname.includes(keyword) || urlObj.search.toLowerCase().includes(keyword)
      );
      
      return isKnownRetailer || hasLaptopKeywords;
    } catch {
      return false;
    }
  }
}