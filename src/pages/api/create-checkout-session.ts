import { stripe } from '../../config/stripe';
import { supabase } from '../../config/supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, userEmail } = req.body;

    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get or create Stripe customer
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.VITE_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.VITE_APP_URL}/subscription?canceled=true`,
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session URL');
    }

    return res.status(200).json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
}
