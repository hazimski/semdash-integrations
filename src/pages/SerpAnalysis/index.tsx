import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ResultsTable } from './ResultsTable';
import { getSerpAnalysisData } from '../../services/serpChecker';
import { toast } from 'react-hot-toast';

export function SerpAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const date = searchParams.get('date');
  const keyword = searchParams.get('keyword');
  const monthData = searchParams.get('monthData');

  useEffect(() => {
    const fetchData = async () => {
      if (!monthData) {
        setError('No SERP data available');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const parsedData = JSON.parse(monthData);
        const results = await getSerpAnalysisData(parsedData.items);
        setData(results);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SERP data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [monthData]);

  const handleBack = () => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.delete('monthData');
    navigate(`/serp-checker/results?${currentParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <nav className="flex items-center text-sm text-gray-500">
            <Link to="/serp-checker" className="hover:text-gray-700">
              SERP Checker
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link 
              to={`/serp-checker/results?keyword=${keyword}`}
              className="hover:text-gray-700"
            >
              Results
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>SERP Analysis</span>
          </nav>

          <h1 className="text-2xl font-bold text-gray-900">
            SERP Analysis: {new Date(date || '').toLocaleDateString('default', {
              month: 'long',
              year: 'numeric'
            })}
          </h1>
        </div>

        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </button>
      </div>

      <ResultsTable 
        data={data}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
