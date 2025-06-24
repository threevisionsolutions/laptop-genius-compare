
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, X, Filter } from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';
import FilterPanel from './FilterPanel';

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  minRating: number;
  userType: string;
}

interface SearchFormProps {
  onCompare: (urls: string[], userType: string, filters?: FilterState) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onCompare, loading }) => {
  const [urls, setUrls] = useState(['', '']);
  const [userType, setUserType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 3000],
    brands: [],
    minRating: 0,
    userType: ''
  });

  const addUrlField = () => {
    if (urls.length < 4) {
      setUrls([...urls, '']);
    }
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 2) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 3000],
      brands: [],
      minRating: 0,
      userType: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = urls.filter(url => url.trim());
    if (validUrls.length >= 2) {
      onCompare(validUrls, userType || filters.userType, filters);
    }
  };

  const hasActiveFilters = filters.brands.length > 0 || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < 3000 || 
    filters.minRating > 0 || filters.userType !== '';

  return (
    <div className="space-y-4 mb-8">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Compare Laptops with AI</h2>
            <p className="text-muted-foreground">Search for laptops or paste product URLs</p>
          </div>

          <div className="space-y-3">
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <SearchAutocomplete
                  value={url}
                  onChange={(value) => updateUrl(index, value)}
                  placeholder={`Laptop ${index + 1} name or URL...`}
                  className="flex-1"
                />
                {urls.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeUrlField(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {urls.length < 4 && (
            <Button
              type="button"
              variant="outline"
              onClick={addUrlField}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Laptop
            </Button>
          )}

          <div className="flex gap-2">
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="What's your use case? (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="gamer">Gaming</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="creative">Creative Work</SelectItem>
                <SelectItem value="casual">Casual Use</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? 'border-blue-500 text-blue-600' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filters.brands.length + (filters.minRating > 0 ? 1 : 0) + 
                   (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000 ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={loading || urls.filter(url => url.trim()).length < 2}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching & Comparing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Compare Laptops
              </>
            )}
          </Button>
        </form>
      </Card>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
        />
      )}
    </div>
  );
};

export default SearchForm;
