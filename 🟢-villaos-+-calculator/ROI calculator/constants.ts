import { VillaInputs, AdditionalCostEvent } from "./types"; // Renamed RenovationEvent

export const LOGO_URL = "https://uploads-ssl.webflow.com/64065678448108a78cce6a87/6423986348606440536c6467_logo-tbh-alt.png";
export const APP_NAME = "Yield Calculator";
export const REPORT_APP_NAME = "The Bali Homes";

export const LOCAL_STORAGE_KEY = 'roi-calculator-inputs';
export const SAVED_SCENARIOS_KEY = 'roi-calculator-saved-scenarios';

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

  // Advanced Options - Additional Costs / Renovations
  enableAdditionalCosts: false, // Renamed
  additionalCosts: [], // Renamed
};