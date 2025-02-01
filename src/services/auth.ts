import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';

export async function resendActivationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resending activation email:', error);
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');

    return data.user;
  } catch (error) {
    console.error('Error during signup:', error);
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to sign in');

    return data.user;
  } catch (error) {
    console.error('Error during signin:', error);
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function logOut() {
  try {
    // Check if there's an active session first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // If no session exists, just clear any local state
      console.log('No active session found during logout');
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error during logout:', error);
    // Don't throw error for missing session, just log it
    if (error instanceof Error && error.message.includes('Auth session missing')) {
      console.log('No active session to log out from');
      return;
    }
    throw new Error('Failed to log out. Please try again.');
  }
}

export function getAuthErrorMessage(error: any): string {
  if (error?.message?.includes('Invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (error?.message?.includes('Email already registered')) {
    return 'An account with this email already exists. Please try logging in instead.';
  }
  if (error?.message?.includes('Password should be')) {
    return 'Password should be at least 6 characters long.';
  }
  if (error?.message?.includes('Invalid email')) {
    return 'Please enter a valid email address.';
  }
  return error?.message || 'An error occurred. Please try again.';
}