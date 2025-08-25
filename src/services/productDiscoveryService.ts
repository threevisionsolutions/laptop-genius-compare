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

  // Discover top product URLs for a brand. Tries Tavily first (if key provided), then falls back to DuckDuckGo via AllOrigins.
  static async discoverProductUrls(brand: string, limit = 3, tavilyApiKey?: string): Promise<string[]> {
    const normalized = brand.toLowerCase();
    const domain = this.BRAND_DOMAINS[normalized] || `${normalized}.com`;

    // Prefer Tavily when API key is available
    if (tavilyApiKey) {
      try {
        const tavilyUrls = await TavilyService.searchBrandProductUrls(brand, tavilyApiKey, limit);
        if (tavilyUrls.length) return tavilyUrls;
      } catch (e) {
        console.warn('Tavily discovery failed, falling back:', e);
      }
    }

    const query = `site:${domain} (laptop OR notebook) (buy OR product OR shop)`;
    const target = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) return [];
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

      return Array.from(urls).slice(0, limit);
    } catch (e) {
      console.warn('Product discovery failed:', e);
      return [];
    }
  }
}
