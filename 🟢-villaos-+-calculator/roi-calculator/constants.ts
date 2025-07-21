import { VillaInputs } from "./types";

export const LOGO_URL = "https://cdn.prod.website-files.com/62fc5b50a8950f9ab73cf721/6849f01948484627265d5193_LOGO%20DESIGN%20ALT%20-%20The%20Bali%20Home_BLACK%20LOGO%20copy.png";
export const APP_NAME = "Yield Calculator";
export const REPORT_APP_NAME = "The Bali Homes";

export const DEFAULT_INPUTS: VillaInputs = {
  // Villa Info
  title: '',
  description: '',
  imageUrl: '',

  // Core Financials
  propertyPrice: 0,
  leaseYears: 25,
  dailyRateHigh: 0,
  dailyRateLow: 0,
  occupancyRateHigh: 0.85,
  occupancyRateLow: 0.72,

  // Costs (% of revenue)
  managementFeePercent: 0.15,
  utilitiesMaintenancePercent: 0.1,
  taxesPercent: 0.1,
  otaFeesPercent: 0.0,

  // Advanced Options - Dynamics
  applyInflation: true,
  inflationRate: 0.03, // 3%
  fluctuateOccupancy: true,
  applyGrowthDestabilization: true,
  firstYearRevenuePenalty: 0.15, // 15%
  annualBaseGrowthTrend: 0.03, // 3%
  annualRandomFluctuationMax: 0.15, // 15%

  // Advanced Options - 5-Year Resale Strategy
  enableResaleStrategy: true,
  resaleProfitMultiplier: 8,
  applySaleTaxOnResale: true,
  saleTaxRateOnResale: 0.1, // 10%
  applyAgencyCommissionOnResale: true,
  agencyCommissionRateOnResale: 0.05, // 5%

  // Advanced Options - Additional Costs
  enableAdditionalCosts: false,
  additionalCosts: [],
};