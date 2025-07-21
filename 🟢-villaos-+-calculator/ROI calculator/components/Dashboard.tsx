
import React, { useState } from 'react';
import { CalculatedData, VillaInputs, YearProjection } from '../types';
import { Card } from './ui/Card';
import YearlyBreakdownChart from './charts/YearlyBreakdownChart';
import CashflowChart from './charts/CashflowChart';
import CostDistributionChart from './charts/CostDistributionChart';
import { Button } from './ui/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';


interface DashboardProps {
  data: CalculatedData | null;
  inputs: VillaInputs;
}

const formatCurrency = (value: number | null | undefined, defaultVal: string = 'N/A') => {
  if (value == null || !isFinite(value)) {
    return defaultVal;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

const formatPercentage = (value: number | null | undefined, defaultVal: string = 'N/A') => {
  if (value == null || !isFinite(value)) return defaultVal;
  return `${(value * 100).toFixed(1)}%`;
}

const formatYears = (value: number | null | undefined, defaultVal: string = 'N/A') => {
  if (value == null || !isFinite(value)) return defaultVal;
   if (value < 0.1 && value !== 0) return "<0.1 Yrs";
  return `${value.toFixed(1)} Years`;
}

const MetricCard: React.FC<{ title: string; value: string; className?: string, tooltip?: string }> = ({ title, value, className, tooltip }) => (
  <div className={`bg-white p-4 shadow-lg rounded-xl ${className || ''}`} title={tooltip}>
    <h4 className="text-sm font-medium text-gray-500 truncate">{title}</h4>
    <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);

interface StrategyMetricCardProps {
  title: string;
  value: string;
  description?: string;
  valueClassName?: string;
  cardBgClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

const StrategyMetricCard: React.FC<StrategyMetricCardProps> = ({
  title,
  value,
  description,
  valueClassName,
  cardBgClassName,
  titleClassName,
  descriptionClassName,
}) => (
  <div className={`p-4 rounded-lg ${cardBgClassName || 'bg-blue-50 border border-blue-200'}`}>
    <h4 className={`text-sm font-medium ${titleClassName || 'text-blue-700'}`}>{title}</h4>
    <p className={`mt-1 text-xl font-semibold ${valueClassName || 'text-blue-900'}`}>{value}</p>
    {description && <p className={`mt-1 text-xs whitespace-pre-line ${descriptionClassName || 'text-blue-600'}`}>{description}</p>}
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ data, inputs }) => {
  const [showAllYears, setShowAllYears] = useState(false);

  if (!data) {
    return (
      <Card title="Results Dashboard">
        <p className="text-center text-gray-500 py-10">Please fill in the inputs and results will be displayed here.</p>
      </Card>
    );
  }

  const {
    yearlyProjections,
    breakEvenYear,
    paybackPeriodInYears,
    averageAnnualNetYieldPercent,
    averageOverallDailyRate,
    averageOverallOccupancy,
    averageFirstFiveYearsIncome,
    resaleStrategyAtYear5,
  } = data;

  const projectionsToDisplay = showAllYears ? yearlyProjections : yearlyProjections.slice(0, 10);
  
  const mainStrategyTitle = "Main Strategy: Buy & Rent until Lease End";

  // For Resale Strategy Card: Estimated Sale Price
  let estSalePriceCardValue = 'N/A';
  let estSalePriceCardDescription = "";

  if (inputs.enableResaleStrategy && resaleStrategyAtYear5) {
    if (resaleStrategyAtYear5.grossResaleValueBeforeCosts === 0 || resaleStrategyAtYear5.grossResaleValueBeforeCosts === null) {
      estSalePriceCardValue = 'N/A (Unprofitable/Lease Ends)';
      estSalePriceCardDescription = "Resale is not projected due to unprofitability in Year 5 or lease ending too soon for resale estimation.";
    } else {
      estSalePriceCardValue = formatCurrency(resaleStrategyAtYear5.grossResaleValueBeforeCosts);
      estSalePriceCardDescription = "Estimated market price a buyer would pay. Based on the average operational net profit of the first 5 years, profit multiplier, and lease adjustment.\n";
      
      const appliedCostsTexts: string[] = [];
      if (inputs.applySaleTaxOnResale) {
          appliedCostsTexts.push(`${inputs.saleTaxRateOnResale * 100}% tax`);
      }
      if (inputs.applyAgencyCommissionOnResale) {
          appliedCostsTexts.push(`${inputs.agencyCommissionRateOnResale * 100}% commission`);
      }

      let sellerNetProceedsText = "";
      if (resaleStrategyAtYear5.projectedResaleValue === null) {
        sellerNetProceedsText = "Seller's net proceeds calculation is unavailable.";
      } else if (appliedCostsTexts.length > 0) {
        if (resaleStrategyAtYear5.grossResaleValueBeforeCosts > 0 && resaleStrategyAtYear5.projectedResaleValue === 0 && (inputs.applySaleTaxOnResale || inputs.applyAgencyCommissionOnResale)) {
          sellerNetProceedsText = `Seller's net proceeds would be $0 after accounting for ${appliedCostsTexts.join(' & ')}.`;
        } else {
          sellerNetProceedsText = `Seller's net proceeds after ${appliedCostsTexts.join(' & ')} would be: ${formatCurrency(resaleStrategyAtYear5.projectedResaleValue)}.`;
        }
      } else {
          sellerNetProceedsText = `Seller's net proceeds (no sale costs applied) would be: ${formatCurrency(resaleStrategyAtYear5.projectedResaleValue)}.`;
      }
      estSalePriceCardDescription += sellerNetProceedsText;
    }
  }

  let strategyNetProfitValueColor = 'text-blue-900';
  let strategyNetProfitCardBg = 'bg-blue-50 border border-blue-200';
  let strategyNetProfitTitleColor = 'text-blue-700';
  let strategyNetProfitDescriptionColor = 'text-blue-600';

  if (inputs.enableResaleStrategy && resaleStrategyAtYear5 && resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale !== null) {
    if (resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale > 0) {
      strategyNetProfitValueColor = 'text-green-700';
      strategyNetProfitCardBg = 'bg-green-50 border border-green-200';
      strategyNetProfitTitleColor = 'text-green-700';
      strategyNetProfitDescriptionColor = 'text-green-600';
    }
    // Removed red for negative as per user focus on green for positive
  }


  return (
    <Card title="Results Dashboard" className="bg-transparent shadow-none md:bg-white md:shadow-lg md:rounded-lg">
      
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 px-1">{mainStrategyTitle}</h2>
        <p className="text-sm text-gray-600 mb-4 px-1">
            This section outlines the financial projections if you hold and rent out the property for the entire duration of the lease ({inputs.leaseYears} years).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <MetricCard title="Est. Payback Period (Operational)" value={formatYears(paybackPeriodInYears, breakEvenYear ? `Year ${breakEvenYear}` : 'N/A')} />
            <MetricCard title="Avg. Net Yield (First 5 Yrs Ops.)" value={formatPercentage(averageAnnualNetYieldPercent)} />
            <MetricCard title="Avg. Income (First 5 Yrs Ops.)" value={formatCurrency(averageFirstFiveYearsIncome)} />
            <MetricCard title="Lease Duration" value={`${inputs.leaseYears} Years`} />
            <MetricCard title="Avg. Daily Rate (Overall Ops.)" value={formatCurrency(averageOverallDailyRate)} />
            <MetricCard title="Avg. Occupancy (Overall Ops.)" value={formatPercentage(averageOverallOccupancy)} />
        </div>

        <div className="space-y-8">
            <Card className="overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 px-4 pt-4 sm:px-6 sm:pt-5">Yearly Financial Breakdown (Operational)</h3>
            <div id="app-yearly-breakdown-chart-container" className="h-[250px] sm:h-[300px]">
                <YearlyBreakdownChart data={yearlyProjections} />
            </div>
            </Card>
            <Card className="overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 px-4 pt-4 sm:px-6 sm:pt-5">Cumulative Cash Flow (Operational)</h3>
            <div id="app-cashflow-chart-container" className="h-[250px] sm:h-[300px]">
                <CashflowChart data={yearlyProjections} propertyPrice={inputs.propertyPrice} paybackPeriodInYears={paybackPeriodInYears} />
            </div>
            </Card>
            <Card className="overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 px-4 pt-4 sm:px-6 sm:pt-5">Cost Distribution (Overall Operational)</h3>
            <div id="app-cost-dist-chart-container" className="h-[250px] sm:h-[300px]">
                <CostDistributionChart data={yearlyProjections} />
            </div>
            </Card>
        </div>

        <div className="mt-8">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 px-4 pt-4 sm:px-6 sm:pt-5">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Yearly Projections Table (Operational)</h3>
                {yearlyProjections.length > 10 && (
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllYears(!showAllYears)}
                    icon={showAllYears ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    >
                    {showAllYears ? `Show Fewer (First 10)` : `Show All ${yearlyProjections.length} Years`}
                    </Button>
                )}
                </div>
                <div className="overflow-x-auto" id="app-projections-table-container">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {['Year', 'Revenue', 'Costs', 'Net Profit', 'Net Yield %', 'Cash Flow', 'Avg. Occupancy', 'Avg. Daily Rate'].map(header => (
                        <th key={header} scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {projectionsToDisplay.map((p) => (
                        <tr key={p.year} className={`hover:bg-gray-50 ${p.year === breakEvenYear ? 'bg-blue-50 font-semibold' : ''}`}>
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.year}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formatCurrency(p.revenue)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formatCurrency(p.totalCosts)}</td>
                        <td className={`px-3 py-3 whitespace-nowrap text-sm font-semibold ${p.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(p.netProfit)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formatPercentage(p.netYieldPercent)}</td>
                        <td className={`px-3 py-3 whitespace-nowrap text-sm font-semibold ${p.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(p.cumulativeCashFlow)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formatPercentage(p.avgOccupancy)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formatCurrency(p.avgDailyRate)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                {yearlyProjections.length > 10 && !showAllYears && (
                    <p className="text-xs text-gray-500 mt-2 px-4 pb-4 sm:px-6 sm:pb-5">Showing first 10 years. Click button above to see full projection.</p>
                )}
                {(yearlyProjections.length <= 10 || showAllYears) && (
                    <div className="h-1"></div> 
                )}
            </Card>
        </div>
      </div>

      {inputs.enableResaleStrategy && resaleStrategyAtYear5 && inputs.leaseYears >= 5 && (
        <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-300">
            <Card title="Alternative Strategy: Buy, Rent (5 Years) & Resell" className="bg-blue-50/30 border border-blue-200 shadow-lg">
                 <p className="text-sm text-gray-700 mb-4 px-1">
                    This scenario explores an alternative approach: operating the villa for 5 years and then selling it as an ongoing rental business. 
                    The resale value is estimated based on its average operational net profit of the first 5 years, your chosen profit multiplier ({inputs.resaleProfitMultiplier}x), and adjusted for the remaining lease term.
                    Optional sale tax ({inputs.saleTaxRateOnResale*100}%) and agency commission ({inputs.agencyCommissionRateOnResale*100}%) are factored into the seller's net proceeds if enabled.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <StrategyMetricCard 
                        title="Est. Sale Price" 
                        value={estSalePriceCardValue}
                        description={estSalePriceCardDescription}
                    />
                    <StrategyMetricCard 
                        title="Strategy ROI" 
                        value={formatPercentage(resaleStrategyAtYear5.strategyRoiPercent)}
                        description="Total return on initial investment after 5 years of operations and net resale proceeds to seller."
                    />
                    <StrategyMetricCard 
                        title="Strategy Net Profit" 
                        value={formatCurrency(resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale)}
                        valueClassName={strategyNetProfitValueColor}
                        cardBgClassName={strategyNetProfitCardBg}
                        titleClassName={strategyNetProfitTitleColor}
                        descriptionClassName={strategyNetProfitDescriptionColor}
                        description={`Total net profit of this 5-year strategy, after initial investment, 5 years of operations, and net resale proceeds to seller.`}
                    />
                </div>

                <h4 className="text-md font-semibold text-gray-800 mt-6 mb-2">5-Year Cash Flow (Including Resale)</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                        <tr>
                            {['Year', 'Revenue', 'Op. Costs', 'Op. Net Profit', 'Cumulative Cash Flow (incl. Seller Net Resale in Yr 5)'].map(header => (
                            <th key={header} scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {resaleStrategyAtYear5.yearlyProjectionsForStrategy.map((p, index) => (
                            <tr key={`strat-${p.year}`} className={`hover:bg-gray-50 ${index === 4 ? 'bg-blue-50 font-semibold' : ''}`}>
                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.year}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formatCurrency(p.revenue)}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{formatCurrency(p.totalCosts)}</td>
                                <td className={`px-3 py-3 whitespace-nowrap text-sm font-semibold ${p.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(p.netProfit)}</td>
                                <td className={`px-3 py-3 whitespace-nowrap text-sm font-bold ${p.cumulativeCashFlow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                    {formatCurrency(p.cumulativeCashFlow)}
                                    {index === 4 && <span className="text-xs text-blue-600 block">(Includes Seller's Net Resale Value)</span>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                 {resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale !== null && resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale > 0 && (
                    <p className="mt-4 text-sm text-green-700 font-semibold">
                        This strategy projects a positive net profit for the seller, indicating a potentially profitable outcome for this 5-year resale scenario.
                    </p>
                )}
                {resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale !== null && resaleStrategyAtYear5.finalCumulativeCashFlowIncludingResale <= 0 && (
                     <p className="mt-4 text-sm text-red-700 font-semibold">
                        This strategy projects a neutral or negative net profit for the seller. Review assumptions for this 5-year resale scenario.
                    </p>
                )}
            </Card>
        </div>
      )}
      {inputs.enableResaleStrategy && inputs.leaseYears < 5 && (
         <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-300">
            <Card title="Alternative Strategy: Buy, Rent (5 Years) & Resell">
                <p className="text-center text-gray-600 py-6">
                    The "Buy, Rent (5 Years) & Resell" strategy is not applicable because the lease term ({inputs.leaseYears} years) is less than 5 years.
                </p>
            </Card>
        </div>
      )}
      {!inputs.enableResaleStrategy && (
         <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-300">
            <Card title="Alternative Strategy: Buy, Rent (5 Years) & Resell">
                <p className="text-center text-gray-600 py-6">
                    The 5-Year Resale Strategy is currently disabled in the input settings.
                </p>
            </Card>
        </div>
      )}


    </Card>
  );
};

export default Dashboard;
