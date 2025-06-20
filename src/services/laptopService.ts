
import { LaptopSpecs } from '../types/laptop';

// Mock data for MVP - in production, this would connect to real APIs
const mockLaptops: Record<string, LaptopSpecs> = {
  'macbook-air-m2': {
    id: 'macbook-air-m2',
    name: 'MacBook Air M2',
    brand: 'Apple',
    price: 1199,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'Apple M2 8-core',
    ram: '8GB Unified Memory',
    storage: '256GB SSD',
    screen: '13.6" Liquid Retina (2560x1664)',
    battery: 'Up to 18 hours',
    weight: '2.7 lbs (1.24 kg)',
    os: 'macOS Ventura',
    rating: 4.8,
    reviewCount: 1247,
    seller: 'Apple Store',
    availability: 'In Stock',
    url: ''
  },
  'dell-xps-13': {
    id: 'dell-xps-13',
    name: 'Dell XPS 13',
    brand: 'Dell',
    price: 999,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'Intel Core i7-1260P',
    ram: '16GB LPDDR5',
    storage: '512GB PCIe NVMe SSD',
    screen: '13.4" FHD+ (1920x1200)',
    battery: 'Up to 12 hours',
    weight: '2.59 lbs (1.17 kg)',
    os: 'Windows 11 Home',
    rating: 4.5,
    reviewCount: 892,
    seller: 'Dell',
    availability: 'In Stock',
    url: ''
  },
  'thinkpad-x1-carbon': {
    id: 'thinkpad-x1-carbon',
    name: 'ThinkPad X1 Carbon Gen 11',
    brand: 'Lenovo',
    price: 1349,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'Intel Core i7-1365U',
    ram: '16GB LPDDR5',
    storage: '512GB PCIe Gen4 SSD',
    screen: '14" WUXGA (1920x1200)',
    battery: 'Up to 15 hours',
    weight: '2.48 lbs (1.12 kg)',
    os: 'Windows 11 Pro',
    rating: 4.6,
    reviewCount: 634,
    seller: 'Lenovo',
    availability: 'In Stock',
    url: ''
  },
  'asus-zenbook': {
    id: 'asus-zenbook',
    name: 'ASUS ZenBook 14',
    brand: 'ASUS',
    price: 799,
    currency: '$',
    image: '/placeholder.svg',
    cpu: 'AMD Ryzen 7 5800H',
    ram: '16GB DDR4',
    storage: '512GB PCIe SSD',
    screen: '14" FHD (1920x1080)',
    battery: 'Up to 13 hours',
    weight: '3.09 lbs (1.4 kg)',
    os: 'Windows 11 Home',
    rating: 4.3,
    reviewCount: 423,
    seller: 'ASUS',
    availability: 'In Stock',
    url: ''
  }
};

export const searchLaptops = async (queries: string[]): Promise<LaptopSpecs[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simple matching logic for MVP
  const results: LaptopSpecs[] = [];
  const laptopValues = Object.values(mockLaptops);
  
  queries.forEach((query, index) => {
    const lowerQuery = query.toLowerCase();
    
    // Try to match by name or brand
    let laptop = laptopValues.find(l => 
      l.name.toLowerCase().includes(lowerQuery) ||
      l.brand.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes(l.brand.toLowerCase())
    );
    
    // If no match, assign a laptop based on index
    if (!laptop) {
      laptop = laptopValues[index % laptopValues.length];
    }
    
    // Create a copy with the original URL
    results.push({
      ...laptop,
      url: query,
      id: `${laptop.id}-${index}`
    });
  });
  
  return results;
};

export const generateAIComparison = async (laptops: LaptopSpecs[], userType?: string): Promise<string> => {
  // In production, this would call OpenAI API
  // For MVP, we'll generate a structured comparison
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const userContext = userType ? ` for ${userType} use` : '';
  
  return `### 🎯 Quick Recommendation${userContext}

**Winner**: ${laptops[0].name} offers the best value for most users, combining strong performance with reasonable pricing.

### 📊 Specs Showdown

**Performance**: 
- ${laptops[0].name}: ${laptops[0].cpu} with ${laptops[0].ram}
- ${laptops[1].name}: ${laptops[1].cpu} with ${laptops[1].ram}

**Storage & Display**:
- ${laptops[0].name}: ${laptops[0].storage}, ${laptops[0].screen}
- ${laptops[1].name}: ${laptops[1].storage}, ${laptops[1].screen}

**Portability**:
- ${laptops[0].name}: ${laptops[0].weight}, ${laptops[0].battery}
- ${laptops[1].name}: ${laptops[1].weight}, ${laptops[1].battery}

### ✅ Pros & Cons

**${laptops[0].name}**
- ✅ ${laptops[0].price < laptops[1].price ? 'More affordable price point' : 'Premium build quality'}
- ✅ ${laptops[0].weight.includes('2.') ? 'Ultra-portable design' : 'Solid performance'}
- ❌ ${laptops[0].brand === 'Apple' ? 'Limited upgrade options' : 'May lack premium features'}

**${laptops[1].name}**
- ✅ ${laptops[1].cpu.includes('Intel') ? 'Excellent compatibility' : 'Strong performance'}
- ✅ ${laptops[1].ram.includes('16GB') ? 'Generous RAM for multitasking' : 'Good storage capacity'}
- ❌ ${laptops[1].price > laptops[0].price ? 'Higher price point' : 'Heavier than competitors'}

### 🎯 Final Recommendation

${userType === 'student' ? 
  `For students, the ${laptops.find(l => l.price < 1000)?.name || laptops[0].name} offers the best balance of performance and affordability for coursework and research.` :
  userType === 'gamer' ?
  `For gaming, look for models with dedicated graphics cards. These ultrabooks are better suited for casual gaming and productivity.` :
  userType === 'business' ?
  `For business use, the ${laptops.find(l => l.os.includes('Pro'))?.name || laptops[0].name} provides professional features and enterprise security.` :
  `The ${laptops[0].name} offers the best overall value with ${laptops[0].rating}/5 star rating and proven reliability.`
}

**Best for**: ${userType || 'General use'}, productivity, and portability
**Budget**: $${Math.min(...laptops.map(l => l.price))} - $${Math.max(...laptops.map(l => l.price))}`;
};
