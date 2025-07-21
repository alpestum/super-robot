




export interface Villa {
  id: string; // Was: Reference. Will be used as Reference ID.
  name: string; // Was: Listing name. Can be auto-generated or part of form.
  contractType?: 'Leasehold' | 'Freehold' | string; // Was: Contract. Updated to specific choices.
  propertyType?: 'Off plan' | 'Ready villa' | 'Apartment' | 'Resort' | string; // Was: Property type. Updated to specific choices.
  availability?: 'Available' | 'Sold out' | string; // Was: Availability. Updated to specific choices.
  deliveryDate?: string; // Was: Delivery date
  driveLink?: string; // Was: Drive link
  dateListed?: string; // Was: Date listed (string format "DD MonthName YYYY")
  parsedDateListed?: Date; // For sorting and date picker
  district?: string; // Was: District
  districtArea?: string; // Was: District area
  locationPin?: string; // Was: Location pin
  priceIDRRaw?: string; // Raw Price IDR string e.g. "Rp3,350,000,000"
  priceUSD?: number; // Parsed Price USD, will be used as the main 'price'
  leaseholdYears?: string | number; // Was: Leasehold years
  extensionYears?: string; // Was: Extension years
  unitsAvailable?: string | number; // Was: Units available
  landSizeM2?: number; // Was: Land size m2
  buildingSizeM2?: number; // Was: Building size (assuming m2)
  bedrooms: number; // Was: Bedrooms
  bathrooms: number; // Was: Bathrooms
  image_url?: string; // Was: Main image (URL)
  listingAgent?: string; // Was: Listing agent
  webListingLink?: string; // Was: Web listing link
  vendor?: string; // Was: Vendor
  additionalDetails?: string; // Was: Additional details - will map to description
  brochureLink?: string; // Was: Brochure
  buildingPermit?: string; // Was: Building permit
  percentROI?: number; // From sheet: %ROI
  dollarROI?: number; // From sheet: $ROI
  roiReportLink?: string; // From sheet: ROI report

  // Core fields used by app, mapped from above
  price: number; // This will be the Price USD parsed
  location: string; // Derived from district or primary location field
  description: string; // Mapped from additionalDetails or additionalDetails itself
}

export interface FilterCriteria {
  priceMin?: number;
  priceMax?:number;
  bedrooms?: number;
  location?: string; // For District dropdown filter
  contractType?: string;
  propertyType?: string;
  districtArea?: string;
  showSoldOut: boolean;
}

// For Gemini AI Search
export interface AIResponseCriteria {
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  contractType?: string;
  propertyType?: string;
  locationKeywords?: string[];
  amenityKeywords?: string[];
  descriptionKeywords?: string[];
}

// For the POST request, the payload keys should match what the webhook expects.
// This type is aligned with the database field list provided by the user.
export type VillaPostPayload = {
  Reference: string;
  'Date listed'?: string;
  Availability?: string;
  'Property type'?: string;
  Contract?: string;
  District?: string;
  'District area'?: string;
  'Land size m2'?: number;
  'Building size'?: number;
  Bedrooms?: number;
  Bathrooms?: number;
  'Delivery date'?: string;
  'Price IDR'?: string;
  'Price USD'?: string; // Will be sent as string, backend should parse
  'Leasehold years'?: string | number;
  'Extension years'?: string;
  'Additional details'?: string;
  '%ROI'?: number;
  '$ROI'?: number;
  'Listing agent'?: string;
  'Units available'?: string | number;
  Vendor?: string;
  Thumbnail?: string;
  'Drive link'?: string;
  'Location link'?: string;
  'Web link'?: string;
  'ROI report'?: string;
};

// Types for Villa Detail Page Analytics
export interface BedroomPriceStat {
  bedrooms: number;
  avgPrice: number;
  count: number;
}

export interface MarketAnalyticsData {
  avgPricePerSqm: number | null;
  pricePerBedroom: BedroomPriceStat[];
}

export interface MarketAnalytics {
  district: MarketAnalyticsData;
  districtArea: MarketAnalyticsData;
}

export interface AdvancedAnalytics {
  pricePerSqmScore: number | null;
  roiQualityScore: number | null;
  marketAbsorptionRate: number | null;
}

// Types for Financial Projections
export interface DetailedYearlyProjection {
  year: number;
  revenue: number;
  opCosts: number;
  opNetProfit: number;
  addCostExp: number;
  cashFlowNet: number;
  avgOccupancy: number;
}

export interface FinancialProjections {
  paybackPeriodYears: number | null;
  avgYearlyNetYield: number;
  avgYearlyNetIncome: number;
  avgDailyRate: number;
  leaseDurationYears: number;
  avgOccupancyRate: number;
  cumulativeCashFlowData: Array<{ year: number; 'Cumulative Cash Flow': number }>;
  annualPerformanceData: Array<{ year: number; Revenue: number; Costs: number; 'Net Profit': number }>;
  detailedYearlyProjectionsData: DetailedYearlyProjection[];
}

// Agent profile type
export interface Agent {
  Name: string;
  Role?: string;
  'Phone number'?: string;
  Email?: string;
  WhatsApp?: string;
  'Profile photo'?: string;
}

// Vendor profile type
export interface Vendor {
  Name: string;
  'Date added'?: string;
  Service?: string;
  Identity?: string;
  Company?: string;
  Website?: string;
  'Phone number'?: string;
  Email?: string;
  'Related villa'?: string; // e.g., "KES123, KES456"
  'Related land'?: string;
}