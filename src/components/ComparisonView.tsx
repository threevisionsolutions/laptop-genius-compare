import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Download, Share2, Sparkles, ChevronDown, ExternalLink } from 'lucide-react';
import { LaptopSpecs } from '@/types/laptop';
import { calculateScore, rankLaptops, Persona } from '@/utils/scoringEngine';
import { generateGeminiResponse } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface ComparisonViewProps {
  laptops: LaptopSpecs[];
  onOpenAffiliate?: (url: string) => void;
  onExportCSV?: (laptops: LaptopSpecs[]) => void;
}

const SPECS_LIST = [
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU' },
  { key: 'ram', label: 'RAM' },
  { key: 'storage', label: 'Storage' },
  { key: 'screen', label: 'Screen Size' },
  { key: 'weight', label: 'Weight' },
  { key: 'battery', label: 'Battery' },
  { key: 'rating', label: 'Rating' },
];

const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  laptops, 
  onOpenAffiliate,
  onExportCSV 
}) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>('Gaming');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const { toast } = useToast();

  // Limit to 4 laptops max
  const displayLaptops = laptops.slice(0, 4);

  // Calculate scores for all laptops
  const rankedLaptops = useMemo(() => {
    return rankLaptops(displayLaptops, selectedPersona);
  }, [displayLaptops, selectedPersona]);

  const topScore = rankedLaptops[0]?.score || 0;

  const handleExplainAI = async () => {
    setIsLoadingAI(true);
    setIsExplanationOpen(true);

    try {
      const apiKey = localStorage.getItem('geminiApiKey') || '';
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please set your Gemini API key first.",
          variant: "destructive"
        });
        setIsLoadingAI(false);
        return;
      }

      const top3 = rankedLaptops.slice(0, 3);
      const specsData = top3.map(({ laptop, score }) => ({
        name: laptop.name,
        brand: laptop.brand,
        price: laptop.price,
        cpu: laptop.cpu,
        gpu: laptop.gpu || 'Integrated',
        ram: laptop.ram,
        storage: laptop.storage,
        score: score
      }));

      const prompt = `Persona: ${selectedPersona}

Top 3 Laptops (with match scores):
${specsData.map((l, i) => `${i + 1}. ${l.name} (Score: ${l.score}/100)
   - Brand: ${l.brand}
   - Price: $${l.price}
   - CPU: ${l.cpu}
   - GPU: ${l.gpu}
   - RAM: ${l.ram}
   - Storage: ${l.storage}`).join('\n\n')}

Provide a 60-100 word explanation of why the top-ranked laptop is best for this persona, followed by 3 bullet pros and 1 sentence about cons/warnings.`;

      const messages = [
        { role: 'user', content: prompt }
      ];

      const response = await generateGeminiResponse(messages, apiKey);
      setAiExplanation(response);
    } catch (error) {
      console.error('AI explanation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI explanation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleExport = () => {
    if (onExportCSV) {
      onExportCSV(displayLaptops);
    } else {
      // Default CSV export
      const headers = ['Name', 'Brand', 'Price', 'CPU', 'GPU', 'RAM', 'Storage', 'Screen', 'Weight', 'Battery', 'Rating', 'Score'];
      const rows = rankedLaptops.map(({ laptop, score }) => [
        laptop.name,
        laptop.brand,
        laptop.price,
        laptop.cpu,
        laptop.gpu || 'Integrated',
        laptop.ram,
        laptop.storage,
        laptop.screen,
        laptop.weight,
        laptop.battery,
        laptop.rating,
        score
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laptop-comparison-${selectedPersona.toLowerCase()}.csv`;
      a.click();
    }
  };

  const handleShare = () => {
    const shareText = `Check out my laptop comparison for ${selectedPersona}:\n\n${rankedLaptops.slice(0, 3).map(({ laptop, score }, i) => 
      `${i + 1}. ${laptop.name} - Score: ${score}/100`
    ).join('\n')}`;

    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Comparison details copied!",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Best for:</label>
            <Select value={selectedPersona} onValueChange={(value) => setSelectedPersona(value as Persona)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Portable">Portable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleExplainAI} disabled={isLoadingAI}>
              <Sparkles className="w-4 h-4" />
              AI Explain for {selectedPersona}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* AI Explanation Panel */}
      {(isLoadingAI || aiExplanation) && (
        <Collapsible open={isExplanationOpen} onOpenChange={setIsExplanationOpen}>
          <Card className="p-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Explanation</h3>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isExplanationOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              {isLoadingAI ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  Analyzing laptops for {selectedPersona}...
                </div>
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {aiExplanation}
                </div>
              )}
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Comparison Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header with product info */}
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-4 text-left font-medium min-w-32">Spec</th>
                {rankedLaptops.map(({ laptop, score }) => (
                  <th key={laptop.id} className="p-4 text-left min-w-64">
                    <div className="space-y-3">
                      <img 
                        src={laptop.image_url || laptop.image || `https://placehold.co/320x180/333/FFF/png?text=${encodeURIComponent(laptop.brand)}`}
                        alt={laptop.name}
                        className="w-full h-32 object-cover rounded"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.includes('placehold.co')) {
                            target.src = `https://placehold.co/320x180/333/FFF/png?text=${encodeURIComponent(laptop.brand)}`;
                          }
                        }}
                      />
                      <div>
                        <div className="font-bold text-sm mb-1">{laptop.name}</div>
                        <Badge variant="secondary" className="mb-2">{laptop.brand}</Badge>
                        <div className="text-2xl font-bold text-primary mb-2">
                          ${laptop.price.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`text-lg font-bold ${score === topScore ? 'text-green-600' : 'text-muted-foreground'}`}>
                            Match: {score}/100
                          </div>
                          {score === topScore && (
                            <Badge className="bg-green-600">Best Match</Badge>
                          )}
                        </div>
                        {laptop.tags && laptop.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {laptop.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Specs rows */}
            <tbody>
              {SPECS_LIST.map((spec) => (
                <tr key={spec.key} className="border-b hover:bg-muted/30">
                  <td className="p-4 font-medium text-sm">{spec.label}</td>
                  {rankedLaptops.map(({ laptop }) => {
                    const value = laptop[spec.key as keyof LaptopSpecs];
                    const displayValue = spec.key === 'rating' 
                      ? `${laptop.rating} ⭐ (${laptop.reviewCount})`
                      : (typeof value === 'string' || typeof value === 'number' ? value : 'N/A');
                    return (
                      <td key={laptop.id} className="p-4 text-sm">
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action row */}
              <tr className="bg-muted/30">
                <td className="p-4 font-medium">Action</td>
                {rankedLaptops.map(({ laptop }) => (
                  <td key={laptop.id} className="p-4">
                    <Button 
                      onClick={() => onOpenAffiliate ? onOpenAffiliate(laptop.affiliate_url || laptop.url) : window.open(laptop.url, '_blank')}
                      className="w-full"
                    >
                      View Product
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ComparisonView;
