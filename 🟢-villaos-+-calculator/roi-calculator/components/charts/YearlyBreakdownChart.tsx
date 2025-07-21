
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { YearProjection } from '../../types';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface YearlyBreakdownChartProps {
  data: YearProjection[];
  isForPdf?: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded border border-gray-300 text-xs">
        <p className="font-semibold text-gray-700">{`Year ${label}`}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${formatCurrency(entry.value as number)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const YearlyBreakdownChart: React.FC<YearlyBreakdownChartProps> = ({ data, isForPdf = false }) => {
  const chartData = data.map(p => ({
    year: p.year,
    Revenue: Math.round(p.revenue),
    Costs: Math.round(p.totalCosts),
    'Net Profit': Math.round(p.netProfit),
  }));

  const textFill = isForPdf ? "#333333" : "#6b7280"; 
  const gridStroke = isForPdf ? "#dddddd" : "#e5e7eb";

  const revenueColor = "#5CB85C"; // --color-positive
  const costsColor = "#D9534F";   // --color-negative
  const netProfitColor = "#4A90E2"; // --color-primary

  return (
    <ResponsiveContainer width="100%" height={isForPdf ? 220 : 300}>
      <BarChart 
        data={chartData} 
        margin={{ top: 5, right: isForPdf ? 5 : 20, left: isForPdf ? 0 : 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="year" stroke={textFill} tick={{ fontSize: isForPdf ? 9 : 12, fill: textFill }} />
        <YAxis 
          tickFormatter={formatCurrency} 
          stroke={textFill} 
          tick={{ fontSize: isForPdf ? 9 : 12, fill: textFill }} 
          width={isForPdf ? 65 : 80} // Slightly increased width for PDF for better label fit
        />
        <Tooltip content={<CustomTooltip />} cursor={{fill: isForPdf ? '#f0f0f0' : '#e9ecef'}} wrapperStyle={{ zIndex: 1000 }}/>
        <Legend 
          wrapperStyle={{ 
            fontSize: isForPdf ? '9px' : '12px', 
            color: textFill, 
            paddingTop: isForPdf ? '5px' : '0px',
            marginLeft: isForPdf ? '20px' : '0px' // Adjust legend position for PDF
          }} 
        />
        <Bar dataKey="Revenue" fill={revenueColor} maxBarSize={isForPdf ? 25 : undefined} isAnimationActive={!isForPdf} />
        <Bar dataKey="Costs" fill={costsColor} maxBarSize={isForPdf ? 25 : undefined} isAnimationActive={!isForPdf} />
        <Bar dataKey="Net Profit" fill={netProfitColor} maxBarSize={isForPdf ? 25 : undefined} isAnimationActive={!isForPdf} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default YearlyBreakdownChart;