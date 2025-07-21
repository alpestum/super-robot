import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps, ReferenceLine, ReferenceDot, ReferenceArea } from 'recharts';
import { YearProjection } from '../../types';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface CashflowChartProps {
  data: YearProjection[];
  propertyPrice: number;
  paybackPeriodInYears: number | null;
  isForPdf?: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded border border-gray-300 text-xs">
        <p className="font-semibold text-gray-700">{label === "0" ? "Initial Investment" : `End of Year ${label}`}</p>
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

const CashflowChart: React.FC<CashflowChartProps> = ({ data, propertyPrice, paybackPeriodInYears, isForPdf = false }) => {
  const chartData = [
    { year: 0, 'Cumulative Cash Flow': -propertyPrice },
    ...data.map(p => ({
      year: p.year,
      'Cumulative Cash Flow': Math.round(p.cumulativeCashFlow),
    }))
  ];
  
  const textFill = isForPdf ? "#333333" : "#6b7280";
  const gridStroke = isForPdf ? "#dddddd" : "#e5e7eb";
  const lineColor = "#8884d8"; 
  const referenceLineColor = "#ef4444"; 
  const breakEvenDotColor = "#dc2626"; 

  let paybackDotYValue: number | undefined = undefined;
  if (paybackPeriodInYears !== null && paybackPeriodInYears > 0) {
    const yearBefore = Math.floor(paybackPeriodInYears);
    const yearAfter = Math.ceil(paybackPeriodInYears);
    const fraction = paybackPeriodInYears - yearBefore;

    const pointBefore = chartData.find(p => p.year === yearBefore);
    const pointAfter = chartData.find(p => p.year === yearAfter);

    if (pointBefore && pointAfter && fraction > 0 && fraction < 1) { 
        paybackDotYValue = pointBefore['Cumulative Cash Flow'] + (pointAfter['Cumulative Cash Flow'] - pointBefore['Cumulative Cash Flow']) * fraction;
         if (Math.abs(paybackDotYValue) < 1) paybackDotYValue = 0; 
    } else if (pointBefore && fraction === 0) { 
        paybackDotYValue = pointBefore['Cumulative Cash Flow'];
    } else if (pointAfter && paybackPeriodInYears === pointAfter.year) { 
        paybackDotYValue = pointAfter['Cumulative Cash Flow'];
    } else if (pointBefore && !pointAfter && data.length > 0 && paybackPeriodInYears === data[data.length-1].year) { 
        paybackDotYValue = pointBefore['Cumulative Cash Flow'];
    }
  }

  const paybackLabel = paybackPeriodInYears !== null && paybackPeriodInYears > 0 && paybackPeriodInYears <= (chartData[chartData.length - 1]?.year || 0) && paybackDotYValue !== undefined 
  ? {
      value: `Payback: ${paybackPeriodInYears.toFixed(1)} yrs`,
      position: (paybackDotYValue >= 0 ? 'top' : 'bottom'),
      fill: breakEvenDotColor,
      fontSize: isForPdf ? 8 : 10,
      dy: paybackDotYValue >= 0 ? -5 : 12 
    }
  : undefined;

  const allValues = chartData.map(p => p['Cumulative Cash Flow']);
  let minDataValue = Math.min(...allValues);
  let maxDataValue = Math.max(...allValues);

  if (maxDataValue < 0) maxDataValue = 0;

  const range = Math.abs(maxDataValue - minDataValue);
  const paddingValue = Math.max(range * 0.05, Math.abs(maxDataValue) * 0.05, Math.abs(minDataValue) * 0.05, 5000);
  
  const finalMinY = Math.floor((minDataValue - paddingValue) / 1000) * 1000;
  const finalMaxY = Math.ceil((maxDataValue + paddingValue) / 1000) * 1000;
  
  const yAxisDomain: [number, number] = [finalMinY, finalMaxY];

  let roiHighlightArea = null;
  if (paybackPeriodInYears !== null && paybackPeriodInYears >= 0 && chartData.length > 1) {
    const roundedPaybackYear = Math.round(paybackPeriodInYears);
    const lastYearInChart = chartData[chartData.length - 1].year;

    let x1Value = Math.max(0, roundedPaybackYear - 1);
    let x2Value = Math.min(lastYearInChart, roundedPaybackYear + 1);
    
    // Ensure x1Value is not greater than x2Value, can happen if payback is at the very end.
    if (x1Value > x2Value) {
        x1Value = x2Value; // Correct to ensure valid range, or could set x1Value to roundedPaybackYear -1 and x2Value to roundedPaybackYear
    }


    const x1Area = x1Value === 0 ? 0 : x1Value - 0.5;
    const x2Area = x2Value + 0.5;

    if (x1Area < x2Area) { // Ensure the area has a positive width
      roiHighlightArea = (
        <ReferenceArea
          x1={x1Area}
          x2={x2Area}
          yAxisId="left" 
          fill="rgba(110, 231, 183, 0.3)" // Tailwind green-300 with opacity
          stroke="rgba(52, 211, 153, 0.4)" // Tailwind green-400 with opacity
          strokeOpacity={0.6}
          ifOverflow="visible"
          label={{
            value: isForPdf? "ROI Window" : "Potential ROI Years",
            fill: '#059669', // Tailwind green-600
            fontSize: isForPdf ? 7 : 9,
            position: 'insideTop',
            dy: isForPdf ? 4 : 8,
          }}
        />
      );
    }
  }


  return (
    <ResponsiveContainer width="100%" height={isForPdf ? 240 : 300}> 
      <LineChart 
        data={chartData} 
        margin={{ top: 5, right: isForPdf ? 10 : 20, left: isForPdf ? 0 : 20, bottom: isForPdf ? (paybackLabel ? 15: 5) : 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
        <XAxis dataKey="year" stroke={textFill} tick={{ fontSize: isForPdf ? 9 : 12, fill: textFill }} />
        <YAxis 
          id="left" // Assign an ID to the YAxis
          domain={yAxisDomain}
          tickFormatter={formatCurrency} 
          stroke={textFill} 
          tick={{ fontSize: isForPdf ? 9 : 12, fill: textFill }} 
          width={isForPdf ? 65 : 80}
          allowDataOverflow={false} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{stroke: isForPdf ? '#cccccc' : '#e0e0e0', strokeWidth: 1}} wrapperStyle={{ zIndex: 1000 }}/>
        <Legend 
          wrapperStyle={{ 
            fontSize: isForPdf ? '9px' : '12px', 
            color: textFill, 
            paddingTop: isForPdf ? '5px' : '0px',
            marginLeft: isForPdf ? '20px' : '0px'
          }} 
        />
        {roiHighlightArea}
        <ReferenceLine y={0} stroke={referenceLineColor} strokeDasharray="4 4" strokeWidth={isForPdf? 1 : 1.5} />
        <Line type="monotone" dataKey="Cumulative Cash Flow" stroke={lineColor} activeDot={{ r: isForPdf ? 4 : 6 }} dot={{r: isForPdf ? 2 : 3}} isAnimationActive={!isForPdf}/>
        {paybackLabel && (
          <ReferenceDot
            x={paybackPeriodInYears}
            y={paybackDotYValue} 
            r={isForPdf ? 3 : 5}
            fill={breakEvenDotColor}
            stroke={isForPdf ? "black" : "white"}
            strokeWidth={isForPdf ? 0.5 : 1}
            isFront={true}
            label={paybackLabel}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CashflowChart;