import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '../../components/shared/ErrorState';

export function GoogleSearchConsoleDomains() {
  const navigate = useNavigate();
  
  const { data: domains, isLoading, error } = useQuery({
    queryKey: ['gsc-domains'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      const { data, error, status } = await supabase.functions.invoke('google-search-console-sites', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (error) {
        // Add status code to error message if available
        if (status) {
          throw new Error(`${error.message} (Status: ${status})`);
        }
        throw error;
      }
      
      return data;
    },
    retry: false,
    staleTime: 30000 // Cache for 30 seconds
  });

  const handleConnect = async () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google client ID not configured');
      }

      const redirectUri = `${window.location.origin}/google-search-console/callback`;
      const scope = 'https://www.googleapis.com/auth/webmasters.readonly';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      toast.error('Failed to connect to Google Search Console');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show reconnect button for expired token
  if (error?.message?.includes('Google access token has expired') || 
      error?.message?.includes('Google access token not found') ||
      error?.message?.includes('Google authentication failed')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          title="Google Search Console Connection Required"
          message={error.message === 'Google access token has expired' 
            ? 'Your connection to Google Search Console has expired. Please reconnect to continue accessing your data.'
            : 'Please connect your Google Search Console account to access your data.'}
          suggestions={[
            'Click the button below to connect or reconnect your Google Search Console account.',
            'Make sure you select the correct Google account that has access to your Search Console properties.',
            'Ensure you grant all the required permissions when prompted.'
          ]}
        />
        <div className="mt-6 text-center">
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {error.message === 'Google access token has expired' ? 'Reconnect' : 'Connect'} to Google Search Console
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          title="Failed to Load Domains"
          message={error.message}
          suggestions={[
            'Check your internet connection and try refreshing the page.',
            'Make sure you have the necessary permissions in Google Search Console.',
            'If the problem persists, try reconnecting your Google Search Console account.'
          ]}
        />
        <div className="mt-6 text-center">
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reconnect to Google Search Console
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Connected Domains</h1>
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {domains?.length ? 'Reconnect to Google Search Console' : 'Connect to Google Search Console'}
        </button>
      </div>
      
      {domains?.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domains.map((domain: any) => (
                <tr key={domain.siteUrl} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {domain.siteUrl}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {domain.permissionLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/google-search-console/performance/${encodeURIComponent(domain.siteUrl)}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Performance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ErrorState
          title="No Domains Found"
          message="You don't have any domains connected to Google Search Console."
          suggestions={[
            'Click the "Connect to Google Search Console" button above to get started.',
            'Make sure you have access to domains in Google Search Console.',
            'If you just added a domain, it might take some time to appear.'
          ]}
        />
      )}
    </div>
  );
}