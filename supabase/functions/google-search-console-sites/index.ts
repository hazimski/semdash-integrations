import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user ID from request header
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      throw new Error('User ID not provided')
    }

    // Initialize Supabase client
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

    if (settingsError || !settings) {
      throw new Error('Failed to get user settings')
    }

    const { google_access_token, google_refresh_token, google_token_expiry } = settings

    if (!google_access_token || !google_refresh_token) {
      throw new Error('Google tokens not found')
    }

    // Check if token needs refresh (if it expires in less than 5 minutes or is expired)
    const tokenExpiryDate = new Date(google_token_expiry)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    
    let accessToken = google_access_token

    if (tokenExpiryDate < fiveMinutesFromNow) {
      console.log('Token expires soon or is expired, refreshing...')
      
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: google_refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const tokens = await response.json()
      
      if (tokens.error) {
        console.error('Token refresh error:', tokens)
        throw new Error(tokens.error_description || 'Failed to refresh token')
      }

      // Update tokens in database
      const { error: updateError } = await supabase
        .from('user_settings')
        .update({
          google_access_token: tokens.access_token,
          google_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating tokens:', updateError)
        throw new Error('Failed to update tokens')
      }

      accessToken = tokens.access_token
    }

    // Fetch sites from Google Search Console
    const sitesResponse = await fetch(
      'https://www.googleapis.com/webmasters/v3/sites',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const sitesData = await sitesResponse.json()

    if (sitesData.error) {
      console.error('Google API error:', sitesData.error)
      throw new Error(sitesData.error.message || 'Failed to fetch sites')
    }

    return new Response(
      JSON.stringify(sitesData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch sites from Google Search Console' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})