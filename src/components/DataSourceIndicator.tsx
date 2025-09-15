import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, Globe, TestTube } from 'lucide-react';

interface DataSourceIndicatorProps {
  laptopId: string;
  className?: string;
}

const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({ laptopId, className }) => {
  const getSourceInfo = (id: string) => {
    if (id.includes('real')) {
      return {
        type: 'Real Data',
        icon: Globe,
        variant: 'default' as const,
        description: 'Scraped from live websites'
      };
    } else if (id.includes('mock') || id.includes('default') || id.includes('emergency')) {
      return {
        type: 'Sample Data',
        icon: TestTube,
        variant: 'secondary' as const,
        description: 'Curated sample for demonstration'
      };
    } else {
      return {
        type: 'Database',
        icon: Database,
        variant: 'outline' as const,
        description: 'From product database'
      };
    }
  };

  const source = getSourceInfo(laptopId);
  const Icon = source.icon;

  return (
    <Badge variant={source.variant} className={`flex items-center gap-1 ${className}`}>
      <Icon className="w-3 h-3" />
      {source.type}
    </Badge>
  );
};

export default DataSourceIndicator;