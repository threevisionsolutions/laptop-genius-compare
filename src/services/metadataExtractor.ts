export interface PageMetadata {
  title?: string;
  description?: string;
  images: string[];
}

export class MetaExtractor {
  private static readonly CORS_PROXY = 'https://api.allorigins.win/get?url=';

  static async getPageMetadata(url: string): Promise<PageMetadata> {
    try {
      const res = await fetch(this.CORS_PROXY + encodeURIComponent(url));
      if (!res.ok) return { images: [] };

      const data = await res.json();
      const html: string = data.contents || '';

      const images = this.extractImages(html, url);
      const description = this.extractDescription(html);
      const title = this.extractTitle(html);

      return { title, description, images };
    } catch {
      return { images: [] };
    }
  }

  private static extractImages(html: string, baseUrl: string): string[] {
    const urls = new Set<string>();
    const add = (u: string) => {
      try {
        const abs = new URL(u, baseUrl).toString();
        urls.add(abs);
      } catch { /* ignore bad urls */ }
    };

    // og:image
    const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi) || [];
    ogImg.forEach(tag => {
      const m = tag.match(/content=["']([^"']+)["']/i);
      if (m) add(m[1]);
    });

    // twitter:image
    const twImg = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi) || [];
    twImg.forEach(tag => {
      const m = tag.match(/content=["']([^"']+)["']/i);
      if (m) add(m[1]);
    });

    // <img src="...">
    const imgTags = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
    imgTags.forEach(tag => {
      const m = tag.match(/src=["']([^"']+)["']/i);
      if (m && /(\.(png|jpe?g|webp|avif)|\/images?\/|content\/dam|product)/i.test(m[1])) add(m[1]);
    });

    return Array.from(urls).slice(0, 10);
  }

  private static extractDescription(html: string): string | undefined {
    const og = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (og) return this.clean(og[1]);
    const meta = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (meta) return this.clean(meta[1]);
    return undefined;
  }

  private static extractTitle(html: string): string | undefined {
    const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (og) return this.clean(og[1]);
    const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (t) return this.clean(t[1]);
    return undefined;
  }

  private static clean(t: string): string {
    return t.replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
