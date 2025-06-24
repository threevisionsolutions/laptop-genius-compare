
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { LaptopSpecs } from '../types/laptop';

interface SpecsChartProps {
  laptops: LaptopSpecs[];
}

const SpecsChart: React.FC<SpecsChartProps> = ({ laptops }) => {
  // Convert specs to numeric values for comparison
  const getNumericValue = (spec: string, type: 'ram' | 'storage' | 'rating' | 'price') => {
    switch (type) {
      case 'ram':
        return parseInt(spec.match(/\d+/)?.[0] || '0');
      case 'storage':
        const storageMatch = spec.match(/(\d+)(GB|TB)/);
        if (!storageMatch) return 0;
        const value = parseInt(storageMatch[1]);
        return storageMatch[2] === 'TB' ? value * 1000 : value;
      case 'rating':
        return parseFloat(spec.toString());
      case 'price':
        return parseFloat(spec.toString());
      default:
        return 0;
    }
  };

  const chartData = laptops.map(laptop => ({
    name: laptop.name.split(' ').slice(0, 2).join(' '),
    fullName: laptop.name,
    RAM: getNumericValue(laptop.ram, 'ram'),
    Storage: getNumericValue(laptop.storage, 'storage'),
    Rating: laptop.rating * 20, // Scale to 100
    Price: laptop.price,
    brand: laptop.brand
  }));

  const radarData = laptops.map(laptop => ({
    laptop: laptop.name.split(' ').slice(0, 2).join(' '),
    Performance: Math.min(100, getNumericValue(laptop.ram, 'ram') * 6), // Scale RAM to ~100
    Storage: Math.min(100, getNumericValue(laptop.storage, 'storage') / 10), // Scale storage
    Value: Math.max(0, 100 - (laptop.price / 50)), // Inverse price for value
    Rating: laptop.rating * 20,
    Portability: laptop.weight ? Math.max(0, 100 - (parseFloat(laptop.weight.match(/[\d.]+/)?.[0] || '5') * 20)) : 50
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Price Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`$${value}`, name]}
              labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
            />
            <Bar dataKey="Price" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Specifications Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'RAM') return [`${value}GB`, name];
                if (name === 'Storage') return [`${value}GB`, name];
                if (name === 'Rating') return [`${(value/20).toFixed(1)}/5`, name];
                return [value, name];
              }}
              labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
            />
            <Bar dataKey="RAM" fill="#82ca9d" />
            <Bar dataKey="Storage" fill="#ffc658" />
            <Bar dataKey="Rating" fill="#ff7300" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Performance Radar</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData[0] ? [radarData[0]] : []}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            {radarData.map((data, index) => (
              <Radar
                key={index}
                name={data.laptop}
                dataKey="Performance"
                stroke={`hsl(${index * 137.5}, 70%, 50%)`}
                fill={`hsl(${index * 137.5}, 70%, 50%)`}
                fillOpacity={0.1}
                data={[
                  { subject: 'Performance', [data.laptop]: data.Performance },
                  { subject: 'Storage', [data.laptop]: data.Storage },
                  { subject: 'Value', [data.laptop]: data.Value },
                  { subject: 'Rating', [data.laptop]: data.Rating },
                  { subject: 'Portability', [data.laptop]: data.Portability }
                ]}
              />
            ))}
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default SpecsChart;
