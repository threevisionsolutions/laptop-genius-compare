import { LaptopSpecs } from '../types/laptop';
import { TavilyService } from './tavilyService';
import { ImprovedWebScrapingService } from './improvedWebScraping';

export class RealDataService {
  private static readonly TAVILY_API_KEY = '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'; // Public key for demo

  /**
   * Attempts to fetch real laptop data using multiple strategies
   */
  static async fetchRealLaptopData(query: string): Promise<LaptopSpecs[]> {
    console.log('🔍 Fetching real data for:', query);
    
    const results: LaptopSpecs[] = [];
    
    try {
      // Strategy 1: Direct URL scraping if it's a URL
      if (this.isUrl(query)) {
        console.log('📄 Attempting direct URL scraping...');
        const scrapedData = await ImprovedWebScrapingService.scrapeLaptopFromUrl(query);
        if (scrapedData && this.isValidLaptopData(scrapedData)) {
          console.log('✅ Direct scraping successful');
          results.push(scrapedData);
          return results;
        }
      }

      // Strategy 2: Search for product pages using Tavily
      console.log('🌐 Searching for product pages...');
      const searchResults = await TavilyService.searchProxy(
        `${query} laptop specifications reviews price`, 
        5,
        ['amazon.com', 'bestbuy.com', 'newegg.com', 'dell.com', 'hp.com', 'lenovo.com', 'apple.com']
      );

      if (searchResults && searchResults.length > 0) {
        console.log(`📊 Found ${searchResults.length} potential product pages`);
        
        // Try to scrape the most promising results
        for (const result of searchResults.slice(0, 3)) {
          try {
            const scrapedData = await ImprovedWebScrapingService.scrapeLaptopFromUrl(result.url);
            if (scrapedData && this.isValidLaptopData(scrapedData)) {
              console.log(`✅ Successfully scraped: ${scrapedData.name}`);
              results.push(scrapedData);
              
              // If we found good data, return it
              if (results.length >= 1) break;
            }
          } catch (error) {
            console.warn(`❌ Failed to scrape ${result.url}:`, error);
          }
        }
      }

      // Strategy 3: Use structured search as fallback
      if (results.length === 0) {
        console.log('🤖 Attempting structured search...');
        const structuredData = await TavilyService.searchStructured(query, 3);
        
        if (structuredData?.products && structuredData.products.length > 0) {
          for (const product of structuredData.products) {
            const laptopSpec = this.convertToLaptopSpecs(product, query);
            if (laptopSpec) {
              results.push(laptopSpec);
            }
          }
        }
      }

    } catch (error) {
      console.error('🚨 Error in fetchRealLaptopData:', error);
    }

    console.log(`📈 Real data fetch complete. Found ${results.length} results`);
    return results;
  }

  /**
   * Converts structured search results to LaptopSpecs format
   */
  private static convertToLaptopSpecs(product: any, originalQuery: string): LaptopSpecs | null {
    try {
      return {
        id: this.generateId(product.title || originalQuery),
        name: product.title || `Laptop - ${originalQuery}`,
        brand: product.brand || this.extractBrand(product.title || ''),
        price: product.price?.amount || 999,
        currency: product.price?.currency || '$',
        image: product.images?.[0] || `https://placehold.co/600x400/333333/FFFFFF/png?text=${encodeURIComponent((product.brand || this.extractBrand(product.title || '') || 'Laptop') + ' Laptop')}`,
        cpu: product.specs?.cpu || 'Intel Core i5',
        ram: product.specs?.ram || '8GB',
        storage: product.specs?.storage || '256GB SSD',
        screen: product.specs?.screen || '14" FHD',
        battery: 'Up to 8 hours',
        weight: '3.5 lbs',
        os: product.specs?.os || 'Windows 11',
        rating: product.rating || 4.2,
        reviewCount: product.reviewCount || 100,
        seller: this.extractSeller(product.url || ''),
        availability: 'Available',
        url: product.url || '#'
      };
    } catch (error) {
      console.error('Error converting product to LaptopSpecs:', error);
      return null;
    }
  }

  /**
   * Validates if laptop data contains essential information
   */
  private static isValidLaptopData(laptop: LaptopSpecs): boolean {
    return !!(
      laptop.name && 
      laptop.name.length > 5 &&
      laptop.brand &&
      laptop.price > 0 &&
      laptop.cpu &&
      laptop.ram
    );
  }

  /**
   * Checks if a string is a valid URL
   */
  private static isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extracts brand from product title
   */
  private static extractBrand(title: string): string {
    const brands = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Microsoft', 'Samsung', 'Razer'];
    for (const brand of brands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    return 'Unknown';
  }

  /**
   * Extracts seller from URL
   */
  private static extractSeller(url: string): string {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('amazon')) return 'Amazon';
      if (hostname.includes('bestbuy')) return 'Best Buy';
      if (hostname.includes('newegg')) return 'Newegg';
      if (hostname.includes('dell')) return 'Dell';
      if (hostname.includes('hp')) return 'HP';
      if (hostname.includes('lenovo')) return 'Lenovo';
      if (hostname.includes('apple')) return 'Apple';
      return 'Retailer';
    } catch {
      return 'Store';
    }
  }

  /**
   * Generates a unique ID for a laptop
   */
  private static generateId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}