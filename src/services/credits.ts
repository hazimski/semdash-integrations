import { supabase } from '../config/supabase';

export async function deductCredits(userId: string, amount: number, action: string): Promise<boolean> {
  if (!userId) {
    console.error('No user ID provided for deducting credits');
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_credits: amount,
      p_action: action
    });

    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Error deducting credits:', error);
    return false;
  }
}

export async function getRemainingCredits(userId: string): Promise<number> {
  if (!userId) {
    console.error('No user ID provided for getting credits');
    return 0;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.credits ?? 0;
  } catch (error) {
    console.error('Error getting remaining credits:', error);
    return 0;
  }
}

export async function getCreditHistory(userId: string) {
  if (!userId) {
    console.error('No user ID provided for getting credit history');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('credits_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting credit history:', error);
    return [];
  }
}
