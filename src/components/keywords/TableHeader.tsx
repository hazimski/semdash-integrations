import React from 'react';
import { Download } from 'lucide-react';
import { formatNumber } from '../../utils/format';

interface TableHeaderProps {
  totalCount: number;
  onExport: () => void;
  disabled: boolean;
}

export function TableHeader({ totalCount, onExport, disabled }: TableHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          All Results ({formatNumber(totalCount)})
        </h2>
        <button
          onClick={onExport}
          disabled={disabled}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>
    </div>
  );
}