
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { YearProjection } from '../../types';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface CostDistributionChartProps {
  data: YearProjection[];
  isForPdf?: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white p-3 shadow-md rounded border border-gray-300 text-xs">
        <p className="font-semibold text-gray-700">{`${item.name}`}</p>
        <p className="text-sm" style={{color: item.payload.fill}}>{`Amount: ${formatCurrency(item.value as number)}`}</p>
        <p className="text-sm" style={{color: item.payload.fill}}>{`Percentage: ${formatPercentage(item.payload.percent)}`}</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabelPdf = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, name, fill } = props;
  if (percent < 0.04) return null; // Don't render label for very small slices
  
  const radius = outerRadius * 1.15; // Position label slightly outside the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <g>
      <text x={x} y={y} fill={"#333333"} textAnchor={textAnchor} dominantBaseline="central" fontSize={8.5}>
        {`${name.substring(0,12)}${name.length > 12 ? '...' : ''}`}
      </text>
      <text x={x} y={y + 8} fill={"#555555"} textAnchor={textAnchor} dominantBaseline="central" fontSize={7.5}>
        {`(${formatPercentage(percent)})`}
      </text>
    </g>
  );
};

const renderCustomizedLabelApp = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, name, fill, x, y } = props;
  if (percent < 0.02) return null;

  return (
    <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="normal">
      {`${name} (${(percent * 100).toFixed(1)}%)`}
    </text>
  );
};


const CostDistributionChart: React.FC<CostDistributionChartProps> = ({ data, isForPdf = false }) => {
  if (!data.length) return null;

  const totalManagementFee = data.reduce((sum, p) => sum + p.managementFee, 0);
  const totalUtilities = data.reduce((sum, p) => sum + p.utilitiesMaintenance, 0);
  const totalTaxes = data.reduce((sum, p) => sum + p.taxes, 0);
  const totalOtaFees = data.reduce((sum, p) => sum + p.otaFees, 0);
  const grandTotalCosts = totalManagementFee + totalUtilities + totalTaxes + totalOtaFees;

  if (grandTotalCosts === 0) {
    return <p className={`text-center ${isForPdf ? 'text-black text-sm' : 'text-gray-500'}`}>No costs to display.</p>;
  }
  
  const costData = [
    { name: 'Management Agency', value: totalManagementFee, percent: totalManagementFee / grandTotalCosts },
    { name: 'Utilities & Maint.', value: totalUtilities, percent: totalUtilities / grandTotalCosts },
    { name: 'Taxes', value: totalTaxes, percent: totalTaxes / grandTotalCosts },
    { name: 'OTA Fees', value: totalOtaFees, percent: totalOtaFees / grandTotalCosts },
  ].filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']; 
  
  const textFill = isForPdf ? "#333333" : "#6b7280";

  return (
    <ResponsiveContainer width="100%" height={isForPdf ? 220 : 300}>
      <PieChart 
        margin={{ top: isForPdf ? 20 : 5, right: isForPdf ? 20 : 20, bottom: isForPdf ? 20 : 5, left: isForPdf ? 20 : 20 }}
      >
        <Pie
          data={costData}
          cx="50%"
          cy="50%"
          labelLine={isForPdf ? false : true} // External lines for app, internal/custom for PDF
          label={isForPdf ? renderCustomizedLabelPdf : renderCustomizedLabelApp}
          outerRadius={isForPdf ? 60 : 80} // Smaller radius for PDF to allow external labels more space
          innerRadius={isForPdf ? 0 : 45} 
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          stroke={isForPdf ? "#FFFFFF" : "#fff"} // White stroke for PDF for cleaner look
          strokeWidth={isForPdf ? 1 : 1.5}
          isAnimationActive={!isForPdf}
        >
          {costData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }}/>
        {!isForPdf && <Legend wrapperStyle={{ fontSize: '11px', color: textFill, paddingTop: '10px', paddingBottom: '0px' }} />}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CostDistributionChart;
