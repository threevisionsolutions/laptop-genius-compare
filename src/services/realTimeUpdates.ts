import { LaptopSpecs } from '../types/laptop';

interface PriceUpdateResult {
  laptop: LaptopSpecs;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  percentChange: number;
  timestamp: Date;
}

interface AvailabilityUpdate {
  laptop: LaptopSpecs;
  oldStatus: string;
  newStatus: string;
  timestamp: Date;
}

export class RealTimeUpdatesService {
  private static updateInterval: NodeJS.Timeout | null = null;
  private static subscribers: Array<(updates: any) => void> = [];

  static startPriceTracking(laptops: LaptopSpecs[]): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Simulate price updates every 30 seconds for demo
    this.updateInterval = setInterval(() => {
      this.checkForUpdates(laptops);
    }, 30000);
  }

  static stopPriceTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  static subscribe(callback: (updates: any) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private static async checkForUpdates(laptops: LaptopSpecs[]): Promise<void> {
    const updates: {
      priceUpdates: PriceUpdateResult[];
      availabilityUpdates: AvailabilityUpdate[];
    } = {
      priceUpdates: [],
      availabilityUpdates: []
    };

    // Simulate some random price changes for demo
    for (const laptop of laptops) {
      // 10% chance of a price update
      if (Math.random() < 0.1) {
        const oldPrice = laptop.price;
        const changePercent = (Math.random() - 0.5) * 0.2; // ±10% change
        const newPrice = Math.round(oldPrice * (1 + changePercent));
        
        if (Math.abs(newPrice - oldPrice) > 10) { // Only report significant changes
          const priceUpdate: PriceUpdateResult = {
            laptop: { ...laptop, price: newPrice },
            oldPrice,
            newPrice,
            priceChange: newPrice - oldPrice,
            percentChange: changePercent * 100,
            timestamp: new Date()
          };
          
          updates.priceUpdates.push(priceUpdate);
        }
      }

      // 5% chance of availability change
      if (Math.random() < 0.05) {
        const statuses = ['In Stock', 'Limited Stock', 'Out of Stock', 'Pre-Order'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (newStatus !== laptop.availability) {
          const availabilityUpdate: AvailabilityUpdate = {
            laptop: { ...laptop, availability: newStatus },
            oldStatus: laptop.availability,
            newStatus,
            timestamp: new Date()
          };
          
          updates.availabilityUpdates.push(availabilityUpdate);
        }
      }
    }

    // Notify subscribers if there are updates
    if (updates.priceUpdates.length > 0 || updates.availabilityUpdates.length > 0) {
      this.notifySubscribers(updates);
    }
  }

  private static notifySubscribers(updates: any): void {
    this.subscribers.forEach(callback => {
      try {
        callback(updates);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  static async checkLivePrice(laptop: LaptopSpecs): Promise<LaptopSpecs> {
    // In a real implementation, this would make API calls to retailer APIs
    // For now, simulate with slight price variations
    
    const priceVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const adjustedPrice = Math.round(laptop.price * (1 + priceVariation));
    
    // Simulate availability check
    const availabilityOptions = ['In Stock', 'Limited Stock', 'Out of Stock'];
    const randomAvailability = Math.random() < 0.9 ? 'In Stock' : 
                              Math.random() < 0.7 ? 'Limited Stock' : 'Out of Stock';
    
    return {
      ...laptop,
      price: adjustedPrice,
      availability: randomAvailability,
      // Add timestamp to track when price was last checked
      lastPriceCheck: new Date().toISOString()
    } as LaptopSpecs & { lastPriceCheck: string };
  }

  static formatPriceAlert(update: PriceUpdateResult): string {
    const direction = update.priceChange > 0 ? '📈' : '📉';
    const changeText = update.priceChange > 0 ? 'increased' : 'decreased';
    
    return `${direction} ${update.laptop.name} price ${changeText} by $${Math.abs(update.priceChange)} (${Math.abs(update.percentChange).toFixed(1)}%)`;
  }

  static formatAvailabilityAlert(update: AvailabilityUpdate): string {
    const emoji = update.newStatus === 'In Stock' ? '✅' : 
                  update.newStatus === 'Limited Stock' ? '⚠️' : '❌';
    
    return `${emoji} ${update.laptop.name} availability changed: ${update.oldStatus} → ${update.newStatus}`;
  }

  static getPriceHistory(laptopId: string): Array<{ price: number; date: Date }> {
    // Simulate price history - in real app this would come from a database
    const history = [];
    const basePrice = 1000;
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const priceVariation = Math.sin(i * 0.2) * 100 + (Math.random() - 0.5) * 50;
      const price = Math.round(basePrice + priceVariation);
      
      history.push({ price, date });
    }
    
    return history;
  }

  static getLowestPriceInRange(
    laptopId: string, 
    days: number = 30
  ): { price: number; date: Date } | null {
    const history = this.getPriceHistory(laptopId);
    
    if (history.length === 0) return null;
    
    return history.reduce((lowest, current) => 
      current.price < lowest.price ? current : lowest
    );
  }

  static getHighestPriceInRange(
    laptopId: string, 
    days: number = 30
  ): { price: number; date: Date } | null {
    const history = this.getPriceHistory(laptopId);
    
    if (history.length === 0) return null;
    
    return history.reduce((highest, current) => 
      current.price > highest.price ? current : highest
    );
  }
}