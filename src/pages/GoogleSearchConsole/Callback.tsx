import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: '1012072796878-ufqj8s88vto2tnp0vj3g7vv9qk7n8l1q.apps.googleusercontent.com',
            client_secret: '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',
            redirect_uri: `${window.location.origin}/google-search-console/callback`,
            grant_type: 'authorization_code',
          }),
        });

        const tokens = await response.json();
        
        if (tokens.error) {
          console.error('Token exchange error:', tokens);
          throw new Error(tokens.error_description || 'Failed to exchange code for tokens');
        }

        // Store tokens in user_settings
        const { error: updateError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            google_access_token: tokens.access_token,
            google_refresh_token: tokens.refresh_token,
            google_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString()
          });

        if (updateError) throw updateError;

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