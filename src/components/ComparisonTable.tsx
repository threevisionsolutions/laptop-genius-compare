
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LaptopSpecs } from '../types/laptop';
import { Share, BookmarkIcon } from 'lucide-react';
import SpecsChart from './SpecsChart';
import ExportShare from './ExportShare';
import DataSourceIndicator from './DataSourceIndicator';

interface ComparisonTableProps {
  laptops: LaptopSpecs[];
  onSave: () => void;
  onShare: () => void;
  aiSummary?: string;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ laptops, onSave, onShare, aiSummary }) => {
  const specs = [
    { key: 'cpu', label: 'Processor' },
    { key: 'ram', label: 'RAM' },
    { key: 'storage', label: 'Storage' },
    { key: 'screen', label: 'Display' },
    { key: 'battery', label: 'Battery' },
    { key: 'weight', label: 'Weight' },
    { key: 'os', label: 'Operating System' }
  ];

  return (
    <div className="space-y-6">
      <ExportShare laptops={laptops} aiSummary={aiSummary} />
      
      <SpecsChart laptops={laptops} />

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Detailed Comparison</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSave}>
              <BookmarkIcon className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={onShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Specification</th>
                {laptops.map((laptop) => (
                  <th key={laptop.id} className="text-left p-4 min-w-64">
                    <div className="space-y-2">
                      <img 
                        src={laptop.image || (laptop as any).images?.[0] || `https://placehold.co/320x256/333333/FFFFFF/png?text=${encodeURIComponent(laptop.brand + ' Laptop')}`}
                        alt={laptop.name}
                        className="w-20 h-16 object-cover rounded mx-auto"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.includes('placehold.co')) {
                            target.src = `https://placehold.co/320x256/333333/FFFFFF/png?text=${encodeURIComponent(laptop.brand + ' Laptop')}`;
                          }
                        }}
                      />
                      <div>
                        <div className="font-bold text-sm">{laptop.name}</div>
                        <div className="text-2xl font-bold text-green-600">
                          {laptop.currency}{laptop.price.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span>{laptop.rating}</span>
                          <span className="text-muted-foreground">({laptop.reviewCount})</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {laptop.seller}
                        </Badge>
                        <DataSourceIndicator 
                          laptopId={laptop.id}
                          className="text-xs mt-1"
                        />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map((spec) => (
                <tr key={spec.key} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">{spec.label}</td>
                  {laptops.map((laptop) => (
                    <td key={laptop.id} className="p-4">
                      {laptop[spec.key as keyof LaptopSpecs]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ComparisonTable;
