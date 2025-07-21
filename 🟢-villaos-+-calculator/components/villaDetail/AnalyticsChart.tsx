import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BedroomPriceStat } from '../../types';

interface AnalyticsChartProps {
    data: BedroomPriceStat[];
    highlightBedrooms: number;
    theme: 'light' | 'dark';
}

const formatPrice = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
};

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-lg rounded-md border border-ios-gray-300 dark:border-dark-ios-gray-400">
                <p className="label font-semibold text-black dark:text-white">{`${label} Bedroom Villas`}</p>
                <p className="intro text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">{`Avg. Price: ${formatPrice(data.avgPrice)}`}</p>
                <p className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500">{`Based on ${data.count} listing(s)`}</p>
            </div>
        );
    }
    return null;
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, highlightBedrooms, theme }) => {
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = theme === 'dark' ? '#AEAEB2' : '#8E8E93';
    const highlightColor = theme === 'dark' ? '#58AFFF' : '#007AFF'; // Apple Blue Light / Default
    const defaultColor = theme === 'dark' ? '#48484A' : '#D1D1D6';   // Dark Gray / Light Gray

    const chartData = data.map(item => ({ ...item, name: `${item.bedrooms}BR` }));

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="name" stroke={textColor} tick={{ fontSize: 12 }} />
                    <YAxis stroke={textColor} tick={{ fontSize: 12 }} tickFormatter={formatPrice} />
                    <Tooltip content={<CustomTooltipContent />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
                    <Bar dataKey="avgPrice" name="Average Price" barSize={30}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.bedrooms === highlightBedrooms ? highlightColor : defaultColor}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AnalyticsChart;
