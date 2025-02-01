import { supabase } from '../config/supabase';
import { saveDomainOverview } from './domainOverviews';

export interface DomainHistoryEntry {
  id: string;
  domain: string;
  location_code: string;
  language_code: string;
  metrics: {
    domainRank: number;
    organicTraffic: number;
    keywords: number;
    backlinks: number;
    referringDomains: number;
    brokenPages: number;
    brokenBacklinks: number;
    ips: number;
    subnets: number;
  };
  data: any;
  created_at: string;
}

export async function getDomainHistory(
  page: number = 1,
  perPage: number = 10
): Promise<{ data: DomainHistoryEntry[], count: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], count: 0 };
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('domain_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;

    // Get paginated data
    const { data, error } = await supabase
      .from('domain_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (error) throw error;

    return { 
      data: data || [], 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error getting domain history:', error);
    return { data: [], count: 0 };
  }
}

export async function getDomainHistoryEntry(
  domain: string,
  locationCode: string,
  languageCode: string
): Promise<DomainHistoryEntry | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('domain_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('domain', domain)
      .eq('location_code', locationCode)
      .eq('language_code', languageCode)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting domain history entry:', error);
    return null;
  }
}

export async function saveDomainHistory(
  domain: string,
  locationCode: string,
  languageCode: string,
  metrics: any,
  data: any
): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Save to domain_history
    const { data: result, error } = await supabase
      .from('domain_history')
      .upsert({
        user_id: user.id,
        domain: domain.toLowerCase(),
        location_code: locationCode,
        language_code: languageCode,
        metrics,
        data
      }, {
        onConflict: 'user_id,domain,location_code,language_code',
        returning: true
      })
      .select()
      .single();

    if (error) throw error;

    // Also save to public domain_overviews
    await saveDomainOverview(domain, {
      domain,
      metrics,
      data,
      created_at: result.created_at
    });

    return result.id;
  } catch (error) {
    console.error('Error saving domain history:', error);
    throw error;
  }
}

export async function createShareLink(historyId: string): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // First verify the user owns this history entry
    const { data: historyEntry, error: historyError } = await supabase
      .from('domain_history')
      .select('id')
      .eq('id', historyId)
      .eq('user_id', user.id)
      .single();

    if (historyError || !historyEntry) {
      throw new Error('Not authorized to share this domain history');
    }

    // Create share token
    const { data: token, error } = await supabase.rpc('create_domain_share_link', {
      p_domain_history_id: historyId
    });

    if (error) throw error;
    return token;
  } catch (error) {
    console.error('Error creating share link:', error);
    throw error;
  }
}

export async function getSharedDomainHistory(token: string): Promise<DomainHistoryEntry | null> {
  try {
    const { data, error } = await supabase.rpc('get_shared_domain_history', {
      p_share_token: token
    });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data[0] as DomainHistoryEntry;
  } catch (error) {
    console.error('Error getting shared domain history:', error);
    throw error;
  }
}