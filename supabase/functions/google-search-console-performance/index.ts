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
    const { siteUrl, days = 28, dimension = 'query' } = await req.json()
    
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

    console.log('Fetching performance data from Google Search Console')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const endDate = new Date()

    // Initialize array to store all results
    let allResults = []
    const maxRows = 25000
    let startRow = 0

    // Keep fetching until we get all results
    do {
      const requestBody = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: [dimension],
        rowLimit: maxRows,
        startRow: startRow,
        type: 'web',
        // If dimension is searchAppearance, we don't include other dimensions
        ...(dimension === 'searchAppearance' ? {} : {
          dataState: 'all'
        })
      }

      console.log('GSC API Request:', {
        url: siteUrl,
        body: requestBody,
        tokenLength: settings.google_access_token.length
      })

      const performanceResponse = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.google_access_token}`,
          },
          body: JSON.stringify(requestBody),
        }
      )

      console.log('GSC API Response Status:', performanceResponse.status)
      console.log('GSC API Response Headers:', Object.fromEntries(performanceResponse.headers.entries()))

      if (!performanceResponse.ok) {
        const errorData = await performanceResponse.json()
        console.error('Google API error response:', JSON.stringify(errorData, null, 2))
        
        if (performanceResponse.status === 401) {
          throw new Error('Google access token expired')
        }
        
        throw new Error(`Google API error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const response = await performanceResponse.json()
      console.log('Raw GSC API Response:', JSON.stringify(response, null, 2))

      if (!response.rows) {
        break
      }

      allResults = allResults.concat(response.rows)
      startRow += maxRows

      console.log(`Retrieved ${response.rows.length} rows, total so far: ${allResults.length}`)

    } while (true)

    // Transform the data
    const transformedData = allResults.map(row => ({
      key: row.keys[0],
      clicks: Math.round(row.clicks || 0),
      impressions: Math.round(row.impressions || 0),
      ctr: parseFloat((row.ctr * 100).toFixed(2)),
      position: parseFloat(row.position.toFixed(1))
    }))

    console.log('Transformed data sample:', transformedData.slice(0, 2))

    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in google-search-console-performance function:', error)
    console.error('Full error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch data from Google Search Console' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})
