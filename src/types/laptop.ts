
export interface LaptopSpecs {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  image: string;
  images?: string[];
  image_url?: string;
  cpu: string;
  gpu?: string;
  ram: string;
  ram_gb?: number;
  storage: string;
  storage_gb?: number;
  storage_type?: string;
  screen: string;
  screen_in?: number;
  battery: string;
  battery_hours?: number;
  weight: string;
  weight_kg?: number;
  os: string;
  rating: number;
  reviewCount: number;
  seller: string;
  availability: string;
  url: string;
  affiliate_url?: string;
  tags?: string[];
  specs_raw?: Record<string, any>;
}

export interface ComparisonResult {
  laptops: LaptopSpecs[];
  aiSummary: string;
  timestamp: Date;
}

export type UserType = 'student' | 'gamer' | 'business' | 'creative' | 'casual';

export type AppMode = 'comparison' | 'chat';
