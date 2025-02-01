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
    const { siteUrl, days, dimension = 'query' } = await req.json()
    
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log('Fetching Google tokens for user:', userId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('google_access_token')
      .eq('user_id', userId)
      .single()

    if (settingsError) {
      console.error('Error fetching user settings:', settingsError)
      throw new Error('Failed to fetch Google access token')
    }

    if (!settings?.google_access_token) {
      throw new Error('Google access token not found')
    }

    console.log('Fetching performance data from Google Search Console')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const performanceResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.google_access_token}`,
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          dimensions: [dimension],
          rowLimit: 1000,
          aggregationType: 'auto'
        }),
      }
    )

    if (!performanceResponse.ok) {
      const errorData = await performanceResponse.json()
      console.error('Google API error:', errorData)
      throw new Error('Failed to fetch data from Google Search Console')
    }

    const performance = await performanceResponse.json()
    
    // Transform the data to match Google Search Console format exactly
    const transformedData = performance.rows?.map((row: any) => ({
      key: row.keys[0],
      clicks: Math.round(row.clicks || 0),
      impressions: Math.round(row.impressions || 0),
      ctr: parseFloat(((row.ctr || 0) * 100).toFixed(2)),
      position: parseFloat(row.position?.toFixed(1) || '0')
    })) || []

    console.log('Transformed data:', transformedData)

    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in google-search-console-performance function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})