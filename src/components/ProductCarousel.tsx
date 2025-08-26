import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Cpu, HardDrive, Monitor, Battery, ChevronLeft, ChevronRight } from 'lucide-react';
import { LaptopSpecs } from '../types/laptop';

interface ProductCarouselProps {
  products: LaptopSpecs[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [showAll, setShowAll] = React.useState(false);

  if (!products || products.length === 0) {
    return null;
  }

  const visibleProducts = showAll ? products : products.slice(0, 3);
  const hasMore = products.length > 3;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Found {products.length} laptop{products.length !== 1 ? 's' : ''}:
        </h3>
        {hasMore && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${products.length}`}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleProducts.map((laptop, index) => (
          <div key={`${laptop.id}-${index}`} className="w-full">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Product Image */}
                  <div className="aspect-video mb-4 bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={laptop.image || '/placeholder.svg'} 
                      alt={laptop.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    {/* Brand Badge */}
                    <Badge variant="secondary" className="text-xs">
                      {laptop.brand}
                    </Badge>

                    {/* Product Name */}
                    <h4 className="font-semibold text-foreground leading-tight line-clamp-2">
                      {laptop.name}
                    </h4>

                    {/* Price and Rating */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {laptop.currency}{laptop.price}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">
                          {laptop.rating} ({laptop.reviewCount})
                        </span>
                      </div>
                    </div>

                    {/* Key Specs */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">
                          {laptop.cpu.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {laptop.ram}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">
                          {laptop.screen.split(' ')[0]}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {laptop.battery.replace('Up to ', '')}
                        </span>
                      </div>
                    </div>

                    {/* Storage Info */}
                    <div className="text-sm text-muted-foreground">
                      <strong>Storage:</strong> {laptop.storage}
                    </div>

                    {/* Availability */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Seller: {laptop.seller}
                      </span>
                      <Badge 
                        variant={laptop.availability === 'In Stock' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {laptop.availability}
                      </Badge>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => window.open(laptop.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;