
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/Header';
import SearchForm from '../components/SearchForm';
import ComparisonTable from '../components/ComparisonTable';
import AISummary from '../components/AISummary';
import ChatInterface from '../components/ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search } from 'lucide-react';
import { LaptopSpecs, ComparisonResult, UserType, AppMode } from '../types/laptop';
import { searchLaptops, generateAIComparison } from '../services/laptopService';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('comparison');
  const [userType, setUserType] = useState<string>('');
  const { toast } = useToast();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleCompare = async (urls: string[], selectedUserType: string) => {
    setLoading(true);
    setUserType(selectedUserType);
    
    try {
      console.log('Starting comparison for:', urls);
      
      // Fetch laptop data
      const laptops = await searchLaptops(urls);
      console.log('Fetched laptops:', laptops);
      
      // Generate AI summary
      const aiSummary = await generateAIComparison(laptops, selectedUserType as UserType);
      console.log('Generated AI summary');
      
      const result: ComparisonResult = {
        laptops,
        aiSummary,
        timestamp: new Date()
      };
      
      setComparison(result);
      
      toast({
        title: "Comparison Complete!",
        description: `Analyzed ${laptops.length} laptops with AI insights.`,
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
              <SearchForm onCompare={handleCompare} loading={loading} />
              
              {comparison && (
                <div className="space-y-6">
                  <ComparisonTable 
                    laptops={comparison.laptops}
                    onSave={handleSave}
                    onShare={handleShare}
                  />
                  
                  <AISummary 
                    summary={comparison.aiSummary}
                    userType={comparison.laptops[0]?.url ? undefined : 'general'}
                  />
                </div>
              )}
              
              {!comparison && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💻</div>
                  <h2 className="text-2xl font-bold mb-2">Ready to Find Your Perfect Laptop?</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter laptop URLs or names above to get started with AI-powered comparison and recommendations.
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
