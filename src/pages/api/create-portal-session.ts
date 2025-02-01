import { stripe } from '../../config/stripe';
import { supabase } from '../../config/supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!userData?.stripe_customer_id) {
      return res.status(400).json({ message: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ message: 'Error creating portal session' });
  }
}
