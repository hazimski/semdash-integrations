import React from 'react';
import { Download, HelpCircle } from 'lucide-react'; // HelpCircle for "Start Tour"
import { DomainAnalysisButton } from './DomainAnalysisButton';
import { ShareButton } from './ShareButton';

interface DomainOverviewHeaderProps {
  domain: string;
  onAnalyze: () => void;
  onExport: () => void;
  isLoading: boolean;
  isStoredData: boolean;
  historyId?: string;
  onStartTour: () => void; // Add handler for "Start Tour"
}

export function DomainOverviewHeader({ 
  domain, 
  onAnalyze, 
  onExport, 
  isLoading,
  isStoredData,
  historyId,
  onStartTour // Destructure new prop
}: DomainOverviewHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
      {/* Left Section: Domain Overview */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Domain Overview: {domain}
        </h1>
        {isStoredData && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing saved analysis data
          </p>
        )}
      </div>

      {/* Right Section: Buttons */}
      <div className="flex flex-col items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-0">
        {/* Start Tour Button (unchanged) */}
        <button
          onClick={onStartTour}
          className="inline-flex items-center text-[#006dca] dark:text-[#006dca] text-sm hover:underline focus:outline-none"
        >
          <HelpCircle className="h-4 w-4 mr-1 text-[#006dca]" />
          Start Tour
        </button>

        {/* Other Buttons in a Row */}
        <div className="flex items-center space-x-4">
          {/* Analyze Button */}
          {isStoredData && (
            <DomainAnalysisButton onClick={onAnalyze} isLoading={isLoading} />
          )}

          {/* Share Button */}
          {historyId && isStoredData && <ShareButton historyId={historyId} />}

          {/* Export PDF Button with Updated Style */}
          <button
            onClick={onExport}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-[#6c6e79] bg-[#8a8e9b1a] hover:bg-[#DFE0E6] hover:text-[#191B23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
}
