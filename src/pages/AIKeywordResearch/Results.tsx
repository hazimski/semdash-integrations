import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { locations } from '../../data/locations';
import { fetchKeywordVolumes } from '../../services/aiKeywords';
import { decompressParams } from '../../utils/urlCompression';
import { KeywordsResultTable } from './ResultsTable';
import { useCredits } from '../../hooks/useCredits';
import { ErrorState } from '../../components/shared/ErrorState';
import { useQuery } from '@tanstack/react-query';

export function AIKeywordResearchResults() {
  const { compressed } = useParams<{ compressed: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { checkCredits, deductUserCredits } = useCredits();

  const params = compressed ? decompressParams(compressed) : null;
  
  useEffect(() => {
    if (!params) {
      toast.error('Invalid URL parameters');
      navigate('/ai-keyword-research');
    }
  }, [params, navigate]);

  const currentParams = params ? {
    keywords: JSON.parse(params.keywords || '[]'),
    location: params.location || '',
    language: params.language || ''
  } : {
    keywords: [],
    location: '',
    language: ''
  };

  const locationName = locations.find(loc => 
    loc.code === currentParams.location
  )?.name || currentParams.location;

  const languageName = locations.find(loc => 
    loc.code === currentParams.location
  )?.languages.find(lang => 
    lang.code === currentParams.language
  )?.name || currentParams.language;

  const fetchKeywordData = async () => {
    if (!currentParams.keywords.length) {
      throw new Error('Keywords are required');
    }

    if (currentParams.keywords.length > 500) {
      throw new Error('Maximum 500 keywords allowed');
    }

    // Calculate required credits (10 per keyword)
    const requiredCredits = currentParams.keywords.length * 10;

    const hasCredits = await checkCredits(requiredCredits);
    if (!hasCredits) {
      throw new Error(`Insufficient credits. Required: ${requiredCredits} credits`);
    }

    const result = await fetchKeywordVolumes(
      currentParams.keywords,
      currentParams.location,
      currentParams.language,
      (currentPage - 1) * 100
    );

    await deductUserCredits(requiredCredits, 'AI Keyword Research');
    return result;
  };

  const { 
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['aiKeywords', currentParams.keywords, currentParams.location, currentParams.language, currentPage],
    queryFn: fetchKeywordData,
    enabled: currentParams.keywords.length > 0,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 1
  });

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await refetch();
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/ai-keyword-research" className="hover:text-gray-700">
          Keyword Research
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>AI Analysis</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          AI Keyword Analysis Results
        </h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>Database: {locationName}</span>
          <span>Language: {languageName}</span>
        </div>
      </div>

      {error ? (
        <ErrorState 
          title="No keyword data found"
          message={error instanceof Error ? error.message : "We couldn't find any data for these keywords. This could be because:"}
          suggestions={[
            'The keywords have no search volume',
            'The keywords are too specific or niche',
            'There was an error processing your request'
          ]}
        />
      ) : (
        <KeywordsResultTable 
          keywords={data?.keywords || []}
          totalCount={data?.totalCount || 0}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          error={error instanceof Error ? error.message : null}
          locationCode={currentParams.location}
          languageCode={currentParams.language}
        />
      )}
    </div>
  );
}