import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Domain {
  siteUrl: string;
  permissionLevel: string;
}

export function GoogleSearchConsoleDomains() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: domains, isLoading, error, refetch } = useQuery({
    queryKey: ['gsc-domains'],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('google-search-console-sites', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (error) throw error;
      return data as Domain[];
    },
    enabled: !!user?.id
  });

  const handleConnect = async () => {
    try {
      const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load domains. Please try again.
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
            {domains?.map((domain) => (
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
    </div>
  );
}