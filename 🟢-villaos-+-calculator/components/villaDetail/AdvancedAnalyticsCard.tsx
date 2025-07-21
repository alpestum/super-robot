

import React from 'react';
import { AdvancedAnalytics } from '../../types';
import { BanknotesIcon, CheckBadgeIcon, TrendingUpIcon } from '../Icons';

interface AdvancedAnalyticsCardProps {
    analytics: AdvancedAnalytics;
    leaseholdValueScore: number | null;
}

const Gauge: React.FC<{ score: number | null; icon: React.ReactNode; title: string; description: string; }> = ({ score, icon, title, description }) => {
    if (score === null) {
        return (
            <div className="bg-ios-gray-100 dark:bg-dark-ios-gray-300 p-4 rounded-lg text-center flex flex-col items-center justify-center h-full">
                <div className="flex items-center text-sm font-semibold text-black dark:text-dark-ios-gray-800 mb-2">
                    {icon}
                    <span className="ml-2">{title}</span>
                </div>
                <p className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500">Not enough data for this analysis.</p>
            </div>
        );
    }
    
    const percentage = (score / 10) * 100;
    const radius = 32;
    const circumference = radius * 2 * Math.PI;

    const getScoreColor = () => {
        if (score >= 8) return 'text-green-500 dark:text-green-400';
        if (score >= 6) return 'text-yellow-500 dark:text-yellow-400';
        if (score >= 4) return 'text-orange-500 dark:text-orange-400';
        return 'text-red-500 dark:text-red-400';
    };

    return (
        <div className="bg-ios-gray-100 dark:bg-dark-ios-gray-300 p-4 rounded-lg text-center flex flex-col items-center h-full">
            <div className="flex items-center text-sm font-semibold text-black dark:text-dark-ios-gray-800 mb-2">
                {icon}
                <span className="ml-2">{title}</span>
            </div>
            <div className="relative inline-flex items-center justify-center overflow-hidden rounded-full w-24 h-24 my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                    <circle className="text-ios-gray-200 dark:text-dark-ios-gray-400" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="40" cy="40" />
                    <circle className={getScoreColor()} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={circumference - (percentage / 100) * circumference} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="40" cy="40" />
                </svg>
                <span className={`absolute text-2xl font-bold ${getScoreColor()}`}>{score.toFixed(1)}</span>
            </div>
            <p className="text-xs text-ios-gray-500 dark:text-dark-ios-gray-500 mt-1">{description}</p>
        </div>
    );
};

const AdvancedAnalyticsCard: React.FC<AdvancedAnalyticsCardProps> = ({ analytics, leaseholdValueScore }) => {
    return (
        <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
            <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3">Advanced Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Gauge
                    score={analytics.pricePerSqmScore}
                    icon={<BanknotesIcon className="w-5 h-5 text-ios-gray-500 dark:text-dark-ios-gray-500"/>}
                    title="Value for Money"
                    description="Score reflects price/m² vs district avg. Higher is better."
                />
                <Gauge
                    score={analytics.roiQualityScore}
                    icon={<CheckBadgeIcon className="w-5 h-5 text-ios-gray-500 dark:text-dark-ios-gray-500"/>}
                    title="ROI Quality Score"
                    description="Score reflects ROI vs district avg. Higher is better."
                />
                <Gauge
                    score={leaseholdValueScore}
                    icon={<TrendingUpIcon className="w-5 h-5 text-ios-gray-500 dark:text-dark-ios-gray-500"/>}
                    title="Lease Value"
                    description="Score reflects ROI vs lease length. Higher is better."
                />
            </div>
        </div>
    );
};

export default AdvancedAnalyticsCard;
