import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export function GoogleSearchConsoleCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      
      if (!code) {
        toast.error('Authorization failed: No code received');
        navigate('/google-search-console');
        return;
      }

      if (!user) {
        toast.error('Authorization failed: Not authenticated');
        navigate('/google-search-console');
        return;
      }

      try {
        console.log('Calling google-search-console-auth with code');
        const { data, error } = await supabase.functions.invoke('google-search-console-auth', {
          body: { 
            code,
            redirect_uri: `${window.location.origin}/google-search-console/callback`
          },
          headers: {
            Authorization: `Bearer ${user.id}`
          }
        });

        if (error) throw error;

        console.log('Auth successful:', data);
        toast.success('Successfully connected to Google Search Console');
        navigate('/google-search-console/domains');
      } catch (error) {
        console.error('Error during Google auth:', error);
        toast.error('Failed to connect to Google Search Console');
        navigate('/google-search-console');
      }
    };

    handleCallback();
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}