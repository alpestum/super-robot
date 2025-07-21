




import React, { useState } from 'react';
import { ChartBarIcon, ScaleIcon } from '../Icons';
import { Villa, MarketAnalytics, MarketAnalyticsData } from '../../types';
import AnalyticsChart from './AnalyticsChart';

interface AnalyticsCardProps {
    analytics: MarketAnalytics;
    currentVilla: Villa;
    theme: 'light' | 'dark';
}

type AnalyticsTab = 'chart' | 'comparison';

const formatPrice = (value: number | null) => {
    if (value === null || !isFinite(value)) return 'N/A';
    return `$${Math.round(value).toLocaleString()}`;
};

const ComparisonIndicator: React.FC<{ value: number }> = ({ value }) => {
    const isAbove = value > 0;
    const colorClass = isAbove ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    const text = isAbove ? `${value.toFixed(0)}% above avg.` : `${Math.abs(value).toFixed(0)}% below avg.`;
    const neutral = Math.abs(value) < 1;

    if (neutral) {
        return <span className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500">Matches Market Avg.</span>;
    }

    return (
        <span className={`text-xs font-medium ${colorClass}`}>{text}</span>
    );
};


const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ analytics, currentVilla, theme }) => {
    const [activeTab, setActiveTab] = useState<'district' | 'districtArea'>('district');
    const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<AnalyticsTab>('chart');

    const canShowDistrictArea = currentVilla.districtArea && analytics.districtArea.pricePerBedroom.length > 0;
    const districtChartData: MarketAnalyticsData = (activeTab === 'districtArea' && canShowDistrictArea) ? analytics.districtArea : analytics.district;
    const districtChartTitle = (activeTab === 'districtArea' && canShowDistrictArea) 
        ? `${currentVilla.districtArea}, ${currentVilla.district}` 
        : currentVilla.district;

    const TabButton: React.FC<{ tabName: AnalyticsTab, label: string, icon: React.ReactNode, disabled?: boolean }> = ({ tabName, label, icon, disabled }) => {
        const isActive = activeAnalyticsTab === tabName;
        return (
            <button
                onClick={() => !disabled && setActiveAnalyticsTab(tabName)}
                disabled={disabled}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out
                    ${isActive ? 'bg-apple-blue text-white shadow-sm' : 'bg-transparent text-ios-gray-700 dark:text-dark-ios-gray-700 hover:bg-ios-gray-100 dark:hover:bg-dark-ios-gray-300'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                {icon}
                {label}
            </button>
        );
    };

    const renderChartContent = () => (
        <>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-semibold text-black dark:text-dark-ios-gray-800">{districtChartTitle}</h4>
                <div className="flex items-center gap-1 p-1 bg-ios-gray-100 dark:bg-dark-ios-gray-300 rounded-lg">
                    <button onClick={() => setActiveTab('district')} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${activeTab === 'district' ? 'bg-white dark:bg-dark-ios-gray-400 shadow-sm' : ''}`}>District</button>
                    <button onClick={() => setActiveTab('districtArea')} disabled={!canShowDistrictArea} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${activeTab === 'districtArea' ? 'bg-white dark:bg-dark-ios-gray-400 shadow-sm' : ''} disabled:opacity-50`}>Area</button>
                </div>
            </div>
            <div className="text-sm text-ios-gray-700 dark:text-dark-ios-gray-700 mb-4">
                Avg. Price / m²: 
                <span className="font-bold text-lg text-black dark:text-dark-ios-gray-800 ml-1">
                    {formatPrice(districtChartData.avgPricePerSqm)}
                </span>
            </div>
            {districtChartData.pricePerBedroom.length > 0 ? (
                <AnalyticsChart
                    data={districtChartData.pricePerBedroom}
                    highlightBedrooms={currentVilla.bedrooms}
                    theme={theme}
                />
            ) : (
                <div className="text-center py-10 text-ios-gray-500 dark:text-dark-ios-gray-500 text-sm">
                    Not enough comparable data for a meaningful analysis in this area.
                </div>
            )}
        </>
    );

    const renderComparisonContent = () => {
        const districtAnalytics = analytics.district;
        const avgDistrictPrice = districtAnalytics.pricePerBedroom.find(p => p.bedrooms === currentVilla.bedrooms)?.avgPrice;
        let priceComparison: number | null = null;
        if (avgDistrictPrice && currentVilla.price) {
            priceComparison = ((currentVilla.price - avgDistrictPrice) / avgDistrictPrice) * 100;
        }

        const villaPricePerSqm = currentVilla.buildingSizeM2 ? currentVilla.price / currentVilla.buildingSizeM2 : null;
        let sqmPriceComparison: number | null = null;
        if (districtAnalytics.avgPricePerSqm && villaPricePerSqm) {
            sqmPriceComparison = ((villaPricePerSqm - districtAnalytics.avgPricePerSqm) / districtAnalytics.avgPricePerSqm) * 100;
        }

        return (
            <div className="space-y-4 pt-4">
                 <div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">This Villa's Price</span>
                        <strong className="text-lg text-black dark:text-dark-ios-gray-800">${currentVilla.price.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                        {priceComparison !== null ? <ComparisonIndicator value={priceComparison} /> : <span className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500">No comparison data</span>}
                    </div>
                </div>
                <div className="border-t border-ios-gray-200 dark:border-dark-ios-gray-300/50 my-1"></div>
                <div>
                    <div className="flex justify-between items-baseline">
                         <span className="text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">This Villa's Price / m²</span>
                        <strong className="text-lg text-black dark:text-dark-ios-gray-800">{villaPricePerSqm ? `$${Math.round(villaPricePerSqm).toLocaleString()}`: 'N/A'}</strong>
                    </div>
                     <div className="text-right">
                        {sqmPriceComparison !== null ? <ComparisonIndicator value={sqmPriceComparison} /> : <span className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500">No comparison data</span>}
                    </div>
                </div>
                 <p className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500 mt-4 text-center">
                    Compared to average for {currentVilla.bedrooms}BR villas in {currentVilla.district}.
                </p>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeAnalyticsTab) {
            case 'chart': return renderChartContent();
            case 'comparison': return renderComparisonContent();
            default: return null;
        }
    };


    return (
        <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
            <div className="border-b border-ios-gray-200 dark:border-dark-ios-gray-300 pb-3 mb-3">
                 <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3">Market Analysis</h3>
                <div className="flex items-center gap-2 p-1 bg-ios-gray-200 dark:bg-dark-ios-gray-200 rounded-lg">
                    <TabButton tabName="chart" label="Price Chart" icon={<ChartBarIcon className="w-5 h-5"/>} />
                    <TabButton tabName="comparison" label="Comparison" icon={<ScaleIcon className="w-5 h-5"/>} />
                </div>
            </div>

            <div className="min-h-[250px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default AnalyticsCard;
