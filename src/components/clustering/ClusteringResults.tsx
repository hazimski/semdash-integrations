import React, { useState } from 'react';
import { Download, Key } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import { getUserSettings, updateOpenAIKey } from '../../services/settings';

interface ClusteringResultsProps {
  clusters: Record<string, string[]>;
}

export function ClusteringResults({ clusters = {} }: ClusteringResultsProps) {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');

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

  const handleSaveApiKey = async () => {
    if (!apiKey.startsWith('sk-')) {
      toast.error('Invalid API key format. It should start with "sk-"');
      return;
    }

    try {
      await updateOpenAIKey(apiKey);
      setShowApiKeyDialog(false);
      toast.success('API key saved successfully');
      window.location.reload(); // Reload to retry clustering with new API key
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  // If error is about missing API key, show dialog
  if (clusters && Object.keys(clusters).length === 0 && showApiKeyDialog) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              OpenAI API Key Required
            </h3>
            <button
              onClick={() => setShowApiKeyDialog(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <Key className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            To use keyword clustering, you need to provide your OpenAI API key. This key will be securely stored and used only for generating clusters.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApiKeyDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save API Key
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no clusters, show empty state
  if (!clusters || Object.keys(clusters).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No clusters generated yet. Try adjusting your keywords or clustering type.
        </p>
        <button
          onClick={() => setShowApiKeyDialog(true)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Key className="h-4 w-4 mr-2" />
          Set API Key
        </button>
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