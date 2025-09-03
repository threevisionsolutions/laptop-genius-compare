import { ImprovedWebScrapingService } from './improvedWebScraping';
import { MetaExtractor } from './metadataExtractor';

export interface TavilyResult {
  title: string;
  url: string;
  content?: string;
  score?: number;
  images?: string[];
}

export class TavilyService {
  private static readonly API_URL = 'https://api.tavily.com/search';
  private static readonly PROXY_URL = '/functions/v1/tavily-search';

  static async search(query: string, apiKey: string, limit = 5, includeDomains?: string[]): Promise<TavilyResult[]> {
    if (!apiKey) throw new Error('Tavily API key is required');

    const body: any = {
      api_key: apiKey,
      query,
      search_depth: 'basic',
      include_answer: false,
      include_images: true,
      max_results: Math.min(Math.max(limit, 1), 10),
    };

    if (includeDomains && includeDomains.length) {
      body.include_domains = includeDomains;
    }

    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Tavily search failed: ${res.status} ${err}`);
    }

    const data = await res.json();
    const results: TavilyResult[] = (data.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
      images: r.images,
    }));

    return results;
  }

  static async searchProxy(query: string, limit = 5, includeDomains?: string[], apiKey?: string): Promise<TavilyResult[]> {
    const payload: any = {
      query,
      limit: Math.min(Math.max(limit, 1), 10),
      includeDomains: includeDomains && includeDomains.length ? includeDomains : undefined,
      includeImages: true,
      include_answer: false,
      search_depth: 'basic',
    };

    try {
      const res = await fetch(this.PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        console.warn(`Tavily proxy failed: ${res.status} ${err}`);
        
        // Fallback to direct API if proxy fails and we have API key
        if (apiKey) {
          console.log('Falling back to direct Tavily API');
          return await this.search(query, apiKey, limit, includeDomains);
        }
        throw new Error(`Tavily proxy failed: ${res.status} ${err}`);
      }

      const data = await res.json();
      const results: TavilyResult[] = (data.results || []).map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
        images: r.images,
      }));

      return results;
    } catch (error) {
      // If proxy fails and we have API key, try direct API as fallback
      if (apiKey) {
        console.log('Proxy error, falling back to direct Tavily API:', error);
        return await this.search(query, apiKey, limit, includeDomains);
      }
      throw error;
    }
  }

  static async searchBrandProductUrls(brand: string, apiKey?: string, limit = 3): Promise<string[]> {
    const normalized = brand.toLowerCase();
    const brandSynonyms = this.getBrandSynonyms(brand);
    const domains = [`${normalized}.com`];
    
    // Add additional brand-specific domains
    if (normalized === 'apple') domains.push('apple.com');
    if (normalized === 'dell') domains.push('dell.com', 'dell.co.uk');
    if (normalized === 'hp') domains.push('hp.com', 'store.hp.com');
    if (normalized === 'lenovo') domains.push('lenovo.com', 'shoplenovo.com');
    
    // Enhanced query with brand synonyms and specific product terms
    const brandTerms = brandSynonyms.join(' OR ');
    const query = `(${brandTerms}) (laptop OR notebook OR gaming laptop OR ultrabook) (2024 OR 2023 OR latest OR new) site:(${domains.join(' OR site:')})`;

    try {
      const results = apiKey
        ? await this.search(query, apiKey, limit * 3, domains)
        : await this.searchProxy(query, limit * 3, domains, apiKey);
      
      const urls = results
        .map(r => r.url)
        .filter(u => typeof u === 'string')
        .filter(u => domains.some(domain => u.includes(domain)))
        .filter(u => /\b(laptop|macbook|notebook|xps|thinkpad|spectre|zenbook|vivobook|ideapad|gaming|inspiron|pavilion)\b/i.test(u))
        .filter(u => !u.includes('/support/') && !u.includes('/driver/'))
        .map(u => u.split('#')[0]);

      // De-duplicate and cap to limit
      return Array.from(new Set(urls)).slice(0, limit);
    } catch (e) {
      console.warn('Tavily brand search failed:', e);
      return [];
    }
  }

  private static getBrandSynonyms(brand: string): string[] {
    const synonyms: Record<string, string[]> = {
      dell: ['Dell', 'XPS', 'Inspiron', 'Latitude', 'Precision', 'Alienware'],
      apple: ['Apple', 'MacBook', 'MacBook Pro', 'MacBook Air', 'Mac'],
      hp: ['HP', 'Hewlett Packard', 'Pavilion', 'Envy', 'Spectre', 'EliteBook'],
      lenovo: ['Lenovo', 'ThinkPad', 'IdeaPad', 'Yoga', 'Legion'],
      asus: ['ASUS', 'ZenBook', 'VivoBook', 'ROG', 'TUF Gaming'],
      acer: ['Acer', 'Aspire', 'Swift', 'Predator', 'Nitro'],
      msi: ['MSI', 'Gaming', 'Creator', 'Modern', 'Prestige']
    };
    
    const normalized = brand.toLowerCase();
    return synonyms[normalized] || [brand];
  }

  // Structured search: returns Gemini-friendly JSON with enriched product metadata
  static async searchStructured(query: string, limit = 5, apiKey?: string): Promise<{
    query: string;
    fetchedAt: string;
    products: Array<{
      title: string;
      url: string;
      images: string[];
      description?: string;
      price?: { amount: number; currency: string };
      brand?: string;
      specs?: { cpu?: string; ram?: string; storage?: string; screen?: string; os?: string };
      source?: { score?: number };
    }>;
  }> {
    // Extract brand from query for better targeting
    const detectedBrand = this.extractBrandFromQuery(query);
    const enhancedQuery = this.enhanceQueryForBrand(query, detectedBrand);
    
    console.log(`Enhanced Tavily query: "${enhancedQuery}" for brand: ${detectedBrand || 'any'}`);
    
    const results = apiKey
      ? await this.search(enhancedQuery, apiKey, limit)
      : await this.searchProxy(enhancedQuery, limit, undefined, apiKey);

    const products = await Promise.all(
      results.map(async (r) => {
        const [scraped, meta] = await Promise.all([
          ImprovedWebScrapingService.scrapeLaptopFromUrl(r.url),
          MetaExtractor.getPageMetadata(r.url),
        ]);

        const images = Array.from(new Set([...(r.images || []), ...(meta.images || [])])).slice(0, 6);
        const title = scraped?.name || meta.title || r.title;
        const description = meta.description || r.content;

        const price = scraped?.price ? { amount: scraped.price, currency: scraped.currency } : undefined;
        const specs = scraped
          ? { cpu: scraped.cpu, ram: scraped.ram, storage: scraped.storage, screen: scraped.screen, os: scraped.os }
          : undefined;

        // Extract rating from content or use default
        const ratingMatch = (r.content || '').match(/(\d\.?\d?)\s*\/?\s*5?\s*stars?/i) || 
                           (r.content || '').match(/rating[:\s]*(\d\.?\d?)/i);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : (scraped?.rating || 4.2);

        // Extract review count from content
        const reviewMatch = (r.content || '').match(/(\d+)\s*reviews?/i);
        const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : 150;

        // Extract brand from URL if not found in scraped data
        const brand = scraped?.brand || this.extractBrandFromUrl(r.url) || detectedBrand;

        return {
          title,
          url: r.url,
          images,
          description,
          price,
          brand,
          specs,
          rating,
          reviewCount,
          source: { score: r.score },
        };
      })
    );

    // Filter products by brand if specific brand was requested
    const filteredProducts = detectedBrand 
      ? products.filter(p => 
          p.brand?.toLowerCase().includes(detectedBrand.toLowerCase()) ||
          p.title?.toLowerCase().includes(detectedBrand.toLowerCase()) ||
          p.url?.toLowerCase().includes(detectedBrand.toLowerCase())
        )
      : products;

    return { query, fetchedAt: new Date().toISOString(), products: filteredProducts };
  }

  private static extractBrandFromQuery(query: string): string | null {
    const brands = ['dell', 'apple', 'hp', 'lenovo', 'asus', 'acer', 'msi', 'samsung', 'microsoft', 'lg', 'alienware'];
    const lowerQuery = query.toLowerCase();
    
    for (const brand of brands) {
      if (lowerQuery.includes(brand)) {
        return brand;
      }
    }
    
    // Check for specific product lines
    if (lowerQuery.includes('macbook')) return 'apple';
    if (lowerQuery.includes('thinkpad')) return 'lenovo';
    if (lowerQuery.includes('xps')) return 'dell';
    if (lowerQuery.includes('pavilion') || lowerQuery.includes('envy') || lowerQuery.includes('spectre')) return 'hp';
    if (lowerQuery.includes('zenbook') || lowerQuery.includes('vivobook')) return 'asus';
    
    return null;
  }

  private static enhanceQueryForBrand(query: string, brand: string | null): string {
    if (!brand) return query + ' laptop 2024 specs price';
    
    const brandDomains: Record<string, string> = {
      dell: 'site:dell.com OR site:amazon.com OR site:bestbuy.com',
      apple: 'site:apple.com OR site:amazon.com OR site:bestbuy.com',
      hp: 'site:hp.com OR site:store.hp.com OR site:amazon.com',
      lenovo: 'site:lenovo.com OR site:amazon.com OR site:bestbuy.com',
      asus: 'site:asus.com OR site:amazon.com OR site:newegg.com',
      acer: 'site:acer.com OR site:amazon.com OR site:bestbuy.com',
      msi: 'site:msi.com OR site:amazon.com OR site:newegg.com'
    };
    
    const domainFilter = brandDomains[brand.toLowerCase()] || '';
    return `${query} ${brand} laptop 2024 specs price ${domainFilter}`;
  }

  private static extractBrandFromUrl(url: string): string | null {
    const urlBrands: Record<string, string> = {
      'dell.com': 'Dell',
      'apple.com': 'Apple', 
      'hp.com': 'HP',
      'lenovo.com': 'Lenovo',
      'asus.com': 'ASUS',
      'acer.com': 'Acer',
      'msi.com': 'MSI',
      'samsung.com': 'Samsung',
      'microsoft.com': 'Microsoft'
    };
    
    for (const [domain, brand] of Object.entries(urlBrands)) {
      if (url.includes(domain)) {
        return brand;
      }
    }
    
    return null;
  }
}
