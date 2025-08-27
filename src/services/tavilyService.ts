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

  static async searchProxy(query: string, limit = 5, includeDomains?: string[]): Promise<TavilyResult[]> {
    const payload: any = {
      query,
      limit: Math.min(Math.max(limit, 1), 10),
      includeDomains: includeDomains && includeDomains.length ? includeDomains : undefined,
      includeImages: true,
      include_answer: false,
      search_depth: 'basic',
    };

    const res = await fetch(this.PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
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
  }

  static async searchBrandProductUrls(brand: string, apiKey?: string, limit = 3): Promise<string[]> {
    const normalized = brand.toLowerCase();
    const domain = `${normalized}.com`;
    const query = `site:${domain} (laptop OR notebook) (buy OR product OR shop OR series)`;

    try {
      const results = apiKey
        ? await this.search(query, apiKey, limit * 2, [domain])
        : await this.searchProxy(query, limit * 2, [domain]);
      const urls = results
        .map(r => r.url)
        .filter(u => typeof u === 'string')
        .filter(u => u.includes(domain))
        .filter(u => /\b(laptop|macbook|notebook|xps|thinkpad|spectre|zenbook|vivobook|ideapad)\b/i.test(u))
        .map(u => u.split('#')[0]);

      // De-duplicate and cap to limit
      return Array.from(new Set(urls)).slice(0, limit);
    } catch (e) {
      console.warn('Tavily brand search failed:', e);
      return [];
    }
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
    const results = apiKey
      ? await this.search(query, apiKey, limit)
      : await this.searchProxy(query, limit);

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

        return {
          title,
          url: r.url,
          images,
          description,
          price,
          brand: scraped?.brand,
          specs,
          source: { score: r.score },
        };
      })
    );

    return { query, fetchedAt: new Date().toISOString(), products };
  }
}
