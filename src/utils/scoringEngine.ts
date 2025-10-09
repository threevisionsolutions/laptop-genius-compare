import { LaptopSpecs } from '@/types/laptop';

export type Persona = 'Gaming' | 'Creative' | 'Programming' | 'Student' | 'Portable';

interface PersonaWeights {
  gpu?: number;
  cpu?: number;
  ram?: number;
  storage?: number;
  battery?: number;
  weight?: number;
  screen?: number;
  price_penalty?: number;
}

const PERSONA_WEIGHTS: Record<Persona, PersonaWeights> = {
  Gaming: { gpu: 0.40, cpu: 0.25, ram: 0.15, storage: 0.05, price_penalty: 0.15 },
  Creative: { cpu: 0.30, ram: 0.25, gpu: 0.20, storage: 0.15, price_penalty: 0.10 },
  Programming: { cpu: 0.35, ram: 0.30, battery: 0.10, weight: 0.10, price_penalty: 0.15 },
  Student: { price_penalty: 0.30, weight: 0.20, battery: 0.20, ram: 0.15, storage: 0.15 },
  Portable: { weight: 0.35, battery: 0.35, screen: 0.10, ram: 0.10, price_penalty: 0.10 }
};

// Normalize GPU tier from string to 0-100 score
function normalizeGPU(gpu?: string): number {
  if (!gpu) return 30;
  const gpuLower = gpu.toLowerCase();
  
  // NVIDIA scoring
  if (gpuLower.includes('rtx 4090')) return 100;
  if (gpuLower.includes('rtx 4080')) return 95;
  if (gpuLower.includes('rtx 4070')) return 90;
  if (gpuLower.includes('rtx 4060')) return 80;
  if (gpuLower.includes('rtx 4050')) return 70;
  if (gpuLower.includes('rtx 3080')) return 85;
  if (gpuLower.includes('rtx 3070')) return 80;
  if (gpuLower.includes('rtx 3060')) return 70;
  if (gpuLower.includes('rtx 3050')) return 60;
  if (gpuLower.includes('gtx 1650')) return 50;
  
  // AMD scoring
  if (gpuLower.includes('rx 7900')) return 95;
  if (gpuLower.includes('rx 7800')) return 85;
  if (gpuLower.includes('rx 7700')) return 80;
  if (gpuLower.includes('rx 7600')) return 70;
  if (gpuLower.includes('rx 6800')) return 75;
  if (gpuLower.includes('rx 6700')) return 70;
  if (gpuLower.includes('rx 6600')) return 60;
  
  // Integrated graphics
  if (gpuLower.includes('iris xe')) return 45;
  if (gpuLower.includes('radeon') && gpuLower.includes('integrated')) return 40;
  if (gpuLower.includes('intel') && gpuLower.includes('uhd')) return 35;
  
  return 40; // Default for unknown
}

// Normalize CPU from string to 0-100 score
function normalizeCPU(cpu?: string): number {
  if (!cpu) return 50;
  const cpuLower = cpu.toLowerCase();
  
  // Intel scoring
  if (cpuLower.includes('i9') || cpuLower.includes('ultra 9')) {
    if (cpuLower.includes('14') || cpuLower.includes('13')) return 100;
    if (cpuLower.includes('12') || cpuLower.includes('11')) return 90;
    return 85;
  }
  if (cpuLower.includes('i7') || cpuLower.includes('ultra 7')) {
    if (cpuLower.includes('14') || cpuLower.includes('13')) return 90;
    if (cpuLower.includes('12') || cpuLower.includes('11')) return 80;
    return 75;
  }
  if (cpuLower.includes('i5') || cpuLower.includes('ultra 5')) {
    if (cpuLower.includes('14') || cpuLower.includes('13')) return 75;
    if (cpuLower.includes('12') || cpuLower.includes('11')) return 65;
    return 60;
  }
  
  // AMD Ryzen scoring
  if (cpuLower.includes('ryzen 9')) {
    if (cpuLower.includes('7000') || cpuLower.includes('8000')) return 100;
    if (cpuLower.includes('6000') || cpuLower.includes('5000')) return 90;
    return 85;
  }
  if (cpuLower.includes('ryzen 7')) {
    if (cpuLower.includes('7000') || cpuLower.includes('8000')) return 90;
    if (cpuLower.includes('6000') || cpuLower.includes('5000')) return 80;
    return 75;
  }
  if (cpuLower.includes('ryzen 5')) {
    if (cpuLower.includes('7000') || cpuLower.includes('8000')) return 75;
    if (cpuLower.includes('6000') || cpuLower.includes('5000')) return 65;
    return 60;
  }
  
  // Apple M-series
  if (cpuLower.includes('m3')) return 95;
  if (cpuLower.includes('m2')) return 85;
  if (cpuLower.includes('m1')) return 75;
  
  return 50;
}

// Extract numeric values from strings
function extractRAM(ram: string): number {
  const match = ram.match(/(\d+)/);
  return match ? parseInt(match[1]) : 8;
}

function extractStorage(storage: string): number {
  const match = storage.match(/(\d+)/);
  if (!match) return 256;
  const value = parseInt(match[1]);
  return storage.toLowerCase().includes('tb') ? value * 1024 : value;
}

function extractBattery(battery: string): number {
  const match = battery.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 8;
}

function extractWeight(weight: string): number {
  const match = weight.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 2;
}

function extractScreen(screen: string): number {
  const match = screen.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 15;
}

// Main scoring function
export function calculateScore(laptop: LaptopSpecs, persona: Persona): number {
  const weights = PERSONA_WEIGHTS[persona];
  let score = 0;
  let totalWeight = 0;
  
  // GPU score
  if (weights.gpu) {
    const gpuScore = normalizeGPU(laptop.gpu);
    score += gpuScore * weights.gpu;
    totalWeight += weights.gpu;
  }
  
  // CPU score
  if (weights.cpu) {
    const cpuScore = normalizeCPU(laptop.cpu);
    score += cpuScore * weights.cpu;
    totalWeight += weights.cpu;
  }
  
  // RAM score (normalize to 8-64GB range)
  if (weights.ram) {
    const ramGB = laptop.ram_gb || extractRAM(laptop.ram);
    const ramScore = Math.min(100, (ramGB / 64) * 100);
    score += ramScore * weights.ram;
    totalWeight += weights.ram;
  }
  
  // Storage score (normalize to 256-2048GB range)
  if (weights.storage) {
    const storageGB = laptop.storage_gb || extractStorage(laptop.storage);
    const storageScore = Math.min(100, (storageGB / 2048) * 100);
    score += storageScore * weights.storage;
    totalWeight += weights.storage;
  }
  
  // Battery score (normalize to 4-20 hours)
  if (weights.battery) {
    const batteryHours = laptop.battery_hours || extractBattery(laptop.battery);
    const batteryScore = Math.min(100, ((batteryHours - 4) / 16) * 100);
    score += Math.max(0, batteryScore) * weights.battery;
    totalWeight += weights.battery;
  }
  
  // Weight score (lower is better, normalize to 0.5-3kg, inverted)
  if (weights.weight) {
    const weightKG = laptop.weight_kg || extractWeight(laptop.weight);
    const weightScore = Math.max(0, 100 - ((weightKG - 0.5) / 2.5) * 100);
    score += weightScore * weights.weight;
    totalWeight += weights.weight;
  }
  
  // Screen score (normalize to 13-17 inches, 15" is optimal)
  if (weights.screen) {
    const screenIn = laptop.screen_in || extractScreen(laptop.screen);
    const screenScore = 100 - Math.abs(screenIn - 15) * 10;
    score += Math.max(0, screenScore) * weights.screen;
    totalWeight += weights.screen;
  }
  
  // Price penalty (normalize to $500-$3000, lower is better for penalty)
  if (weights.price_penalty) {
    const priceNormalized = Math.min(1, (laptop.price - 500) / 2500);
    score -= priceNormalized * weights.price_penalty * 100;
  }
  
  // Normalize final score to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function rankLaptops(laptops: LaptopSpecs[], persona: Persona) {
  return laptops
    .map(laptop => ({
      laptop,
      score: calculateScore(laptop, persona)
    }))
    .sort((a, b) => b.score - a.score);
}
