import { supabase } from '../config/supabase';

export interface Location {
  id: string;
  location_code: number;
  location_name: string;
  location_code_parent?: number | null;
  country_iso_code?: string;
  location_type: string;
}

// Cache locations in memory
let cachedLocations: Location[] | null = null;

export async function getLocations(): Promise<Location[]> {
  // Return cached data if available
  if (cachedLocations) {
    return cachedLocations;
  }

  try {
    const { data, error } = await supabase
      .from('local_serp_locations')
      .select('*')
      .order('location_type', { ascending: true })
      .order('location_name', { ascending: true });

    if (error) throw error;

    cachedLocations = data || [];
    return cachedLocations;
  } catch (error) {
    console.error('Error loading locations:', error);
    return [];
  }
}

export async function searchLocations(query: string): Promise<Location[]> {
  try {
    // If query is empty, return states and major cities
    if (!query.trim()) {
      const { data, error } = await supabase
        .from('local_serp_locations')
        .select('*')
        .or('location_type.eq.State,location_type.eq.DMA Region')
        .order('location_type', { ascending: true })
        .order('location_name', { ascending: true })
        .limit(50);

      if (error) throw error;
      return data || [];
    }

    // Search by name
    const { data, error } = await supabase
      .from('local_serp_locations')
      .select('*')
      .ilike('location_name', `%${query}%`)
      .order('location_type', { ascending: true })
      .order('location_name', { ascending: true })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

export async function getLocationByCode(code: number): Promise<Location | null> {
  try {
    const { data, error } = await supabase
      .from('local_serp_locations')
      .select('*')
      .eq('location_code', code)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}
