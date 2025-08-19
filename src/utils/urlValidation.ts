export class URLValidation {
  static validateLaptopURL(url: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();
      const search = urlObj.search.toLowerCase();
      
      // Check if it's a valid HTTP/HTTPS URL
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }
      
      // Check for known laptop retailers
      const supportedRetailers = [
        'amazon.com', 'amazon.co.uk', 'amazon.ca', 'amazon.de', 'amazon.fr',
        'bestbuy.com', 'newegg.com', 'apple.com', 'dell.com', 'hp.com',
        'lenovo.com', 'asus.com', 'acer.com', 'microsoft.com',
        'costco.com', 'walmart.com', 'target.com', 'microcenter.com'
      ];
      
      const isKnownRetailer = supportedRetailers.some(retailer => 
        hostname.includes(retailer) || hostname.endsWith(retailer)
      );
      
      // Check for laptop-related keywords in URL
      const laptopKeywords = [
        'laptop', 'notebook', 'macbook', 'thinkpad', 'inspiron',
        'pavilion', 'envy', 'zenbook', 'vivobook', 'ideapad',
        'surface', 'chromebook', 'ultrabook', 'gaming-laptop'
      ];
      
      const hasLaptopKeywords = laptopKeywords.some(keyword =>
        pathname.includes(keyword) || search.includes(keyword)
      );
      
      // Validation logic
      if (!isKnownRetailer && !hasLaptopKeywords) {
        errors.push('URL does not appear to be from a laptop retailer or contain laptop-related content');
      }
      
      // Check for suspicious patterns
      if (pathname.includes('/reviews/') || pathname.includes('/forum/')) {
        errors.push('URL appears to be a review or forum page, not a product page');
      }
      
      // Check for search result pages
      if (search.includes('search') || pathname.includes('/search/')) {
        errors.push('URL appears to be a search results page, not a specific product');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
      
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid URL format']
      };
    }
  }
  
  static formatValidationMessage(validation: { isValid: boolean; errors: string[] }): string {
    if (validation.isValid) {
      return 'URL looks good!';
    }
    
    return `URL Issues:\n${validation.errors.map(error => `• ${error}`).join('\n')}`;
  }
  
  static suggestCorrection(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      // Common corrections
      if (urlObj.pathname.includes('/s/')) {
        return 'This looks like a search URL. Please find the specific laptop product page instead.';
      }
      
      if (urlObj.pathname.includes('/reviews/')) {
        return 'This appears to be a review page. Please use the main product page URL instead.';
      }
      
      return null;
    } catch {
      return 'Please check that the URL is properly formatted (starts with http:// or https://)';
    }
  }
}

export default URLValidation;