import { supabase } from '../config/supabase';

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(config: EmailConfig): Promise<boolean> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(config.to, {
      redirectTo: `${window.location.origin}/invite`,
      data: {
        subject: config.subject,
        customMessage: config.html
      }
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
