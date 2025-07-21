
import React from 'react';
import { LightbulbIcon, SparklesIcon } from '../Icons';
import Spinner from '../Spinner';

interface InvestmentProfileCardProps {
  onGenerate: () => void;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

const MarkdownContent: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
    const createMarkup = (text: string) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*$)/gm, '<li class="list-disc list-inside ml-2">$1</li>')
            .replace(/(<li.*>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
            .replace(/<\/ul>\s*<ul>/g, '');
        return { __html: html };
    };
    return <div className={className} dangerouslySetInnerHTML={createMarkup(content || '')} />;
};

const InvestmentProfileCard: React.FC<InvestmentProfileCardProps> = ({ onGenerate, summary, isLoading, error }) => {
  return (
    <div className="bg-white dark:bg-dark-ios-gray-200 rounded-xl shadow-ios-card dark:shadow-dark-ios-card p-5">
      <h3 className="text-lg font-semibold text-black dark:text-dark-ios-gray-800 mb-3 flex items-center">
        <LightbulbIcon className="w-5 h-5 mr-2" />
        AI Investment Profile
      </h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <Spinner text="Analyzing..." size="medium" />
        </div>
      ) : error ? (
        <div className="p-3 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 rounded-lg text-xs">
          <strong>Error:</strong> {error}
        </div>
      ) : summary ? (
        <MarkdownContent content={summary} className="text-sm text-ios-gray-700 dark:text-dark-ios-gray-700 leading-relaxed space-y-2" />
      ) : (
         <p className="text-sm text-ios-gray-600 dark:text-dark-ios-gray-600 mb-3">
            Get a qualitative summary of this villa's investment potential based on its profile.
          </p>
      )}

      <div className="mt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 bg-apple-blue/10 dark:bg-apple-blue-light/20 text-apple-blue dark:text-apple-blue-light font-medium rounded-ios-button hover:bg-apple-blue/20 dark:hover:bg-apple-blue-light/30 focus:outline-none focus:ring-2 focus:ring-apple-blue dark:focus:ring-apple-blue-light focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          <SparklesIcon className="w-4 h-4 mr-1.5" />
          {summary ? 'Regenerate Analysis' : 'Generate Analysis'}
        </button>
      </div>
    </div>
  );
};

export default InvestmentProfileCard;
