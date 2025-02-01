import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getLocationByCode } from '../../services/locations';
import { fetchMapsResults } from '../../services/mapsChecker';
import { MapsResultsView } from './MapsResultsView';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';

export function MapsCheckerResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [languageName, setLanguageName] = useState<string>('');
  const { checkCredits, deductUserCredits } = useCredits();

  const currentParams = {
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || ''
  };

  useEffect(() => {
    const loadLocationDetails = async () => {
      if (currentParams.location) {
        const location = await getLocationByCode(parseInt(currentParams.location));
        if (location) {
          setLocationName(location.location_name);
          const language = location.languages.find(lang => 
            lang.code === currentParams.language
          );
          setLanguageName(language?.name || currentParams.language);
        }
      }
    };
    loadLocationDetails();
  }, [currentParams.location, currentParams.language]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentParams.keyword) return;

      const hasCredits = await checkCredits(20);
      if (!hasCredits) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchMapsResults(
          currentParams.keyword,
          currentParams.location,
          currentParams.language
        );

        setResults(data);

        const deducted = await deductUserCredits(20, 'Maps Search');
        if (!deducted) {
          throw new Error('Failed to process credits');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch maps results';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentParams.keyword, currentParams.location, currentParams.language]);

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/maps-checker" className="hover:text-gray-700">
          Maps Checker
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Results</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Maps Results: {currentParams.keyword}
        </h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Location: {locationName}</span>
          <span>Language: {languageName}</span>
        </div>
      </div>

      {error ? (
        <ErrorState 
          title="No results found"
          message="We couldn't find any map results. This could be because:"
          suggestions={[
            'The location has no businesses matching your search',
            'The search term is too specific',
            'There was an error processing your request'
          ]}
        />
      ) : (
        <MapsResultsView 
          results={results}
          isLoading={isLoading}
          keyword={currentParams.keyword}
        />
      )}
    </div>
  );
}
