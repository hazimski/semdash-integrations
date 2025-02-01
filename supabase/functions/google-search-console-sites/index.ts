import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
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
      .select('google_access_token, google_token_expiry')
      .eq('user_id', userId)
      .single()

    if (settingsError) {
      console.error('Error fetching user settings:', settingsError)
      throw new Error('Failed to fetch Google access token')
    }

    if (!settings?.google_access_token) {
      throw new Error('Google access token not found')
    }

    // Check if token is expired
    if (settings.google_token_expiry && new Date(settings.google_token_expiry) < new Date()) {
      throw new Error('Google access token has expired')
    }

    console.log('Fetching sites from Google Search Console')

    // Fetch sites from Google Search Console
    const sitesResponse = await fetch(
      'https://www.googleapis.com/webmasters/v3/sites',
      {
        headers: {
          Authorization: `Bearer ${settings.google_access_token}`,
        },
      }
    )

    if (!sitesResponse.ok) {
      const errorData = await sitesResponse.json()
      console.error('Google API error:', errorData)
      
      // More specific error message based on the response
      if (errorData.error?.status === 'UNAUTHENTICATED') {
        throw new Error('Google authentication failed - please reconnect your account')
      } else if (errorData.error?.status === 'PERMISSION_DENIED') {
        throw new Error('Access to Google Search Console was denied')
      } else {
        throw new Error(`Google API error: ${errorData.error?.message || 'Unknown error'}`)
      }
    }

    const sites = await sitesResponse.json()
    console.log('Successfully fetched sites:', sites)

    return new Response(
      JSON.stringify(sites.siteEntry || []),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in google-search-console-sites function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})