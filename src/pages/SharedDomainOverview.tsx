import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSharedDomainHistory } from '../services/domainHistory';
import { DomainOverview } from './DomainOverview';
import { SharedLayout } from '../components/shared/SharedLayout';

export function SharedDomainOverview() {
  const { token } = useParams<{ token: string }>();
  
  const { data: historyEntry, isLoading, error } = useQuery({
    queryKey: ['sharedDomain', token],
    queryFn: () => getSharedDomainHistory(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  if (isLoading) {
    return (
      <SharedLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </SharedLayout>
    );
  }

  if (error || !historyEntry) {
    return (
      <SharedLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This shared link is invalid or has expired.
            </p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <DomainOverview sharedData={historyEntry} />
    </SharedLayout>
  );
}
