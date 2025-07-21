
import { useCallback, useRef } from 'react';
import { VillaInputs, CalculatedData, YearProjection, ResaleStrategyResult, AdditionalCostImpactDetail } from '../types';

const useYieldCalculator = () => {
  const randomSequenceRef = useRef<number[]>([]);

  const calculate = useCallback((inputs: VillaInputs, options?: { regenerateRandomSequence?: boolean }): CalculatedData | null => {
    if (!inputs.propertyPrice || !inputs.leaseYears || inputs.leaseYears <= 0) {
      return null;
    }

    // Correctly manage the random sequence for re-roll functionality.
    // It should persist unless a re-roll is requested or lease years change.
    if (options?.regenerateRandomSequence || randomSequenceRef.current.length !== inputs.leaseYears) {
        randomSequenceRef.current = Array.from({ length: inputs.leaseYears }, () => Math.random());
    }
    const randomSequence = randomSequenceRef.current;


    const yearlyProjections: YearProjection[] = [];
    
    const additionalCostsByYear: { [year: number]: number } = {};
    let totalAdditionalCosts = 0;
    if (inputs.enableAdditionalCosts) {
      inputs.additionalCosts.forEach(cost => {
        const costAmount = cost.costInputMode === 'fixed' 
          ? cost.costFixedAmount 
          : inputs.propertyPrice * cost.costPercentOfPropertyPrice;
        if (!additionalCostsByYear[cost.year]) {
          additionalCostsByYear[cost.year] = 0;
        }
        additionalCostsByYear[cost.year] += costAmount;
        totalAdditionalCosts += costAmount;
      });
    }

    let cumulativeCashFlow = -inputs.propertyPrice;
    
    for (let year = 1; year <= inputs.leaseYears; year++) {
      const randomFactor = randomSequence[year-1] ?? Math.random();

      let highSeasonOccupancy = inputs.occupancyRateHigh;
      let lowSeasonOccupancy = inputs.occupancyRateLow;
      if (inputs.fluctuateOccupancy) {
          const fluctuation = (randomFactor * 2 - 1) * 0.1; // +/- 10%
          highSeasonOccupancy = Math.max(0, Math.min(1, highSeasonOccupancy * (1 + fluctuation)));
          lowSeasonOccupancy = Math.max(0, Math.min(1, lowSeasonOccupancy * (1 - fluctuation)));
      }
      const avgOccupancyForYear = (highSeasonOccupancy + lowSeasonOccupancy) / 2;
      
      let avgDailyRateForYear = (inputs.dailyRateHigh + inputs.dailyRateLow) / 2;
      
      // Apply deterministic inflation first
      if(inputs.applyInflation) {
          avgDailyRateForYear *= Math.pow(1 + inputs.inflationRate, year - 1);
      }
      
      let revenueForYear = avgDailyRateForYear * 365 * avgOccupancyForYear;

      // Apply growth destabilization (including random factor) to BOTH revenue and the daily rate itself
      if (inputs.applyGrowthDestabilization) {
          const growthFactor = 1 - (inputs.firstYearRevenuePenalty / (1 + Math.exp(-1 * (year - 3)))); // Sigmoid-like curve for ramp-up
          const trendFactor = Math.pow(1 + inputs.annualBaseGrowthTrend, year - 1);
          const randomFluctuation = 1 + ((randomFactor ?? 0.5) * 2 - 1) * inputs.annualRandomFluctuationMax;
          
          const combinedFactor = growthFactor * trendFactor * randomFluctuation;
          
          revenueForYear *= combinedFactor;
          avgDailyRateForYear *= combinedFactor; // Apply same fluctuation to daily rate
      }
      
      const managementFee = revenueForYear * inputs.managementFeePercent;
      const utilitiesMaintenance = revenueForYear * inputs.utilitiesMaintenancePercent;
      const taxes = revenueForYear * inputs.taxesPercent;
      const otaFees = revenueForYear * inputs.otaFeesPercent;
      const totalCostsForYear = managementFee + utilitiesMaintenance + taxes + otaFees;
      const netProfitForYear = revenueForYear - totalCostsForYear;
      
      const additionalCostInYear = additionalCostsByYear[year] || 0;
      
      cumulativeCashFlow += netProfitForYear - additionalCostInYear;
      
      yearlyProjections.push({
          year,
          revenue: revenueForYear,
          managementFee,
          utilitiesMaintenance,
          taxes,
          otaFees,
          totalCosts: totalCostsForYear,
          netProfit: netProfitForYear,
          netYieldPercent: netProfitForYear / inputs.propertyPrice,
          cumulativeCashFlow: cumulativeCashFlow,
          avgOccupancy: avgOccupancyForYear,
          avgDailyRate: avgDailyRateForYear,
          additionalCostInYear: additionalCostInYear,
      });
    }
    
    let breakEvenYear: number | null = null;
    let paybackPeriodInYears: number | null = null;
    for (const p of yearlyProjections) {
        if (p.cumulativeCashFlow >= 0) {
            breakEvenYear = p.year;
            const prevYearProjection = yearlyProjections[p.year - 2];
            const totalInvestment = inputs.propertyPrice + yearlyProjections.slice(0, p.year).reduce((sum, current) => sum + current.additionalCostInYear, 0);
            const prevYearCashFlow = prevYearProjection ? prevYearProjection.cumulativeCashFlow : -totalInvestment;
            const cashflowGainedThisYear = p.netProfit;
            
            if (cashflowGainedThisYear > 0) {
                 paybackPeriodInYears = (p.year - 1) + (-prevYearCashFlow / cashflowGainedThisYear);
            } else {
                paybackPeriodInYears = p.year;
            }
            break;
        }
    }
    
    const first5Years = yearlyProjections.slice(0, 5);
    const sumNetProfit5Y = first5Years.reduce((sum, p) => sum + p.netProfit, 0);
    const averageFirstFiveYearsIncome = first5Years.length > 0 ? sumNetProfit5Y / first5Years.length : 0;
    const averageAnnualNetYieldPercent = inputs.propertyPrice > 0 ? averageFirstFiveYearsIncome / inputs.propertyPrice : 0;
    
    let resaleStrategyAtYear5: ResaleStrategyResult | null = null;
    if (inputs.enableResaleStrategy && inputs.leaseYears >= 5) {
        const avgNetProfit5Y = averageFirstFiveYearsIncome;
        const remainingLease = inputs.leaseYears - 5;
        const grossResaleValueBeforeCosts = avgNetProfit5Y > 0 ? avgNetProfit5Y * inputs.resaleProfitMultiplier * (remainingLease / inputs.leaseYears) : 0;
        
        let projectedResaleValue = grossResaleValueBeforeCosts;
        if (inputs.applySaleTaxOnResale) projectedResaleValue -= grossResaleValueBeforeCosts * inputs.saleTaxRateOnResale;
        if (inputs.applyAgencyCommissionOnResale) projectedResaleValue -= grossResaleValueBeforeCosts * inputs.agencyCommissionRateOnResale;

        let stratCashFlow = -inputs.propertyPrice;
        const projectionsWithResale = yearlyProjections.slice(0,5).map((p, i) => {
            stratCashFlow += p.netProfit - p.additionalCostInYear;
            if(i === 4) stratCashFlow += projectedResaleValue;
            return {...p, cumulativeCashFlow: stratCashFlow};
        });
        
        const totalInvestmentForStrategy = inputs.propertyPrice + yearlyProjections.slice(0, 5).reduce((acc, p) => acc + p.additionalCostInYear, 0);
        const finalCumulativeCashFlowIncludingResale = projectionsWithResale.length > 0 ? projectionsWithResale[4].cumulativeCashFlow : -totalInvestmentForStrategy;
        const strategyRoiPercent = totalInvestmentForStrategy > 0 ? (finalCumulativeCashFlowIncludingResale / totalInvestmentForStrategy) : null;
        
        resaleStrategyAtYear5 = {
            grossResaleValueBeforeCosts,
            projectedResaleValue,
            finalCumulativeCashFlowIncludingResale,
            strategyRoiPercent,
            yearlyProjectionsForStrategy: projectionsWithResale
        };
    }
    
    const additionalCostImpactDetails: AdditionalCostImpactDetail[] = [];
    if (inputs.enableAdditionalCosts) {
      inputs.additionalCosts.forEach(cost => {
        const costAmount = cost.costInputMode === 'fixed'
          ? cost.costFixedAmount
          : inputs.propertyPrice * cost.costPercentOfPropertyPrice;

        const yearPrior = yearlyProjections[cost.year - 2];
        const yearOf = yearlyProjections[cost.year - 1];

        additionalCostImpactDetails.push({
          year: cost.year,
          description: cost.description,
          cost: costAmount,
          operationalNetProfitYearPrior: yearPrior ? yearPrior.netProfit : null,
          coveredByPriorYearProfit: yearPrior ? yearPrior.netProfit >= costAmount : null,
          operationalNetProfitYearOf: yearOf ? yearOf.netProfit : null,
          cumulativeCashFlowAfterCostInYear: yearOf ? yearOf.cumulativeCashFlow : -inputs.propertyPrice - costAmount,
        });
      });
    }

    const averageOverallDailyRate = first5Years.length > 0 ? first5Years.reduce((sum, p) => sum + p.avgDailyRate, 0) / first5Years.length : 0;

    return {
      yearlyProjections,
      breakEvenYear,
      paybackPeriodInYears,
      averageAnnualNetYieldPercent,
      averageOverallDailyRate, // This is now the 5-year average
      averageFirstFiveYearsOccupancy: first5Years.length > 0 ? first5Years.reduce((sum, p) => sum + p.avgOccupancy, 0) / first5Years.length : 0,
      averageOverallOccupancy: yearlyProjections.length > 0 ? yearlyProjections.reduce((sum, p) => sum + p.avgOccupancy, 0) / yearlyProjections.length : 0,
      averageFirstFiveYearsIncome,
      averageFirstFiveYearsRevenue: first5Years.length > 0 ? first5Years.reduce((acc, p) => acc + p.revenue, 0) / first5Years.length : 0,
      averageFirstFiveYearsCosts: first5Years.length > 0 ? first5Years.reduce((acc, p) => acc + p.totalCosts, 0) / first5Years.length : 0,
      resaleStrategyAtYear5,
      totalAdditionalCosts,
      additionalCostImpactDetails,
    };
  }, []);
  return calculate;
};
export default useYieldCalculator;
