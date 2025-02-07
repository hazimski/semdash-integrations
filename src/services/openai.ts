
import { supabase } from '../config/supabase';

export async function generateSEOStrategy(domain: string, data: any) {
  try {
    const { data: result, error } = await supabase.functions.invoke('generate-seo-strategy', {
      body: { domain, data }
    });

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error generating SEO strategy:', error);
    throw new Error('Failed to generate SEO strategy');
  }
}
