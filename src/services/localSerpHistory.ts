import { supabase } from '../config/supabase';

export interface LocalSerpHistory {
  id: string;
  user_id: string;
  keyword: string;
  location_code: number;
  language_code: string;
  device: string;
  os: string;
  results: any[];
  created_at: string;
}

export async function getLocalSerpResult(id: string): Promise<LocalSerpHistory | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('local_serp_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting Local SERP result:', error);
    throw error;
  }
}

export async function getLocalSerpResultByKeyword(
  keyword: string,
  locationCode: number,
  languageCode: string
): Promise<LocalSerpHistory | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('local_serp_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('keyword', keyword)
      .eq('location_code', locationCode)
      .eq('language_code', languageCode)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting Local SERP result:', error);
    throw error;
  }
}

export async function saveLocalSerpResults(
  keyword: string,
  locationCode: number,
  languageCode: string,
  device: string,
  os: string,
  results: any[]
): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete any existing entries for this keyword/location/language combination
    const { error: deleteError } = await supabase
      .from('local_serp_history')
      .delete()
      .eq('user_id', user.id)
      .eq('keyword', keyword)
      .eq('location_code', locationCode)
      .eq('language_code', languageCode);

    if (deleteError) throw deleteError;

    // Insert new entry
    const { data, error: insertError } = await supabase
      .from('local_serp_history')
      .insert({
        user_id: user.id,
        keyword,
        location_code: locationCode,
        language_code: languageCode,
        device,
        os,
        results
      })
      .select()
      .single();

    if (insertError) throw insertError;
    if (!data) throw new Error('Failed to save results');

    return data.id;
  } catch (error) {
    console.error('Error saving Local SERP results:', error);
    throw error;
  }
}

export async function getLocalSerpHistory(
  page: number = 1,
  perPage: number = 10
): Promise<{ data: LocalSerpHistory[], count: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], count: 0 };
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('local_serp_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;

    // Get paginated data
    const { data, error } = await supabase
      .from('local_serp_history')
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
    console.error('Error getting Local SERP history:', error);
    throw error;
  }
}
