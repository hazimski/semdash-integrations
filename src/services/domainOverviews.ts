import { supabase } from '../config/supabase';

interface DomainOverview {
  id: string;
  domain: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export async function saveDomainOverview(domain: string, data: any): Promise<string> {
  try {
    if (!domain) {
      throw new Error('Domain is required');
    }

    const { data: result, error } = await supabase.rpc(
      'save_domain_overview',
      {
        p_domain: domain.toLowerCase(),
        p_data: data
      }
    );

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error saving domain overview:', error);
    throw error;
  }
}

export async function getDomainOverview(domain: string): Promise<DomainOverview | null> {
  try {
    if (!domain) {
      return null;
    }

    // First try to get the exact domain
    let { data, error } = await supabase
      .from('domain_overviews')
      .select('*')
      .eq('domain', domain.toLowerCase())
      .maybeSingle(); // Use maybeSingle instead of single to avoid 406 errors

    if (error) throw error;
    
    // If no exact match, try with www. prefix removed
    if (!data && domain.startsWith('www.')) {
      const domainWithoutWww = domain.replace(/^www\./, '');
      ({ data, error } = await supabase
        .from('domain_overviews')
        .select('*')
        .eq('domain', domainWithoutWww.toLowerCase())
        .maybeSingle());

      if (error) throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting domain overview:', error);
    return null; // Return null instead of throwing to handle gracefully
  }
}