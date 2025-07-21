

import React from 'react';

interface MetricCardProps {
    title: string;
    value: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value }) => {
    return (
        <div className="bg-ios-gray-100 dark:bg-dark-ios-gray-300 p-3 rounded-lg text-center flex flex-col justify-center h-full">
            <div>
                <p className="text-xs text-ios-gray-600 dark:text-dark-ios-gray-600 uppercase font-semibold tracking-wider">{title}</p>
                <p className="text-xl md:text-2xl font-bold text-apple-blue dark:text-apple-blue-light my-1 truncate" title={value}>{value}</p>
            </div>
        </div>
    );
};

export default MetricCard;