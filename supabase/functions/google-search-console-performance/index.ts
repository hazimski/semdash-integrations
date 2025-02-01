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
    const { siteUrl, days } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's Google token
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('google_access_token')
      .eq('user_id', req.headers.get('x-user-id'))
      .single()

    if (settingsError) throw settingsError

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
          dimensions: ['date'],
        }),
      }
    )

    const performance = await performanceResponse.json()

    return new Response(
      JSON.stringify(performance.rows || []),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})