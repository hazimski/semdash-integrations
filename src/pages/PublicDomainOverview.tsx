import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDomainOverview } from '../services/domainOverviews';
import { DomainOverview } from './DomainOverview';
import { SharedLayout } from '../components/shared/SharedLayout';
import { format } from 'date-fns';
import { formatNumber } from '../utils/format';

export function PublicDomainOverview() {
  const { domain } = useParams<{ domain: string }>();
  
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['publicDomain', domain],
    queryFn: () => getDomainOverview(domain!),
    enabled: !!domain,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Only retry once for 404s
  });

  React.useEffect(() => {
    if (overview?.data) {
      // Set page title
      const date = new Date(overview.created_at);
      const formattedDate = format(date, 'MMMM yyyy');
      document.title = `${domain} Website Traffic, Ranking, Analytics [${formattedDate}] | Semdash`;

      // Set meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      const description = `${domain} domain rank ${overview.data.metrics.domainRank} with ${formatNumber(overview.data.metrics.organicTraffic)} Traffic and ${formatNumber(overview.data.metrics.backlinks)} Backlinks. Learn more about ${domain} top-ranking keywords, competitors, and best-performing pages.`;
      
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }
  }, [overview, domain]);

  if (isLoading) {
    return (
      <SharedLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </SharedLayout>
    );
  }

  // Handle case where domain overview doesn't exist
  if (!overview) {
    return (
      <SharedLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center max-w-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              No Analysis Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We don't have any analysis data for {domain} yet. Run an analysis to see insights about this domain.
            </p>
            <a
              href={`/overview?domain=${domain}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Analyze Domain
            </a>
          </div>
        </div>
      </SharedLayout>
    );
  }

  if (error) {
    return <Navigate to="/overview" replace />;
  }

  return (
    <SharedLayout>
      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Analysis from {format(new Date(overview.created_at), 'MMMM d, yyyy')}
        </div>
      </div>
      <DomainOverview sharedData={overview.data} />
    </SharedLayout>
  );
}