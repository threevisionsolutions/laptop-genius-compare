import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/Header';
import SearchForm from '../components/SearchForm';
import ComparisonTable from '../components/ComparisonTable';
import AISummary from '../components/AISummary';
import ChatInterface from '../components/ChatInterface';
import RecommendationEngine from '../components/RecommendationEngine';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Sparkles } from 'lucide-react';
import { LaptopSpecs, ComparisonResult, UserType, AppMode } from '../types/laptop';
import { searchLaptops, generateAIComparison } from '../services/laptopService';

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  minRating: number;
  userType: string;
}

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('comparison');
  const [userType, setUserType] = useState<string>('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { toast } = useToast();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleCompare = async (urls: string[], selectedUserType: string, filters?: FilterState) => {
    setLoading(true);
    setUserType(selectedUserType || filters?.userType || '');
    
    try {
      console.log('Starting comparison for:', urls);
      console.log('Applied filters:', filters);
      
      // Fetch laptop data
      const laptops = await searchLaptops(urls);
      console.log('Fetched laptops:', laptops);
      
      // Apply filters to results
      let filteredLaptops = laptops;
      
      if (filters) {
        filteredLaptops = laptops.filter(laptop => {
          // Price filter
          if (laptop.price < filters.priceRange[0] || laptop.price > filters.priceRange[1]) {
            return false;
          }
          
          // Brand filter
          if (filters.brands.length > 0 && !filters.brands.includes(laptop.brand)) {
            return false;
          }
          
          // Rating filter
          if (filters.minRating > 0 && laptop.rating < filters.minRating) {
            return false;
          }
          
          return true;
        });
        
        console.log(`Filtered ${laptops.length} laptops to ${filteredLaptops.length}`);
      }
      
      // Generate AI summary
      const aiSummary = await generateAIComparison(
        filteredLaptops, 
        (selectedUserType || filters?.userType) as UserType
      );
      console.log('Generated AI summary');
      
      const result: ComparisonResult = {
        laptops: filteredLaptops,
        aiSummary,
        timestamp: new Date()
      };
      
      setComparison(result);
      setShowRecommendations(false);
      
      toast({
        title: "Comparison Complete!",
        description: `Analyzed ${filteredLaptops.length} laptops with AI insights.`,
      });
      
    } catch (error) {
      console.error('Comparison failed:', error);
      toast({
        title: "Comparison Failed",
        description: "Please try again with valid laptop information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendation = (recommendations: LaptopSpecs[]) => {
    const result: ComparisonResult = {
      laptops: recommendations,
      aiSummary: `Based on your preferences, here are the top ${recommendations.length} laptop recommendations tailored for you.`,
      timestamp: new Date()
    };
    
    setComparison(result);
    toast({
      title: "Recommendations Ready!",
      description: `Found ${recommendations.length} laptops matching your preferences.`,
    });
  };

  const handleSave = () => {
    if (comparison) {
      localStorage.setItem('savedComparison', JSON.stringify(comparison));
      toast({
        title: "Comparison Saved!",
        description: "Your comparison has been saved locally.",
      });
    }
  };

  const handleShare = async () => {
    if (comparison) {
      const shareText = `Check out this laptop comparison: ${comparison.laptops.map(l => l.name).join(' vs ')}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Laptop Comparison',
            text: shareText,
            url: window.location.href
          });
        } catch (error) {
          console.log('Share failed:', error);
        }
      } else {
        navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        toast({
          title: "Link Copied!",
          description: "Comparison link copied to clipboard.",
        });
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="container mx-auto px-4 py-8">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={appMode === 'comparison' ? 'default' : 'ghost'}
                onClick={() => setAppMode('comparison')}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Compare Laptops
              </Button>
              <Button
                variant={appMode === 'chat' ? 'default' : 'ghost'}
                onClick={() => setAppMode('chat')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat with AI
              </Button>
            </div>
          </div>

          {appMode === 'comparison' ? (
            <>
              {/* Toggle between Search and Recommendations */}
              <div className="flex justify-center mb-6">
                <div className="flex bg-muted/50 rounded-lg p-1">
                  <Button
                    variant={!showRecommendations ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setShowRecommendations(false)}
                  >
                    Search & Compare
                  </Button>
                  <Button
                    variant={showRecommendations ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setShowRecommendations(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </Button>
                </div>
              </div>

              {showRecommendations ? (
                <RecommendationEngine 
                  laptops={[]} // You would pass actual laptop data here in a real app
                  onRecommendation={handleRecommendation}
                />
              ) : (
                <SearchForm onCompare={handleCompare} loading={loading} />
              )}
              
              {comparison && (
                <div className="space-y-6">
                  <ComparisonTable 
                    laptops={comparison.laptops}
                    onSave={handleSave}
                    onShare={handleShare}
                    aiSummary={comparison.aiSummary}
                  />
                  
                  <AISummary 
                    summary={comparison.aiSummary}
                    userType={comparison.laptops[0]?.url ? undefined : 'general'}
                  />
                </div>
              )}
              
              {!comparison && !loading && !showRecommendations && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💻</div>
                  <h2 className="text-2xl font-bold mb-2">Ready to Find Your Perfect Laptop?</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Search for laptops or paste URLs above. Use filters to narrow down your perfect match.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="max-w-4xl mx-auto">
              <ChatInterface userType={userType} />
            </div>
          )}
        </main>
        
        <footer className="border-t mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; 2024 LaptopCompareAI. Made with ❤️ for smart laptop shopping.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
