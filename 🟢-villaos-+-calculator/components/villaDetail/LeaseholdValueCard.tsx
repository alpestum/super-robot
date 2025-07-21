
import React from 'react';
import { TrendingUpIcon } from '../Icons';

interface LeaseholdValueCardProps {
  score: number | null;
}

const LeaseholdValueCard: React.FC<LeaseholdValueCardProps> = ({ score }) => {
  if (score === null) {
    return null;
  }

  const percentage = (score / 10) * 100;
  const circumference = 30 * 2 * Math.PI;

  const getScoreColor = () => {
    if (score >= 8) return 'text-green-500 dark:text-green-400';
    if (score >= 6) return 'text-yellow-500 dark:text-yellow-400';
    if (score >= 4) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  };
  
  const getScoreDescription = () => {
    if (score >= 8) return 'Excellent long-term potential.';
    if (score >= 6) return 'Strong balance of return and duration.';
    if (score >= 4) return 'Solid value, consider financing terms.';
    return 'Represents a shorter-term return strategy.';
  }

  return (
    <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
      <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center">
        <TrendingUpIcon className="w-5 h-5 mr-2" />
        Long-Term Value
      </h3>
      <div className="flex items-center justify-center space-x-4">
        <div className="relative inline-flex items-center justify-center overflow-hidden rounded-full">
            <svg className="w-24 h-24 transform -rotate-90">
                <circle
                    className="text-ios-gray-200 dark:text-dark-ios-gray-300"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="38"
                    cx="48"
                    cy="48"
                />
                <circle
                    className={getScoreColor()}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (percentage / 100) * circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="38"
                    cx="48"
                    cy="48"
                />
            </svg>
            <span className={`absolute text-2xl font-bold ${getScoreColor()}`}>
                {score.toFixed(1)}
            </span>
        </div>
        <div className="flex-1">
             <p className="text-sm text-ios-gray-600 dark:text-dark-ios-gray-600">This score (out of 10) reflects the balance between potential ROI and the length of the lease.</p>
             <p className={`mt-1 text-sm font-semibold ${getScoreColor()}`}>{getScoreDescription()}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaseholdValueCard;
