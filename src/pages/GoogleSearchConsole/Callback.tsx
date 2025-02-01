import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { toast } from 'react-hot-toast';

export function GoogleSearchConsoleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      
      if (!code) {
        toast.error('Authorization failed');
        navigate('/google-search-console');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('google-search-console-auth', {
          body: { code }
        });

        if (error) throw error;

        toast.success('Successfully connected to Google Search Console');
        navigate('/google-search-console/domains');
      } catch (error) {
        console.error('Error during Google auth:', error);
        toast.error('Failed to connect to Google Search Console');
        navigate('/google-search-console');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}