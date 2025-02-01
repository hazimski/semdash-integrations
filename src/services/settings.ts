import { supabase } from '../config/supabase';

interface UserSettings {
  openai_api_key?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('openai_api_key, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
}

export async function updateOpenAIKey(apiKey: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        user_id: user.id,
        openai_api_key: apiKey,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating OpenAI API key:', error);
    throw error;
  }
}