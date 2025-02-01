import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';

export function GoogleSearchConsole() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: settings } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('google_access_token')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: domains } = useQuery({
    queryKey: ['gsc-domains'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('google-search-console-sites', {
        headers: {
          'x-user-id': user.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!settings?.google_access_token
  });

  React.useEffect(() => {
    if (settings?.google_access_token && domains?.length > 0) {
      navigate(`/google-search-console/performance/${encodeURIComponent(domains[0].siteUrl)}`);
    }
  }, [settings, domains, navigate]);
  
  const handleGoogleAuth = () => {
    const redirectUri = `${window.location.origin}/google-search-console/callback`;
    const scope = 'https://www.googleapis.com/auth/webmasters.readonly';
    
    const params = new URLSearchParams({
      client_id: '875375764767-5v7sebv1p0vkecpku25ab6oafb8lpmo8.apps.googleusercontent.com',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true'
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  if (settings?.google_access_token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Google Search Console Integration</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Connect Your Account</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your Google Search Console account to view performance data for your websites.
          </p>
          <Button 
            onClick={handleGoogleAuth}
            className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <img 
              src="/lovable-uploads/50061d9a-1a0d-4ef3-8245-f5298e13ea1c.png" 
              alt="Google logo" 
              className="w-6 h-6"
            />
            Connect with Google Search Console
          </Button>
        </div>
      </div>
    </div>
  );
}