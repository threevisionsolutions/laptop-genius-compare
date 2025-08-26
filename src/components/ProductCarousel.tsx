import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star, ExternalLink, Cpu, HardDrive, Monitor, Battery } from 'lucide-react';
import { LaptopSpecs } from '../types/laptop';

interface ProductCarouselProps {
  products: LaptopSpecs[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Found {products.length} laptop{products.length !== 1 ? 's' : ''}:
        </h3>
      </div>
      
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {products.map((laptop, index) => (
            <CarouselItem key={`${laptop.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
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
            </CarouselItem>
          ))}
        </CarouselContent>
        {products.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
      
      {products.length > 3 && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Swipe or use arrows to see more products
        </p>
      )}
    </div>
  );
};

export default ProductCarousel;