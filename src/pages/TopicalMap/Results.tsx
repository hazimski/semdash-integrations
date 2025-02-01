import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LoadingState } from '../../components/topical-map/LoadingState';
import { ResultsView } from '../../components/topical-map/ResultsView';
import { generateTopicalMap } from '../../services/topicalMap';
import type { TopicalMap } from '../../services/topicalMap';
import { ApiKeyDialog } from '../../components/domain/copilot/ApiKeyDialog';
import { updateOpenAIKey } from '../../services/settings';

export function TopicalMapResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<TopicalMap | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const keyword = searchParams.get('keyword') || '';

  const handleSaveApiKey = async () => {
    if (!apiKey.startsWith('sk-')) {
      toast.error('Invalid API key format. It should start with "sk-"');
      return;
    }

    try {
      await updateOpenAIKey(apiKey);
      setShowApiKeyDialog(false);
      toast.success('API key saved successfully');
      fetchMap(); // Retry fetching the map after saving the API key
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  const fetchMap = async () => {
    if (!keyword) {
      setError('Keyword is required');
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateTopicalMap(keyword);
      setMap(result);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === 'API_KEY_REQUIRED') {
        setShowApiKeyDialog(true);
      } else {
        const message = err instanceof Error ? err.message : 'Failed to generate topical map';
        setError(message);
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMap();
  }, [keyword]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error && !showApiKeyDialog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {map && <ResultsView keyword={keyword} map={map} />}
      
      {showApiKeyDialog && (
        <ApiKeyDialog
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiKeyDialog(false)}
        />
      )}
    </>
  );
}