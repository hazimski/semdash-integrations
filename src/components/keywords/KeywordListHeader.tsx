import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';

interface KeywordListHeaderProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
}

export function KeywordListHeader({ selectedCount, onExport, onDelete }: KeywordListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link
          to="/keyword-lists"
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Keywords</h1>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={onExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
        {selectedCount > 0 && (
          <button
            onClick={onDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedCount})
          </button>
        )}
      </div>
    </div>
  );
}
