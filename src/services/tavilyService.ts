export interface TavilyResult {
  title: string;
  url: string;
  content?: string;
  score?: number;
}

export class TavilyService {
  private static readonly API_URL = 'https://api.tavily.com/search';

  static async search(query: string, apiKey: string, limit = 5, includeDomains?: string[]): Promise<TavilyResult[]> {
    if (!apiKey) throw new Error('Tavily API key is required');

    const body: any = {
      api_key: apiKey,
      query,
      search_depth: 'basic',
      include_answer: false,
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
    }));

    return results;
  }

  static async searchBrandProductUrls(brand: string, apiKey: string, limit = 3): Promise<string[]> {
    const normalized = brand.toLowerCase();
    const domain = `${normalized}.com`;
    const query = `site:${domain} (laptop OR notebook) (buy OR product OR shop OR series)`;

    try {
      const results = await this.search(query, apiKey, limit * 2, [domain]);
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
}
