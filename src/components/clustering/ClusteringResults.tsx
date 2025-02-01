import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';

interface ClusteringResultsProps {
  clusters: Record<string, string[]>;
}

export function ClusteringResults({ clusters = {} }: ClusteringResultsProps) {
  const handleExport = () => {
    const rows = [['Cluster', 'Keywords']];
    
    Object.entries(clusters).forEach(([cluster, keywords]) => {
      rows.push([cluster, keywords.join(', ')]);
    });

    const csvContent = rows
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'keyword-clusters.csv');
  };

  // If no clusters, show empty state
  if (!clusters || Object.keys(clusters).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No clusters generated yet. Try adjusting your keywords or clustering type.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Clustering Results
        </h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="grid gap-6">
        {Object.entries(clusters).map(([cluster, keywords], index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {cluster}
            </h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, keywordIndex) => (
                <span
                  key={keywordIndex}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}