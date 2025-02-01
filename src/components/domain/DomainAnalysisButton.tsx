import React from 'react';
import { RotateCcw } from 'lucide-react';

interface DomainAnalysisButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function DomainAnalysisButton({ onClick, isLoading }: DomainAnalysisButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-[#008FF7] hover:bg-[#016DC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5FA5F9] disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      {isLoading ? 'Analyzing...' : 'Rerun Analysis'}
    </button>
  );
}
