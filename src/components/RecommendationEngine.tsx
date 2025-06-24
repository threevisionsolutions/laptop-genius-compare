
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Zap, Briefcase, Gamepad2, Palette } from 'lucide-react';
import { LaptopSpecs } from '../types/laptop';

interface RecommendationEngineProps {
  laptops: LaptopSpecs[];
  onRecommendation: (recommendations: LaptopSpecs[]) => void;
}

interface UserPreferences {
  usage: string;
  budget: [number, number];
  performance: number;
  portability: number;
  batteryLife: number;
  brand: string;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ laptops, onRecommendation }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    usage: '',
    budget: [500, 2000],
    performance: 50,
    portability: 50,
    batteryLife: 50,
    brand: 'any'
  });
  const [showRecommendations, setShowRecommendations] = useState(false);

  const usageTypes = [
    { id: 'student', label: 'Student & Study', icon: '📚', description: 'Note-taking, research, assignments' },
    { id: 'business', label: 'Business & Office', icon: '💼', description: 'Productivity, presentations, meetings' },
    { id: 'gaming', label: 'Gaming', icon: '🎮', description: 'High-performance gaming' },
    { id: 'creative', label: 'Creative Work', icon: '🎨', description: 'Design, video editing, content creation' },
    { id: 'casual', label: 'Casual Use', icon: '🏠', description: 'Web browsing, entertainment, light tasks' }
  ];

  const calculateScore = (laptop: LaptopSpecs): number => {
    let score = 0;

    // Budget matching (30% weight)
    if (laptop.price >= preferences.budget[0] && laptop.price <= preferences.budget[1]) {
      score += 30;
    } else if (laptop.price < preferences.budget[0]) {
      score += 20; // Bonus for being under budget
    }

    // Usage type matching (25% weight)
    const usageBonus = getUsageBonus(laptop, preferences.usage);
    score += usageBonus;

    // Performance preference (20% weight)
    const performanceScore = getPerformanceScore(laptop);
    const performanceMatch = 100 - Math.abs(preferences.performance - performanceScore);
    score += (performanceMatch / 100) * 20;

    // Portability preference (15% weight)
    const portabilityScore = getPortabilityScore(laptop);
    const portabilityMatch = 100 - Math.abs(preferences.portability - portabilityScore);
    score += (portabilityMatch / 100) * 15;

    // Rating bonus (10% weight)
    score += (laptop.rating / 5) * 10;

    return score;
  };

  const getUsageBonus = (laptop: LaptopSpecs, usage: string): number => {
    const name = laptop.name.toLowerCase();
    const cpu = laptop.cpu.toLowerCase();
    
    switch (usage) {
      case 'gaming':
        if (name.includes('gaming') || name.includes('rog') || name.includes('predator')) return 25;
        if (cpu.includes('i7') || cpu.includes('i9') || cpu.includes('ryzen 7')) return 20;
        return 10;
      case 'business':
        if (name.includes('thinkpad') || name.includes('latitude') || name.includes('elitebook')) return 25;
        if (name.includes('business') || name.includes('pro')) return 20;
        return 15;
      case 'creative':
        if (name.includes('macbook') || name.includes('creator') || name.includes('studio')) return 25;
        if (cpu.includes('i7') || cpu.includes('ryzen 7') || cpu.includes('m1') || cpu.includes('m2')) return 20;
        return 15;
      case 'student':
        if (laptop.price < 800) return 25;
        if (name.includes('vivobook') || name.includes('ideapad')) return 20;
        return 15;
      case 'casual':
        if (laptop.price < 1000) return 20;
        return 15;
      default:
        return 15;
    }
  };

  const getPerformanceScore = (laptop: LaptopSpecs): number => {
    const cpu = laptop.cpu.toLowerCase();
    let score = 30;
    
    if (cpu.includes('i9') || cpu.includes('ryzen 9')) score = 90;
    else if (cpu.includes('i7') || cpu.includes('ryzen 7')) score = 75;
    else if (cpu.includes('i5') || cpu.includes('ryzen 5')) score = 60;
    else if (cpu.includes('m1') || cpu.includes('m2')) score = 85;
    
    const ramValue = parseInt(laptop.ram.match(/\d+/)?.[0] || '8');
    score += Math.min(25, ramValue * 1.5);
    
    return Math.min(100, score);
  };

  const getPortabilityScore = (laptop: LaptopSpecs): number => {
    const weight = parseFloat(laptop.weight.match(/[\d.]+/)?.[0] || '5');
    return Math.max(0, 100 - (weight * 15));
  };

  const generateRecommendations = () => {
    const scoredLaptops = laptops.map(laptop => ({
      ...laptop,
      score: calculateScore(laptop)
    }));

    const recommendations = scoredLaptops
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    onRecommendation(recommendations);
    setShowRecommendations(true);
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-xl font-bold">AI Laptop Recommendations</h3>
      </div>

      {!showRecommendations ? (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">What will you primarily use this laptop for?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {usageTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={preferences.usage === type.id ? "default" : "outline"}
                  onClick={() => setPreferences(prev => ({ ...prev, usage: type.id }))}
                  className="h-auto p-4 flex flex-col items-start text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Budget Range</Label>
              <div className="px-2">
                <Slider
                  value={preferences.budget}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, budget: value as [number, number] }))}
                  max={3000}
                  min={300}
                  step={50}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>${preferences.budget[0]}</span>
                <span>${preferences.budget[1]}</span>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Brand Preference</Label>
              <Select value={preferences.brand} onValueChange={(value) => setPreferences(prev => ({ ...prev, brand: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">No Preference</SelectItem>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="dell">Dell</SelectItem>
                  <SelectItem value="lenovo">Lenovo</SelectItem>
                  <SelectItem value="asus">ASUS</SelectItem>
                  <SelectItem value="hp">HP</SelectItem>
                  <SelectItem value="msi">MSI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Performance Priority</Label>
              <Slider
                value={[preferences.performance]}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, performance: value[0] }))}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="text-xs text-center mt-2 text-muted-foreground">
                {preferences.performance < 30 ? 'Basic' : preferences.performance < 70 ? 'Moderate' : 'High Performance'}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Portability Priority</Label>
              <Slider
                value={[preferences.portability]}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, portability: value[0] }))}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="text-xs text-center mt-2 text-muted-foreground">
                {preferences.portability < 30 ? 'Desktop Replacement' : preferences.portability < 70 ? 'Balanced' : 'Ultra Portable'}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Battery Life Priority</Label>
              <Slider
                value={[preferences.batteryLife]}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, batteryLife: value[0] }))}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="text-xs text-center mt-2 text-muted-foreground">
                {preferences.batteryLife < 30 ? 'Basic' : preferences.batteryLife < 70 ? 'Good' : 'All Day'}
              </div>
            </div>
          </div>

          <Button 
            onClick={generateRecommendations} 
            className="w-full"
            disabled={!preferences.usage}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get My Recommendations
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Recommendations generated! Check the comparison results below.</p>
          <Button 
            variant="outline" 
            onClick={() => setShowRecommendations(false)}
          >
            Modify Preferences
          </Button>
        </div>
      )}
    </Card>
  );
};

export default RecommendationEngine;
