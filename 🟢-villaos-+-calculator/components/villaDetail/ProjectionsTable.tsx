
import React from 'react';
import { DetailedYearlyProjection } from '../../types';

interface ProjectionsTableProps {
  data: DetailedYearlyProjection[];
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const ProjectionsTable: React.FC<ProjectionsTableProps> = ({ data }) => {
  const headers = ['Year', 'Revenue', 'Op. Costs', 'Op. Net Profit', 'Add. Cost/Exp.', 'Cash Flow (Net)', 'Avg. Occupancy'];
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-ios-gray-200 dark:divide-dark-ios-gray-400">
        <thead className="bg-ios-gray-100/50 dark:bg-dark-ios-gray-300/50">
          <tr>
            {headers.map(header => (
              <th key={header} scope="col" className="px-4 py-2 text-left text-xs font-semibold text-ios-gray-600 dark:text-dark-ios-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-ios-gray-200 divide-y divide-ios-gray-200 dark:divide-dark-ios-gray-400">
          {data.map((row) => (
            <tr key={row.year} className="hover:bg-ios-gray-100/50 dark:hover:bg-dark-ios-gray-300/50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-black dark:text-dark-ios-gray-800">{row.year}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">{formatCurrency(row.revenue)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">{formatCurrency(row.opCosts)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">{formatCurrency(row.opNetProfit)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-400">{formatCurrency(row.addCostExp)}</td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${row.cashFlowNet >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(row.cashFlowNet)}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-ios-gray-700 dark:text-dark-ios-gray-700">{(row.avgOccupancy * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectionsTable;
