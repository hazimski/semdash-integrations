import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { locations } from '../../data/locations';
import { AIKeywordInput } from './AIKeywordInput';
import { useCredits } from '../../hooks/useCredits';
import { getUserSettings, updateOpenAIKey } from '../../services/settings';
import { toast } from 'react-hot-toast';
import { ApiKeyDialog } from '../../components/domain/copilot/ApiKeyDialog';

interface AIKeywordFormProps {
  onSearch: (keywords: string[], location: string, language: string) => void;
}

export function AIKeywordForm({ onSearch }: AIKeywordFormProps) {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('2840'); // US by default
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { checkCredits } = useCredits();

  const selectedLocation = locations.find(loc => loc.code === location);
  const availableLanguages = selectedLocation?.languages || [];

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    const newLocationData = locations.find(loc => loc.code === newLocation);
    if (newLocationData && !newLocationData.languages.some(lang => lang.code === language)) {
      setLanguage(newLocationData.languages[0].code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    const keywordList = keywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k);

    if (keywordList.length === 0) {
      toast.error('Please enter at least one keyword');
      return;
    }

    if (keywordList.length > 500) {
      toast.error('Maximum 500 keywords allowed');
      return;
    }

    // Calculate required credits
    const requiredCredits = keywordList.length * 10;
    const hasCredits = await checkCredits(requiredCredits);
    if (!hasCredits) {
      toast.error(`Insufficient credits. Required: ${requiredCredits} credits`);
      return;
    }

    setIsLoading(true);
    onSearch(keywordList, location, language);
    setIsLoading(false);
  };

  const handleSaveApiKey = async () => {
    try {
      await updateOpenAIKey(apiKey);
      setShowApiKeyDialog(false);
      toast.success('API key saved successfully');
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      <AIKeywordInput 
        value={keywords}
        onChange={setKeywords}
        onApiKeyRequired={() => setShowApiKeyDialog(true)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="location"
            value={location}
            onChange={handleLocationChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {locations.map(loc => (
              <option key={loc.code} value={loc.code}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !keywords.trim()}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? 'Analyzing...' : 'Analyze Keywords'}
      </button>

      {showApiKeyDialog && (
        <ApiKeyDialog
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiKeyDialog(false)}
        />
      )}
    </form>
  );
}