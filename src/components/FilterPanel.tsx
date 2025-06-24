
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  minRating: number;
  userType: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const brands = ['Apple', 'Dell', 'Lenovo', 'ASUS', 'HP', 'MSI', 'Acer'];
  const userTypes = ['student', 'gamer', 'business', 'creative', 'casual'];

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const hasActiveFilters = filters.brands.length > 0 || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < 3000 || 
    filters.minRating > 0 || filters.userType !== '';

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label>Price Range</Label>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
            max={3000}
            min={0}
            step={50}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <Label>Brands</Label>
        <div className="grid grid-cols-2 gap-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={filters.brands.includes(brand)}
                onCheckedChange={() => handleBrandToggle(brand)}
              />
              <Label
                htmlFor={brand}
                className="text-sm font-normal cursor-pointer"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
        {filters.brands.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.brands.map((brand) => (
              <Badge key={brand} variant="secondary" className="text-xs">
                {brand}
                <button
                  onClick={() => handleBrandToggle(brand)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Minimum Rating */}
      <div className="space-y-3">
        <Label>Minimum Rating</Label>
        <div className="px-2">
          <Slider
            value={[filters.minRating]}
            onValueChange={(value) => onFiltersChange({ ...filters, minRating: value[0] })}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filters.minRating > 0 ? `${filters.minRating}+ stars` : 'Any rating'}
        </div>
      </div>

      {/* User Type */}
      <div className="space-y-3">
        <Label>Use Case</Label>
        <div className="grid grid-cols-1 gap-2">
          {userTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={filters.userType === type}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, userType: checked ? type : '' })
                }
              />
              <Label
                htmlFor={type}
                className="text-sm font-normal cursor-pointer capitalize"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default FilterPanel;
