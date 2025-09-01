
export interface LaptopSpecs {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  image: string;
  images?: string[]; // Optional array of images
  cpu: string;
  ram: string;
  storage: string;
  screen: string;
  battery: string;
  weight: string;
  os: string;
  rating: number;
  reviewCount: number;
  seller: string;
  availability: string;
  url: string;
}

export interface ComparisonResult {
  laptops: LaptopSpecs[];
  aiSummary: string;
  timestamp: Date;
}

export type UserType = 'student' | 'gamer' | 'business' | 'creative' | 'casual';

export type AppMode = 'comparison' | 'chat';
