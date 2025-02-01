import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TopicalMap } from '../../services/topicalMap';
import { ApiKeyDialog } from '../domain/copilot/ApiKeyDialog';
import { updateOpenAIKey } from '../../services/settings';
import { toast } from 'react-hot-toast';

interface ResultsViewProps {
  keyword: string;
  map: TopicalMap;
}

export function ResultsView({ keyword, map }: ResultsViewProps) {
  const [showApiKeyDialog, setShowApiKeyDialog] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');

  const handleSaveApiKey = async () => {
    try {
      await updateOpenAIKey(apiKey);
      setShowApiKeyDialog(false);
      toast.success('API key saved successfully');
      window.location.reload(); // Reload to retry the request
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to="/topical-map"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
          <h1 className="mt-2 text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Topical Map for "{keyword}"
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore content opportunities and topic clusters for your keyword
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {map.categories.map((category, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{category.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              {category.pages.map((page, pageIndex) => (
                <div 
                  key={pageIndex}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-medium">{page.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                      page.intent === 'informational' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      page.intent === 'commercial' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      page.intent === 'transactional' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}>
                      {page.intent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showApiKeyDialog && (
        <ApiKeyDialog
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiKeyDialog(false)}
        />
      )}
    </div>
  );
}