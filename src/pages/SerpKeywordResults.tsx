import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { KeywordsResultTable } from '../components/serp/KeywordsResultTable';
import { KeywordResearchNavigation } from '../components/keywords/KeywordResearchNavigation';
import { fetchRelatedKeywords } from '../services/serp';
import { toast } from 'react-hot-toast';
import { locations } from '../data/locations';
import { ErrorState } from '../components/shared/ErrorState';

export function SerpKeywordResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const currentParams = {
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    language: searchParams.get('language') || '',
    depth: parseInt(searchParams.get('depth') || '3')
  };

  const locationName = locations.find(loc => 
    loc.code === currentParams.location
  )?.name || currentParams.location;

  const languageName = locations.find(loc => 
    loc.code === currentParams.location
  )?.languages.find(lang => 
    lang.code === currentParams.language
  )?.name || currentParams.language;

  const fetchData = async (page: number = 1) => {
    if (!currentParams.keyword || !currentParams.location || !currentParams.language) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * 100;
      const data = await fetchRelatedKeywords(
        currentParams.keyword,
        currentParams.location,
        currentParams.language,
        currentParams.depth,
        offset
      );

      if (data.keywords.length === 0) {
        setError('No keywords found for the given search criteria');
      } else {
        setKeywords(data.keywords);
        setTotalCount(data.totalCount);
        setCurrentPage(page);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch keywords';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = [
      currentParams.keyword,
      currentParams.location,
      currentParams.language,
      currentParams.depth
    ];

    if (params.every(param => param)) {
      fetchData(1);
    }
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/serp" className="hover:text-gray-700">
          Keyword research
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>By SERP</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Keyword search by SERP: {currentParams.keyword}
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

      {error ? (
        <ErrorState 
          title="No keywords found"
          message="We couldn't find any related keywords. This could be because:"
          suggestions={[
            'The keyword has no related searches',
            'The keyword has very low search volume',
            'The keyword was mistyped or does not exist'
          ]}
        />
      ) : (
        <KeywordsResultTable 
          keywords={keywords}
          totalCount={totalCount}
          isLoading={isLoading}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          error={error}
        />
      )}
    </div>
  );
}
