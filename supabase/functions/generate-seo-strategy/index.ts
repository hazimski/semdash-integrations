
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

    const { domain, data } = await req.json()

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
            content: `You're an SEO expert working at Semdash, an SEO platform. Those are the main platform pages along with some info about them:

Domain Overview
Use case: Gives you a holistic overview on any domain metrics like rank, traffic, top organic keywords, competitor domains, the number of new & lost backlinks, referring domains, indexed pages.
Results: Displays domain's rank, traffic, top keywords, competitor domains, backlinks status, referring domains, indexed pages.
Filters: None specified.

Competition Analysis
Serp Checker: https://seo.semdash.com/serp-checker
Use case: Gives you what were the top 100 results on Google for any keyword over the past 12 months.
Results: Displays top 100 SERP results.

SERP Analytics
Use case: Gives you top 100 results for any keyword for a specific month along with each domain's metrics like rank, backlinks count, search traffic, referring domains count.
Results: Displays top 100 results with domain metrics.

Competitor Domains
Use case: This will provide you with an overview of competitor domains and their traffic volume from organic search.
Results: Competitive Positioning Map of top 10 competitors, plus a table of all competitor domains, keywords they rank for, estimated traffic.

Keyword Gap: https://seo.semdash.com/keyword-gap
Use case: A tool that helps you compare your keyword profile with your competitors. Find keywords that your competitor is ranking for, which keywords drive traffic to your competitor but not to you.
Results: List of keywords, URL the domain is ranking for in SERP for this keyword, what position this URL has in the SERP for this keyword, KD, search volume, URL estimated traffic from this keyword.
Filters: "Missing: shows keywords competitor ranks for but you don't. "Shared" (if used, user can also find keywords both they and their competitor rank for in SERP).

Backlink Gap: https://seo.semdash.com/backlink-gap
Use case: Find websites that are linking to your competitor but not to you. Identify gaps between competitors' link-building strategies and plan your own outreach to build links.
Results: Page AS, Source Page Title and URL, Ext. Links, Int. Links, Anchor and Target URL, First Seen, Last Seen.
Filters: Show only new backlinks, broken backlinks, live backlinks, lost backlinks, dofollow or nofollow. Filter by domain from contain and domain to contain.

Traffic Share: https://seo.semdash.com/traffic-share
Use case: This report shows the domains that get the most organic traffic based on your seed keywords in your target country.
Results: Displays URLs ranking for the search term, their estimated traffic, traffic %, and positions they rank for in SERP.
Filters: URL contains, traffic range. Bulk input of up to 100 keywords.

Competitor domains: https://seo.semdash.com/competitor-analysis
Use case: This will provide you with an overview of all competitors for a website and their traffic volume from organic search.
user gets Competitive Positioning Map of the top 10 competitors along with a table of all competitors domains, keywords they rank for, estimated traffic.

Pages Ranking: https://seo.semdash.com/pages
Use case: Find the pages that get the most traffic of any domain.
Results: List of top traffic-driving pages of a domain.

Keyword Research
Keyword Overview: https://seo.semdash.com/keyword-overview
Use case: Get any keyword's search volume, SERP results over time, intent, ranking difficulty, CPC, competition level, volume trend, and what you need to rank in the top 10 Google results for this keyword.
Results: Detailed data on keyword performance, including search volume, trends, ranking difficulty, CPC, and competition.
Filters: None specified.

People Also Search: https://seo.semdash.com/serp
Use case: Get keywords appearing in the "searches related to" SERP element.
Filters: Keyword, volume, CPC, competition, KD, backlinks, ref domains, domain rank, intent, trend.

Domain Ranked Keywords: https://seo.semdash.com/ranked-keywords
Use case: Get a list of all the keywords a domain is ranking organically in Google for.
Results: Keyword, volume, intent, traffic, KD%, CPC, position, change, URL.
Filters: Ignore synonyms, featured snippets only, search intent, position range, search volume, traffic range, CPC range.

Longtail Keywords: https://seo.semdash.com/seed
Use case: Get keywords that contain the keyword you set in the request with additional words before, after, or within the specified key phrase.
Results: Keyword, volume, CPC, competition, KD, backlinks, ref domains, domain rank, intent, trend.
Filters: Keyword contains, exclude keywords, search intent, search volume, CPC, KD.

People Also Ask: https://seo.semdash.com/ppa
Use case: Shows people also ask section on Google related to the search query.
Results: Can be expanded to include questions related to search term and questions related to those questions. can be expanded to include questions related to search term and question related to those questions.

Backlink Research
Backlinks: https://seo.semdash.com/botox
Use case: See every backlink a domain has. Assess each link's quality by viewing its rating, anchor text, 'new' or 'lost' status, dofollow/nofollow status, first/last seen and more.
Results: List of backlinks with quality metrics.
Filters: show only new backlinks, broken backlinks, live backlinks, lost, dofollow or no follow. filter by domain from contain and domain to contain

Referring Domains: https://seo.semdash.com/referring-domains
Use case: Detailed overview of referring domains pointing to the target domain you specify.
Results: Referring domains with metrics.

Top Pages by Backlinks: https://seo.semdash.com/pages-by-links
Use case: Shows a list of all domain pages along with how many backlinks they have.
Results: Title and URL, Backlinks count, Domains count, Nofollow Backlinks count, Backlinks Spam Score, First Seen.
Filters: Show broken pages (4XX or 5XX status code), include/exclude subdomains.

Keyword clustering tool: user can cluster based on keyword modifier, semantic, topic or theme.
Topical map generator.

Develop a detailed, personalized SEO strategy plan for the domain, using the provided SEO research platform data, pages, and tools.

Requirements:
The output must consist only of specific action items, organized into sections. No general statements or introductory text.
For each recommendation:
Start with a concise reason based on the provided data (e.g., identified issues, opportunities, keyword gaps, competitor analysis, etc.).
Follow immediately with the specific action to address the issue or capitalize on the opportunity.
Reference the provided data (e.g., specific keywords, competitors, domains, or URLs) in both the reasoning and the recommended action.
Actions should focus on which page, tool, filters to use to use on Semdash.
Utilize all the provided data to ensure the plan feels deeply personalized and maximizes the effectiveness of recommendations.
Every tool or page you mention make sure to hyperlink it with its correct link, hyperlinks should only be for the title and not in the middle of sentences.
In the output break each section in a separate "text".
Focus on actions to:
Improve keyword rankings.
Increase organic traffic.
Resolve identified issues.
Leverage opportunities discovered in the data.
Avoid fluff, marketing language, and general advice; ensure all recommendations are precise and data-driven.
In the text output don't include **. start each new section with a relevant emoji`
          },
          { role: 'user', content: `The domain: ${domain},\nData for the domain is as follows: ${JSON.stringify(data, null, 2)}` }
        ],
        temperature: 0.5,
        max_tokens: 5000
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
    
    return new Response(
      JSON.stringify(result.choices[0].message.content),
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
