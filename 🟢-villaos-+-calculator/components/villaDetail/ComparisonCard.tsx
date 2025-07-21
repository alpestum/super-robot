
import React from 'react';
import { Villa, MarketAnalytics } from '../../types';
import { ScaleIcon } from '../Icons';

interface ComparisonCardProps {
    villa: Villa;
    analytics: MarketAnalytics;
}

const ComparisonIndicator: React.FC<{ value: number, label: string }> = ({ value, label }) => {
    const isAbove = value > 0;
    const colorClass = isAbove ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    const text = isAbove ? `${value.toFixed(0)}% above avg.` : `${Math.abs(value).toFixed(0)}% below avg.`;
    const neutral = Math.abs(value) < 1;

    if(neutral) {
        return <span className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500">Matches Market Avg.</span>
    }

    return (
        <span className={`text-xs font-medium ${colorClass}`}>{text}</span>
    );
};


const ComparisonCard: React.FC<ComparisonCardProps> = ({ villa, analytics }) => {
    const districtAnalytics = analytics.district;

    const avgDistrictPrice = districtAnalytics.pricePerBedroom.find(p => p.bedrooms === villa.bedrooms)?.avgPrice;
    
    let priceComparison: number | null = null;
    if (avgDistrictPrice && villa.price) {
        priceComparison = ((villa.price - avgDistrictPrice) / avgDistrictPrice) * 100;
    }

    let sqmPriceComparison: number | null = null;
    const villaPricePerSqm = villa.buildingSizeM2 ? villa.price / villa.buildingSizeM2 : null;
    if (districtAnalytics.avgPricePerSqm && villaPricePerSqm) {
        sqmPriceComparison = ((villaPricePerSqm - districtAnalytics.avgPricePerSqm) / districtAnalytics.avgPricePerSqm) * 100;
    }

    return (
        <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
            <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center">
                <ScaleIcon className="w-5 h-5 mr-2"/> Market Comparison
            </h3>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">Price</span>
                        <strong className="text-sm text-black dark:text-dark-ios-gray-800">${villa.price.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                        {priceComparison !== null ? <ComparisonIndicator value={priceComparison} label="Price" /> : <span className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500">No comparison data</span>}
                    </div>
                </div>

                 <div className="border-t border-ios-gray-200 dark:border-dark-ios-gray-300/50 my-1"></div>

                <div>
                    <div className="flex justify-between items-baseline">
                         <span className="text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">Price / m²</span>
                        <strong className="text-sm text-black dark:text-dark-ios-gray-800">{villaPricePerSqm ? `$${Math.round(villaPricePerSqm).toLocaleString()}`: 'N/A'}</strong>
                    </div>
                     <div className="text-right">
                        {sqmPriceComparison !== null ? <ComparisonIndicator value={sqmPriceComparison} label="Price/m²" /> : <span className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500">No comparison data</span>}
                    </div>
                </div>
            </div>
            <p className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500 mt-3 text-center">
                Compared to average for {villa.bedrooms}BR villas in {villa.district}.
            </p>
        </div>
    );
};

export default ComparisonCard;
