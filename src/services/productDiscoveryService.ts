import { TavilyService } from './tavilyService';

export class ProductDiscoveryService {
  private static BRAND_DOMAINS: Record<string, string> = {
    apple: 'apple.com',
    dell: 'dell.com',
    hp: 'hp.com',
    lenovo: 'lenovo.com',
    asus: 'asus.com',
    acer: 'acer.com',
    msi: 'msi.com',
    microsoft: 'microsoft.com',
    samsung: 'samsung.com',
  };

  // Enhanced product discovery that returns structured data optimized for Gemini
  static async discoverStructuredProducts(brand: string, limit = 3, tavilyApiKey?: string): Promise<any> {
    console.log(`🔍 Discovering structured products for: ${brand}`);
    
    try {
      // Enhanced query with brand-specific terms
      const brandTerms = this.getBrandSpecificTerms(brand);
      const query = `${brand} ${brandTerms} laptop 2024 gaming business ultrabook specs price reviews`;
      
      console.log(`🎯 Using enhanced query: "${query}"`);
      const structuredData = await TavilyService.searchStructured(query, limit, tavilyApiKey);
      
      if (structuredData && structuredData.products && structuredData.products.length > 0) {
        // Filter products to ensure brand match
        const brandFilteredProducts = structuredData.products.filter((product: any) => {
          const productBrand = product.brand?.toLowerCase() || '';
          const productTitle = product.title?.toLowerCase() || '';
          const productUrl = product.url?.toLowerCase() || '';
          const requestedBrand = brand.toLowerCase();
          
          return productBrand.includes(requestedBrand) || 
                 productTitle.includes(requestedBrand) ||
                 productUrl.includes(requestedBrand) ||
                 this.matchesBrandKeywords(productTitle, brand);
        });
        
        console.log(`✅ Found ${brandFilteredProducts.length}/${structuredData.products.length} brand-matched products from Tavily`);
        
        if (brandFilteredProducts.length > 0) {
          return {
            source: 'tavily',
            products: brandFilteredProducts,
            query: query
          };
        }
        
        console.log('⚠️ No brand-matched products found, falling back');
      }
    } catch (e) {
      console.warn('❌ Tavily structured search failed:', e);
    }

    // Fallback: get URLs and convert to structured format
    console.log('🔄 Falling back to URL discovery method');
    const urls = await this.discoverProductUrls(brand, limit, tavilyApiKey);
    return {
      source: 'fallback',
      products: [],
      urls: urls,
      query: `${brand} laptops`
    };
  }

  private static getBrandSpecificTerms(brand: string): string {
    const brandTerms: Record<string, string> = {
      'dell': 'XPS Inspiron Alienware gaming business',
      'apple': 'MacBook Pro Air M2 M3',
      'hp': 'Pavilion Envy Spectre EliteBook gaming',
      'lenovo': 'ThinkPad IdeaPad Yoga Legion gaming',
      'asus': 'ZenBook VivoBook ROG gaming TUF',
      'acer': 'Aspire Swift Predator Nitro gaming',
      'msi': 'Gaming Creator Modern Prestige'
    };
    
    return brandTerms[brand.toLowerCase()] || '';
  }

  private static matchesBrandKeywords(title: string, brand: string): boolean {
    const brandKeywords: Record<string, string[]> = {
      'dell': ['xps', 'inspiron', 'alienware', 'latitude', 'precision'],
      'apple': ['macbook', 'mac'],
      'hp': ['pavilion', 'envy', 'spectre', 'elitebook', 'omen'],
      'lenovo': ['thinkpad', 'ideapad', 'yoga', 'legion'],
      'asus': ['zenbook', 'vivobook', 'rog', 'tuf'],
      'acer': ['aspire', 'swift', 'predator', 'nitro'],
      'msi': ['gaming', 'creator', 'modern', 'prestige']
    };
    
    const keywords = brandKeywords[brand.toLowerCase()] || [];
    return keywords.some(keyword => title.includes(keyword));
  }

  // Original method for backward compatibility
  static async discoverProductUrls(brand: string, limit = 3, tavilyApiKey?: string): Promise<string[]> {
    const normalized = brand.toLowerCase();
    const domain = this.BRAND_DOMAINS[normalized] || `${normalized}.com`;

    // Try Tavily via proxy (uses server-side key). If a client key is provided, it will be used directly.
    try {
      const tavilyUrls = await TavilyService.searchBrandProductUrls(brand, tavilyApiKey, limit);
      if (tavilyUrls.length) return tavilyUrls;
    } catch (e) {
      console.warn('Tavily discovery failed, falling back:', e);
    }

    // Try DuckDuckGo fallback
    try {
      const query = `site:${domain} (laptop OR notebook) (buy OR product OR shop)`;
      const target = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy failed: ${res.status}`);
      
      const data = await res.json();
      const html: string = data.contents || '';

      // Extract result links; prefer direct links (uddg param contains the real URL)
      const urls = new Set<string>();
      const anchorRegex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
      let match: RegExpExecArray | null;
      while ((match = anchorRegex.exec(html))) {
        const href = match[1];
        // DuckDuckGo result links often contain 'uddg=' real URL param
        const uddgMatch = href.match(/[?&]uddg=([^&]+)/i);
        const decoded = uddgMatch ? decodeURIComponent(uddgMatch[1]) : href;
        if (decoded.includes(domain) && /\b(laptop|macbook|notebook)\b/i.test(decoded)) {
          urls.add(decoded.split('#')[0]);
        }
        if (urls.size >= limit) break;
      }

      const discoveredUrls = Array.from(urls).slice(0, limit);
      if (discoveredUrls.length > 0) return discoveredUrls;
    } catch (e) {
      console.warn('DuckDuckGo fallback failed:', e);
    }

    // Final fallback: return mock URLs that will trigger mock data generation
    console.log(`Using mock URLs for brand: ${brand}`);
    return this.getMockUrlsForBrand(brand, limit);
  }

  // Generate mock URLs that will trigger the enhanced laptop service to return mock data
  private static getMockUrlsForBrand(brand: string, limit: number): string[] {
    const normalized = brand.toLowerCase();
    const mockUrls: string[] = [];
    
    const models = this.getBrandModels(normalized);
    for (let i = 0; i < Math.min(limit, models.length); i++) {
      mockUrls.push(`https://${normalized}.com/laptops/${models[i]}-mock-${i + 1}`);
    }
    
    return mockUrls;
  }

  private static getBrandModels(brand: string): string[] {
    const brandModels: Record<string, string[]> = {
      apple: ['macbook-air-m2', 'macbook-pro-14', 'macbook-pro-16'],
      dell: ['xps-13-plus', 'inspiron-15', 'latitude-7430'],
      hp: ['spectre-x360', 'pavilion-15', 'envy-x360'],
      lenovo: ['thinkpad-x1-carbon', 'ideapad-5', 'yoga-7i'],
      asus: ['zenbook-14-oled', 'vivobook-pro', 'rog-strix-g15'],
      acer: ['swift-3', 'aspire-5', 'predator-helios'],
      msi: ['stealth-15m', 'katana-gf66', 'creator-z16'],
      microsoft: ['surface-laptop-5', 'surface-pro-9', 'surface-book'],
      samsung: ['galaxy-book-3', 'galaxy-book-pro', 'galaxy-book-2'],
    };
    
    return brandModels[brand] || ['laptop-model-1', 'laptop-model-2', 'laptop-model-3'];
  }
}
