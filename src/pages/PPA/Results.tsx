import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Network, List, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { KeywordResearchNavigation } from '../../components/keywords/KeywordResearchNavigation';
import { locations } from '../../data/locations';
import { fetchPPAData } from '../../services/ppaService';
import { PPAOrgChart } from './PPAOrgChart';
import { PPATreeChart } from './PPATreeChart';
import { exportToPDF } from './exportToPDF';
import { exportToCSV } from './exportToCSV';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

export function PPAResults() {
  const { checkCredits, deductUserCredits } = useCredits();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'org'>('org');
  const [displayOptions, setDisplayOptions] = useState({
    showDescription: true,
    showDomain: true
  });

  const currentParams = {
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || ''
  };

  const locationName = locations.find(loc => 
    loc.code === currentParams.location
  )?.name || currentParams.location;

  const languageName = locations.find(loc => 
    loc.code === currentParams.location
  )?.languages.find(lang => 
    lang.code === currentParams.language
  )?.name || currentParams.language;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentParams.keyword || !currentParams.location || !currentParams.language) {
        return;
      }

      const hasCredits = await checkCredits(30);
      if (!hasCredits) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchPPAData(
          currentParams.keyword,
          currentParams.location,
          currentParams.language
        );
        setData(result);

        const deducted = await deductUserCredits(30, 'PPA Analysis');
        if (!deducted) {
          throw new Error('Failed to process credits');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch PPA data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentParams.keyword, currentParams.location, currentParams.language]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      if (format === 'pdf') {
        await exportToPDF(currentParams.keyword, data, viewMode);
      } else {
        await exportToCSV(currentParams.keyword, data);
      }
      toast.success(`Successfully exported to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/ppa" className="hover:text-gray-700">
          People Also Ask
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Results</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          People Also Ask: {currentParams.keyword}
        </h1>
        <KeywordResearchNavigation 
          keyword={currentParams.keyword}
          location={currentParams.location}
          language={currentParams.language}
        />
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Database: {locationName}</span>
          <span>Language: {languageName}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('org')}
            className={`p-2 rounded-lg flex items-center space-x-2 ${
              viewMode === 'org'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Network className="w-5 h-5" />
            <span>Chart View</span>
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`p-2 rounded-lg flex items-center space-x-2 ${
              viewMode === 'tree'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
            <span>Tree View</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">
              <input
                type="checkbox"
                checked={displayOptions.showDescription}
                onChange={(e) => setDisplayOptions(prev => ({
                  ...prev,
                  showDescription: e.target.checked
                }))}
                className="mr-2"
              />
              Show Description
            </label>
            <label className="text-sm text-gray-700">
              <input
                type="checkbox"
                checked={displayOptions.showDomain}
                onChange={(e) => setDisplayOptions(prev => ({
                  ...prev,
                  showDomain: e.target.checked
                }))}
                className="mr-2"
              />
              Show Domain
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState 
          title="No questions found"
          message="We couldn't find any 'People Also Ask' questions. This could be because:"
          suggestions={[
            'The keyword has no related questions',
            'The keyword is too specific or niche',
            'The keyword was mistyped or does not exist'
          ]}
        />
      ) : (
        viewMode === 'org' ? (
          <PPAOrgChart 
            data={data}
            rootKeyword={currentParams.keyword}
            isLoading={isLoading}
            error={error}
            displayOptions={displayOptions}
          />
        ) : (
          <PPATreeChart 
            data={data}
            rootKeyword={currentParams.keyword}
            isLoading={isLoading}
            error={error}
          />
        )
      )}
    </div>
  );
}
