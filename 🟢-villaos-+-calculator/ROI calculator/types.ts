
export interface AdditionalCostEvent {
    id: string;
    year: number;
    description: string;
    costInputMode: 'percent' | 'fixed';
    costPercentOfPropertyPrice: number;
    costFixedAmount: number;
}

export interface VillaInputs {
    // Villa Info
    title: string;
    description: string;
    imageUrl: string;
    
    // Core Financials
    propertyPrice: number;
    leaseYears: number;
    dailyRateHigh: number;
    dailyRateLow: number;
    occupancyRateHigh: number;
    occupancyRateLow: number;

    // Costs (% of revenue)
    managementFeePercent: number;
    utilitiesMaintenancePercent: number;
    taxesPercent: number;
    otaFeesPercent: number;
    
    // Advanced Options - Dynamics
    applyInflation: boolean;
    inflationRate: number;
    fluctuateOccupancy: boolean;
    applyGrowthDestabilization: boolean;
    firstYearRevenuePenalty: number;
    annualBaseGrowthTrend: number;
    annualRandomFluctuationMax: number;
    
    // Advanced Options - 5-Year Resale Strategy
    enableResaleStrategy: boolean;
    resaleProfitMultiplier: number;
    applySaleTaxOnResale: boolean;
    saleTaxRateOnResale: number;
    applyAgencyCommissionOnResale: boolean;
    agencyCommissionRateOnResale: number;

    // Advanced Options - Additional Costs
    enableAdditionalCosts: boolean;
    additionalCosts: AdditionalCostEvent[];
}

export interface SavedScenario {
  id: string;
  name: string;
  inputs: VillaInputs;
  createdAt: string;
  updatedAt: string;
}

export type InputKeys = keyof VillaInputs;

export interface YearProjection {
    year: number;
    revenue: number;
    managementFee: number;
    utilitiesMaintenance: number;
    taxes: number;
    otaFees: number;
    totalCosts: number;
    netProfit: number;
    netYieldPercent: number;
    cumulativeCashFlow: number;
    avgOccupancy: number;
    avgDailyRate: number;
    additionalCostInYear: number;
}

export interface ResaleStrategyResult {
    grossResaleValueBeforeCosts: number | null;
    projectedResaleValue: number | null;
    finalCumulativeCashFlowIncludingResale: number | null;
    strategyRoiPercent: number | null;
    yearlyProjectionsForStrategy: YearProjection[];
}

export interface AdditionalCostImpactDetail {
  year: number;
  description: string;
  cost: number;
  operationalNetProfitYearPrior: number | null;
  coveredByPriorYearProfit: boolean | null;
  operationalNetProfitYearOf: number | null;
  cumulativeCashFlowAfterCostInYear: number;
}


export interface CalculatedData {
    yearlyProjections: YearProjection[];
    breakEvenYear: number | null;
    paybackPeriodInYears: number | null;
    averageAnnualNetYieldPercent: number | null;
    averageOverallDailyRate: number | null;
    averageFirstFiveYearsOccupancy: number | null;
    averageOverallOccupancy: number | null;
    averageFirstFiveYearsIncome: number | null;
    averageFirstFiveYearsRevenue: number | null;
    averageFirstFiveYearsCosts: number | null;
    resaleStrategyAtYear5: ResaleStrategyResult | null;
    totalAdditionalCosts: number;
    additionalCostImpactDetails: AdditionalCostImpactDetail[];
}
