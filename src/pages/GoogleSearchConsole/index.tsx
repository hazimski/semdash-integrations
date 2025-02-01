import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function GoogleSearchConsole() {
  const navigate = useNavigate();
  
  const handleGoogleAuth = async () => {
    // TODO: Implement Google OAuth flow
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${window.location.origin}/google-search-console/callback&response_type=code&scope=https://www.googleapis.com/auth/webmasters.readonly&access_type=offline`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Google Search Console Integration</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Connect Your Account</h2>
          <p className="text-gray-600 mb-6">
            Connect your Google Search Console account to view performance data for your websites.
          </p>
          <Button 
            onClick={handleGoogleAuth}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
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