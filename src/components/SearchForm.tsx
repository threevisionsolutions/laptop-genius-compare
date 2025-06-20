
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, X } from 'lucide-react';

interface SearchFormProps {
  onCompare: (urls: string[], userType: string) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onCompare, loading }) => {
  const [urls, setUrls] = useState(['', '']);
  const [userType, setUserType] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = urls.filter(url => url.trim());
    if (validUrls.length >= 2) {
      onCompare(validUrls, userType);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Compare Laptops with AI</h2>
          <p className="text-muted-foreground">Paste product URLs or search terms to get started</p>
        </div>

        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Laptop ${index + 1} URL or name...`}
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
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

        <Select value={userType} onValueChange={setUserType}>
          <SelectTrigger>
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
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          disabled={loading || urls.filter(url => url.trim()).length < 2}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Comparing...
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
  );
};

export default SearchForm;
