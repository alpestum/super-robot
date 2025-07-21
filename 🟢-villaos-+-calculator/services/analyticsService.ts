

import { Villa, MarketAnalytics, BedroomPriceStat, MarketAnalyticsData, AdvancedAnalytics } from '../types';

const calculateAnalyticsForSet = (villas: Villa[]): MarketAnalyticsData => {
    // Price per Sqm
    const villasWithBuildingSize = villas.filter(v => v.buildingSizeM2 && v.buildingSizeM2 > 0 && v.price > 0);
    const totalSqmPrice = villasWithBuildingSize.reduce((sum, v) => sum + (v.price / v.buildingSizeM2!), 0);
    const avgPricePerSqm = villasWithBuildingSize.length > 0 ? totalSqmPrice / villasWithBuildingSize.length : null;

    // Price per Bedroom
    const priceByBedrooms: { [key: number]: { total: number, count: number } } = {};
    villas.forEach(v => {
        if (v.bedrooms > 0 && v.price > 0) {
            if (!priceByBedrooms[v.bedrooms]) {
                priceByBedrooms[v.bedrooms] = { total: 0, count: 0 };
            }
            priceByBedrooms[v.bedrooms].total += v.price;
            priceByBedrooms[v.bedrooms].count += 1;
        }
    });

    const pricePerBedroom: BedroomPriceStat[] = Object.entries(priceByBedrooms)
        .map(([bedrooms, data]) => ({
            bedrooms: parseInt(bedrooms, 10),
            avgPrice: data.total / data.count,
            count: data.count,
        }))
        .sort((a, b) => a.bedrooms - b.bedrooms);

    return { avgPricePerSqm, pricePerBedroom };
};

export const generateMarketAnalytics = (allVillas: Villa[], currentVilla: Villa): MarketAnalytics => {
    const comparableVillas = allVillas.filter(v => 
        v.id !== currentVilla.id && 
        v.availability?.toLowerCase() !== 'sold out'
    );

    // District Analytics
    const districtVillas = comparableVillas.filter(v => v.district === currentVilla.district);
    const districtData = calculateAnalyticsForSet(districtVillas);

    // District Area Analytics
    let districtAreaData: MarketAnalyticsData = { avgPricePerSqm: null, pricePerBedroom: [] };
    if (currentVilla.districtArea) {
        const districtAreaVillas = districtVillas.filter(v => v.districtArea === currentVilla.districtArea);
        districtAreaData = calculateAnalyticsForSet(districtAreaVillas);
    }
    
    return {
        district: districtData,
        districtArea: districtAreaData,
    };
};

export const findSimilarVillas = (allVillas: Villa[], currentVilla: Villa): Villa[] => {
    if (!currentVilla.district || !currentVilla.bedrooms) {
        return [];
    }

    return allVillas.filter(v =>
        v.id !== currentVilla.id &&
        v.district === currentVilla.district &&
        v.bedrooms === currentVilla.bedrooms &&
        v.availability?.toLowerCase() !== 'sold out'
    ).slice(0, 10); // Limit to 10 similar properties
};

export const calculateLeaseholdValueScore = (villa: Villa): number | null => {
    if (villa.contractType?.toLowerCase() !== 'leasehold' || !villa.percentROI || !villa.leaseholdYears) {
        return null;
    }

    const roi = villa.percentROI > 1 ? villa.percentROI : villa.percentROI * 100;
    const yearsStr = String(villa.leaseholdYears);
    const yearsMatch = yearsStr.match(/\d+/);
    if (!yearsMatch) return null;
    const years = parseInt(yearsMatch[0], 10);
    if (isNaN(years)) return null;

    // Normalize ROI to a 0-1 scale (capping at 20% ROI for max score)
    const roiScore = Math.min(roi / 20, 1);

    // Normalize Lease Years to a 0-1 scale (capping at 30 years for max score)
    const leaseScore = Math.min(years / 30, 1);

    // Weighted average (60% ROI, 40% lease length) and scale to 10
    const finalScore = (roiScore * 0.6 + leaseScore * 0.4) * 10;
    
    return parseFloat(finalScore.toFixed(1));
};

// Advanced Analytics Functions

const calculatePricePerSqmScore = (villa: Villa, marketAnalytics: MarketAnalytics): number | null => {
    const villaPricePerSqm = villa.buildingSizeM2 ? villa.price / villa.buildingSizeM2 : null;
    const avgDistrictSqmPrice = marketAnalytics.district.avgPricePerSqm;

    if (!villaPricePerSqm || !avgDistrictSqmPrice) {
        return null;
    }

    const percentDifference = ((villaPricePerSqm - avgDistrictSqmPrice) / avgDistrictSqmPrice) * 100;
    // Score is higher for lower price/sqm. A 50% lower price is score 7.5. 50% higher is score 2.5.
    const score = 5 - (percentDifference / 20); 

    return parseFloat(Math.max(0, Math.min(10, score)).toFixed(1));
};

const calculateRoiQualityScore = (villa: Villa, allVillas: Villa[]): number | null => {
    if (!villa.percentROI || !villa.district) return null;

    const villaRoi = villa.percentROI > 1 ? villa.percentROI : villa.percentROI * 100;

    const districtVillasWithRoi = allVillas.filter(v =>
        v.id !== villa.id &&
        v.district === villa.district &&
        v.percentROI &&
        v.availability?.toLowerCase() !== 'sold out'
    );

    if (districtVillasWithRoi.length < 2) return null; // Not enough data for meaningful comparison

    const totalRoi = districtVillasWithRoi.reduce((sum, v) => {
        const roi = v.percentROI! > 1 ? v.percentROI! : v.percentROI! * 100;
        return sum + roi;
    }, 0);
    const avgDistrictRoi = totalRoi / districtVillasWithRoi.length;

    if(avgDistrictRoi === 0) return null;

    const percentDifference = ((villaRoi - avgDistrictRoi) / avgDistrictRoi) * 100;
    // Score is higher for higher ROI. 50% higher ROI is score 7.5. 50% lower is score 2.5.
    const score = 5 + (percentDifference / 20);

    return parseFloat(Math.max(0, Math.min(10, score)).toFixed(1));
};

const calculateMarketAbsorptionRate = (villa: Villa, allVillas: Villa[]): number | null => {
    if (!villa.district) return null;

    const districtVillas = allVillas.filter(v => v.district === villa.district);
    if (districtVillas.length === 0) return null;

    const soldVillas = districtVillas.filter(v => v.availability?.toLowerCase() === 'sold out');
    
    return (soldVillas.length / districtVillas.length) * 100;
};

export const generateAdvancedAnalytics = (allVillas: Villa[], currentVilla: Villa, marketAnalytics: MarketAnalytics): AdvancedAnalytics => {
    return {
        pricePerSqmScore: calculatePricePerSqmScore(currentVilla, marketAnalytics),
        roiQualityScore: calculateRoiQualityScore(currentVilla, allVillas),
        marketAbsorptionRate: calculateMarketAbsorptionRate(currentVilla, allVillas),
    };
};