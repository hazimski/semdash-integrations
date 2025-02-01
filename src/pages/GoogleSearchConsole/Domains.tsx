import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Unlink } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Domain {
  siteUrl: string;
  permissionLevel: string;
}

export function GoogleSearchConsoleDomains() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: domains, isLoading, error } = useQuery({
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

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expiry: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Invalidate the domains query to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['gsc-domains'] });
      
      toast.success('Successfully disconnected from Google Search Console');
      navigate('/google-search-console');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect from Google Search Console');
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
          onClick={handleDisconnect}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <Unlink className="w-4 h-4" />
          Disconnect Google
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