
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

  // Structure data for radar chart - each subject has values for all laptops
  const radarChartData = [
    { subject: 'Performance', ...laptops.reduce((acc, laptop, index) => {
      const shortName = laptop.name.split(' ').slice(0, 2).join(' ');
      acc[shortName] = Math.min(100, getNumericValue(laptop.ram, 'ram') * 6);
      return acc;
    }, {} as Record<string, number>) },
    { subject: 'Storage', ...laptops.reduce((acc, laptop, index) => {
      const shortName = laptop.name.split(' ').slice(0, 2).join(' ');
      acc[shortName] = Math.min(100, getNumericValue(laptop.storage, 'storage') / 10);
      return acc;
    }, {} as Record<string, number>) },
    { subject: 'Value', ...laptops.reduce((acc, laptop, index) => {
      const shortName = laptop.name.split(' ').slice(0, 2).join(' ');
      acc[shortName] = Math.max(0, 100 - (laptop.price / 50));
      return acc;
    }, {} as Record<string, number>) },
    { subject: 'Rating', ...laptops.reduce((acc, laptop, index) => {
      const shortName = laptop.name.split(' ').slice(0, 2).join(' ');
      acc[shortName] = laptop.rating * 20;
      return acc;
    }, {} as Record<string, number>) },
    { subject: 'Portability', ...laptops.reduce((acc, laptop, index) => {
      const shortName = laptop.name.split(' ').slice(0, 2).join(' ');
      acc[shortName] = laptop.weight ? Math.max(0, 100 - (parseFloat(laptop.weight.match(/[\d.]+/)?.[0] || '5') * 20)) : 50;
      return acc;
    }, {} as Record<string, number>) }
  ];

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
                const numValue = Number(value);
                if (name === 'RAM') return [`${numValue}GB`, name];
                if (name === 'Storage') return [`${numValue}GB`, name];
                if (name === 'Rating') return [`${(numValue/20).toFixed(1)}/5`, name];
                return [numValue, name];
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
          <RadarChart data={radarChartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            {laptops.map((laptop, index) => {
              const shortName = laptop.name.split(' ').slice(0, 2).join(' ');
              return (
                <Radar
                  key={index}
                  name={shortName}
                  dataKey={shortName}
                  stroke={`hsl(${index * 137.5}, 70%, 50%)`}
                  fill={`hsl(${index * 137.5}, 70%, 50%)`}
                  fillOpacity={0.1}
                />
              );
            })}
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default SpecsChart;
