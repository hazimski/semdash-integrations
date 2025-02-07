
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get OpenAI API key from app_settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('value')
      .eq('key', 'openai_api_key')
      .single()

    if (settingsError || !settings?.value) {
      throw new Error('OpenAI API key not found')
    }

    const { keywords, type } = await req.json()

    if (!Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Invalid keywords format')
    }

    const prompt = buildClusteringPrompt(keywords, type)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a keyword clustering assistant. Respond only with a valid JSON object containing a "clusters" object where each key is a descriptive cluster name and the value is an array of keywords. Do not include markdown code blocks or any other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    if (!result.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    // Parse the content directly since we ensured OpenAI will return clean JSON
    const clusters = JSON.parse(result.choices[0].message.content)
    
    return new Response(
      JSON.stringify(clusters),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function buildClusteringPrompt(keywords: string[], type: string): string {
  const prompts = {
    semantic: `Group these keywords into semantically related clusters:\n${keywords.join('\n')}`,
    modifier: `Group these keywords based on common modifiers and qualifiers:\n${keywords.join('\n')}`,
    topic: `Organize these keywords into topic-based clusters:\n${keywords.join('\n')}`,
    theme: `Create theme-based clusters for these keywords:\n${keywords.join('\n')}`
  }
  return prompts[type as keyof typeof prompts] || prompts.semantic
}
