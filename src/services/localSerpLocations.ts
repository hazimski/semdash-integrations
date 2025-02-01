import { supabase } from '../config/supabase';

export interface LocalSerpLocation {
  id: string;
  code: number;
  name: string;
  type: string;
  parent_code?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Cache locations in memory
let cachedLocations: LocalSerpLocation[] | null = null;

export async function getLocalSerpLocations(): Promise<LocalSerpLocation[]> {
  // Return cached data if available
  if (cachedLocations) {
    return cachedLocations;
  }

  try {
    const { data, error } = await supabase
      .from('local_serp_locations')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    // Cache the results
    cachedLocations = data || [];
    return cachedLocations;
  } catch (error) {
    console.error('Error loading Local SERP locations:', error);
    return [];
  }
}

export async function searchLocalSerpLocations(
  query: string,
  limit: number = 50
): Promise<LocalSerpLocation[]> {
  try {
    // If query is empty, return states and major cities
    if (!query.trim()) {
      const { data, error } = await supabase
        .from('local_serp_locations')
        .select('*')
        .or(`type.eq.State,type.eq.DMA Region`)
        .order('type', { ascending: true })
        .order('name', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }

    // Search by name
    const { data, error } = await supabase
      .from('local_serp_locations')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('type', { ascending: true })
      .order('name', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching Local SERP locations:', error);
    return [];
  }
}

export async function getLocalSerpLocationByCode(code: number): Promise<LocalSerpLocation | null> {
  try {
    const { data, error } = await supabase
      .from('local_serp_locations')
      .select('*')
      .eq('code', code)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting Local SERP location:', error);
    return null;
  }
}
