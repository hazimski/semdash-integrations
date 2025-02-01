import { supabase } from '../config/supabase';
import { BacklinkData } from '../types';

export async function saveBacklinkResults(userId: string, results: BacklinkData[]) {
  try {
    const { data, error } = await supabase
      .from('backlink_results')
      .insert(
        results.map(result => ({
          user_id: userId,
          target: result.target,
          main_domain_rank: result.main_domain_rank,
          backlinks: result.backlinks,
          referring_domains: result.referring_domains,
          broken_backlinks: result.broken_backlinks,
          referring_domains_nofollow: result.referring_domains_nofollow,
          anchor: result.anchor,
          image: result.image,
          canonical: result.canonical,
          redirect: result.redirect,
          referring_links_tld: result.referring_links_tld,
          referring_ips: result.referring_ips
        }))
      )
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving results:', error);
    throw error;
  }
}

export async function getBacklinkHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('backlink_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}
