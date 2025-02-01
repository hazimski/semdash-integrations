import { supabase } from '../config/supabase';
import type { ClusteringType } from './keywordClustering';

export interface KeywordList {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ListKeyword {
  id: string;
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  keyword_difficulty: number;
  intent: string;
  source: string;
  language: string;
  location: string;
  created_at: string;
}

export async function getKeywordLists(): Promise<KeywordList[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('keyword_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting keyword lists:', error);
    return [];
  }
}

export async function createKeywordList(name: string, description?: string): Promise<KeywordList> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('keyword_lists')
      .insert([{ 
        name, 
        description,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating keyword list:', error);
    throw error;
  }
}

export async function addKeywordsToList(listId: string, keywords: Array<{
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  keyword_difficulty: number;
  intent: string;
  source: string;
  language: string;
  location: string;
}>): Promise<void> {
  try {
    const { error } = await supabase
      .from('list_keywords')
      .insert(
        keywords.map(keyword => ({
          list_id: listId,
          ...keyword
        }))
      );

    if (error) throw error;
  } catch (error) {
    console.error('Error adding keywords to list:', error);
    throw error;
  }
}

export async function getKeywordsInList(listId: string): Promise<ListKeyword[]> {
  try {
    const { data, error } = await supabase
      .from('list_keywords')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting keywords in list:', error);
    throw error;
  }
}

export async function deleteKeywordList(listId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('keyword_lists')
      .delete()
      .eq('id', listId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting keyword list:', error);
    throw error;
  }
}

export async function deleteKeywordsFromList(listId: string, keywordIds: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('list_keywords')
      .delete()
      .eq('list_id', listId)
      .in('id', keywordIds);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting keywords from list:', error);
    throw error;
  }
}

export async function clusterKeywordList(listId: string, type: ClusteringType) {
  try {
    const keywords = await getKeywordsInList(listId);
    if (!keywords.length) {
      throw new Error('No keywords found in list');
    }

    const keywordStrings = keywords.map(k => k.keyword);
    const results = await clusterKeywords(keywordStrings, type);
    return results;
  } catch (error) {
    console.error('Error clustering keyword list:', error);
    throw error;
  }
}