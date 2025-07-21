
import { Villa, FinancialProjections, DetailedYearlyProjection } from '../types';

// These are simplified assumptions inspired by the PDF.
// A real app would have more complex, configurable models.
const ASSUMPTIONS = {
  AVG_DAILY_RATE_PER_BR: 48, // Average daily rate per bedroom
  BASE_OCCUPANCY: 0.65, // 65%
  OCCUPANCY_RAMP_UP: [0.9, 1.0, 1.05, 1.0, 1.0], // Multiplier for first 5 years
  ANNUAL_BASE_GROWTH: 0.03, // 3%
  MANAGEMENT_FEE_PERCENT: 0.1, // 10% of revenue
  UTILITIES_MAINT_PERCENT: 0.1, // 10% of revenue
  TAXES_PERCENT_OF_REVENUE: 0.1, // 10% of revenue
  INITIAL_COSTS_FURNITURE_DECOR: 5000,
  INITIAL_COSTS_NOTARY: 1090,
};

export const calculateFinancialProjections = (villa: Villa): FinancialProjections => {
  const leaseDuration = typeof villa.leaseholdYears === 'number' ? villa.leaseholdYears : (parseInt(String(villa.leaseholdYears)) || 20);
  const propertyPrice = villa.price;

  const yearlyProjections: DetailedYearlyProjection[] = [];
  let cumulativeCashFlow = 0;

  const avgDailyRate = villa.bedrooms * ASSUMPTIONS.AVG_DAILY_RATE_PER_BR;

  for (let year = 1; year <= leaseDuration; year++) {
    const rampUpFactor = year <= ASSUMPTIONS.OCCUPANCY_RAMP_UP.length ? ASSUMPTIONS.OCCUPANCY_RAMP_UP[year - 1] : 1.0;
    const growthFactor = Math.pow(1 + ASSUMPTIONS.ANNUAL_BASE_GROWTH, year - 1);
    
    const avgOccupancy = ASSUMPTIONS.BASE_OCCUPANCY * rampUpFactor;
    const revenue = avgDailyRate * 365 * avgOccupancy * growthFactor;
    
    const opCosts = revenue * (ASSUMPTIONS.MANAGEMENT_FEE_PERCENT + ASSUMPTIONS.UTILITIES_MAINT_PERCENT + ASSUMPTIONS.TAXES_PERCENT_OF_REVENUE);
    const opNetProfit = revenue - opCosts;
    
    const addCostExp = year === 1 ? (ASSUMPTIONS.INITIAL_COSTS_FURNITURE_DECOR + ASSUMPTIONS.INITIAL_COSTS_NOTARY) : 0;
    const initialInvestment = year === 1 ? propertyPrice : 0;
    
    const cashFlowNet = opNetProfit - addCostExp - initialInvestment;
    cumulativeCashFlow += cashFlowNet;

    yearlyProjections.push({
      year,
      revenue,
      opCosts,
      opNetProfit,
      addCostExp,
      cashFlowNet: cashFlowNet + (year === 1 ? initialInvestment : 0), // Show net without investment for table clarity
      avgOccupancy
    });
  }

  // Calculate summary metrics (using first 5 years as per PDF)
  const first5Years = yearlyProjections.slice(0, 5);
  const total5YearNetProfit = first5Years.reduce((sum, p) => sum + p.opNetProfit, 0);
  const avgYearlyNetIncome = total5YearNetProfit / 5;
  const totalInvestment = propertyPrice + ASSUMPTIONS.INITIAL_COSTS_FURNITURE_DECOR + ASSUMPTIONS.INITIAL_COSTS_NOTARY;
  const avgYearlyNetYield = (avgYearlyNetIncome / propertyPrice) * 100;
  const avgOccupancyRate = first5Years.reduce((sum, p) => sum + p.avgOccupancy, 0) / 5 * 100;

  // Payback Period Calculation
  let cumulativeForPayback = -totalInvestment;
  let paybackPeriodYears: number | null = null;
  for (const proj of yearlyProjections) {
    cumulativeForPayback += proj.opNetProfit;
    if (cumulativeForPayback >= 0) {
      const remainingNeeded = -(cumulativeForPayback - proj.opNetProfit);
      const fractionOfYear = remainingNeeded / proj.opNetProfit;
      paybackPeriodYears = proj.year - 1 + fractionOfYear;
      break;
    }
  }

  // Prepare chart data
  const cumulativeCashFlowData = yearlyProjections.map(p => ({
    year: p.year,
    'Cumulative Cash Flow': yearlyProjections.slice(0, p.year).reduce((sum, inner_p) => sum + inner_p.cashFlowNet, 0),
  }));
  // Start cumulative cash flow from year 0
  cumulativeCashFlowData.unshift({ year: 0, 'Cumulative Cash Flow': -totalInvestment });


  const annualPerformanceData = yearlyProjections.slice(0, 10).map(p => ({
    year: p.year,
    'Revenue': p.revenue,
    'Costs': p.opCosts,
    'Net Profit': p.opNetProfit,
  }));

  return {
    paybackPeriodYears,
    avgYearlyNetYield,
    avgYearlyNetIncome,
    avgDailyRate,
    leaseDurationYears: leaseDuration,
    avgOccupancyRate,
    cumulativeCashFlowData,
    annualPerformanceData,
    detailedYearlyProjectionsData: yearlyProjections.slice(0, 10),
  };
};
