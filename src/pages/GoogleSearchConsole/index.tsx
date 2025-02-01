import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function GoogleSearchConsole() {
  const navigate = useNavigate();
  
  const handleGoogleAuth = () => {
    const redirectUri = `${window.location.origin}/google-search-console/callback`;
    const scope = 'https://www.googleapis.com/auth/webmasters.readonly';
    
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent'
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

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