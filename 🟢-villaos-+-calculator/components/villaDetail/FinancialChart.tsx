
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface FinancialChartProps {
  data: any[];
  type: 'cumulative' | 'annual';
  theme: 'light' | 'dark';
}

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-lg rounded-md border border-ios-gray-300 dark:border-dark-ios-gray-400">
        <p className="label font-semibold text-black dark:text-white">{`Year ${label}`}</p>
        {payload.map((p: any, index: number) => (
            <p key={index} style={{ color: p.color }}>
                {`${p.name}: ${p.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

const FinancialChart: React.FC<FinancialChartProps> = ({ data, type, theme }) => {
  const gridColor = theme === 'dark' ? '#48484A' : '#E5E5EA';
  const textColor = theme === 'dark' ? '#AEAEB2' : '#8E8E93';

  if (type === 'cumulative') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="year" stroke={textColor} tick={{ fontSize: 12 }} />
          <YAxis stroke={textColor} tick={{ fontSize: 12 }} tickFormatter={formatCurrency}/>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007AFF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="Cumulative Cash Flow" stroke="#007AFF" fill="url(#colorUv)" strokeWidth={2} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="year" stroke={textColor} tick={{ fontSize: 12 }} />
        <YAxis stroke={textColor} tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{fontSize: "12px"}}/>
        <Bar dataKey="Revenue" fill="#34C759" />
        <Bar dataKey="Costs" fill="#FF3B30" />
        <Bar dataKey="Net Profit" fill="#007AFF" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FinancialChart;
