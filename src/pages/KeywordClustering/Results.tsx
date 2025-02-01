import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clusterKeywords } from '../../services/keywordClustering';
import { ClusteringResults } from '../../components/clustering/ClusteringResults';
import type { ClusteringType } from '../../services/keywordClustering';
import { ErrorState } from '../../components/shared/ErrorState';

export function KeywordClusteringResults() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clusters, setClusters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const keywordsParam = searchParams.get('keywords');
        const type = (searchParams.get('type') as ClusteringType) || 'semantic';

        if (!keywordsParam) {
          setError('No keywords provided');
          setIsLoading(false);
          return;
        }

        const keywords = JSON.parse(keywordsParam);
        if (!Array.isArray(keywords) || keywords.length === 0) {
          setError('Invalid keywords format');
          setIsLoading(false);
          return;
        }

        const results = await clusterKeywords(keywords, type);
        setClusters(results.clusters);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cluster keywords';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClusters();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center text-sm text-gray-500">
        <Link to="/keyword-clustering" className="hover:text-gray-700">
          Keyword Clustering
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Results</span>
      </nav>

      {error ? (
        <ErrorState 
          title="Clustering Failed"
          message="We couldn't cluster your keywords. This could be because:"
          suggestions={[
            'The OpenAI API key is missing or invalid',
            'The keywords list is empty or invalid',
            'There was an error processing your request'
          ]}
        />
      ) : (
        <ClusteringResults clusters={clusters} />
      )}
    </div>
  );
}