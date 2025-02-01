import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
}

async function refreshGoogleToken(supabase: any, userId: string, refreshToken: string) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Token refresh error:', data);
      throw new Error(data.error_description || 'Failed to refresh token');
    }

    // Update tokens in database
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({
        google_access_token: data.access_token,
        google_token_expiry: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;
    
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log('Fetching Google tokens for user:', userId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's Google tokens
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('google_access_token, google_refresh_token, google_token_expiry')
      .eq('user_id', userId)
      .single()

    if (settingsError) {
      console.error('Error fetching user settings:', settingsError)
      throw new Error('Failed to fetch Google access token')
    }

    if (!settings?.google_access_token) {
      throw new Error('Google access token not found')
    }

    let accessToken = settings.google_access_token;

    // Check if token is expired and refresh if needed
    if (settings.google_token_expiry && new Date(settings.google_token_expiry) <= new Date()) {
      console.log('Token expired, refreshing...');
      if (!settings.google_refresh_token) {
        throw new Error('No refresh token available');
      }
      accessToken = await refreshGoogleToken(supabase, userId, settings.google_refresh_token);
    }

    console.log('Fetching sites from Google Search Console')

    // Fetch sites from Google Search Console
    const sitesResponse = await fetch(
      'https://www.googleapis.com/webmasters/v3/sites',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!sitesResponse.ok) {
      const errorData = await sitesResponse.json()
      console.error('Google API error:', errorData)
      throw new Error('Failed to fetch sites from Google Search Console')
    }

    const sites = await sitesResponse.json()

    return new Response(
      JSON.stringify(sites.siteEntry || []),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in google-search-console-sites function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})