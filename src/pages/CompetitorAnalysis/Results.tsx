import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { CompetitorsFullTable } from '../../components/domain/CompetitorsFullTable';
import { CompetitivePositioningMap } from '../../components/domain/competitvebubblechart';
import { fetchCompetitors } from '../../services/domain';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import { locations } from '../../data/locations';
import { ErrorState } from '../../components/shared/ErrorState';
import { getCountryFlag } from '../../utils/country';

interface CompetitorData {
  domain: string;
  keywords: number;
  traffic: number;
  metrics: any;
}

const DepthFilter = ({ depth, onDepthChange }: { depth: number; onDepthChange: (value: number) => void }) => {
  const depths = [100, 50, 20, 10, 5];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Depth</span>
      <div className="flex bg-white rounded-lg shadow border border-gray-200">
        {depths.map((value) => (
          <button
            key={value}
            onClick={() => onDepthChange(value)}
            className={`px-4 py-2 text-sm font-medium transition-colors
              ${depth === value 
                ? 'bg-[#7F40E2] text-white' 
                : 'text-gray-600 hover:text-gray-900'
              }
              ${value === 100 ? 'rounded-l-lg' : ''}
              ${value === 5 ? 'rounded-r-lg' : ''}
              border-r last:border-r-0 border-gray-200
            `}
          >
            Top {value}
          </button>
        ))}
      </div>
    </div>
  );
};

const DomainInput = ({
  value,
  onChange,
  onApply,
}: {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
}) => {
  return (
    <div className="relative flex items-center w-full max-w-xl">
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <div className="bg-purple-100 rounded-md p-1">
            <Sparkles className="w-4 h-4 text-[#7F40E2]" />
          </div>
          <span className="text-sm font-medium text-purple-600">AI-powered</span>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter domain for personalized data"
          className="w-full h-11 pl-32 pr-4 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
        />
      </div>
    </div>
  );
};

export function CompetitorAnalysisResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [depth, setDepth] = useState<number>(10);
  const [pendingDepth, setPendingDepth] = useState<number>(10);
  const [intersectingDomain, setIntersectingDomain] = useState<string>('');
  const [pendingIntersectingDomain, setPendingIntersectingDomain] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const currentParams = {
    domain: searchParams.get('domain') || '',
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

  const fetchData = async (page: number = 1) => {
    if (!currentParams.domain || !currentParams.location || !currentParams.language) return;

    // Clean up and validate intersecting domain
    const cleanIntersectingDomain = pendingIntersectingDomain.trim();
    if (cleanIntersectingDomain && cleanIntersectingDomain === currentParams.domain) {
      toast.error('Cannot compare domain with itself');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * itemsPerPage;
      const intersectingDomains = cleanIntersectingDomain ? [cleanIntersectingDomain] : undefined;
      const data = await fetchCompetitors(
        currentParams.domain,
        currentParams.location,
        currentParams.language,
        pendingDepth,
        intersectingDomains,
        offset
      );

      setCompetitors(data.competitors);
      setTotalCount(data.totalCount);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch competitors';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [currentParams.domain, currentParams.location, currentParams.language]);

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/competitor-analysis" className="hover:text-gray-700 dark:hover:text-gray-300">
          Competitor Analysis
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Results</span>
      </nav>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Competitors: {currentParams.domain}
        </h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center">
            Database: 
            <img 
              src={getCountryFlag(currentParams.location)}
              alt={locationName}
              className="w-4 h-3 mx-2"
            />
            {locationName}
          </span>
          <span>Language: {languageName}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-6">
          <DepthFilter 
            depth={pendingDepth} 
            onDepthChange={setPendingDepth} 
          />

          <DomainInput
            value={pendingIntersectingDomain}
            onChange={setPendingIntersectingDomain}
            onApply={() => {
              setDepth(pendingDepth);
              setIntersectingDomain(pendingIntersectingDomain);
              fetchData(1);
            }}
          />

          <button
            onClick={() => {
              setDepth(pendingDepth);
              setIntersectingDomain(pendingIntersectingDomain);
              fetchData(1);
            }}
            className="ml-3 px-6 h-11 bg-[#7F40E2] text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState 
          title="No competitors found"
          message="We couldn't find any competitor data. This could be because:"
          suggestions={[
            'The domain is too new or has very few rankings',
            'There are no competing domains in this market',
            'The domain name was mistyped or does not exist'
          ]}
        />
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Competitive Positioning Map
            </h2>
            <div className="h-[500px]">
              <CompetitivePositioningMap 
                data={competitors} 
                maxCompetitors={10} 
              />
            </div>
          </div>

          <CompetitorsFullTable 
            competitors={competitors}
            totalCount={totalCount}
            currentPage={currentPage}
            onPageChange={fetchData}
            isLoading={isLoading}
            currentParams={{
              location: currentParams.location,
              language: currentParams.language
            }}
          />
        </>
      )}
    </div>
  );
}
