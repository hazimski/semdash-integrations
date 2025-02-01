import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  try {
    const buf = await buffer(req);
    const stripeEvent = stripe.webhooks.constructEvent(
      buf,
      sig,
      webhookSecret
    );

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        // Get the price ID from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        // Map price IDs to plan names
        const planMap: Record<string, { name: string, credits: number }> = {
          'price_gold': { name: 'gold', credits: 10000 },
          'price_diamond': { name: 'diamond', credits: 100000 },
          'price_elite': { name: 'elite', credits: 500000 }
        };

        const plan = planMap[priceId || ''] || { name: 'free', credits: 1000 };

        // Update user's subscription status in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_customer_id: session.customer as string,
            subscription_status: 'active',
            plan: plan.name,
            credits: plan.credits,
            subscription_updated_at: new Date().toISOString()
          })
          .eq('email', session.customer_email);

        if (updateError) {
          console.error('Error updating user:', updateError);
          return res.status(500).json({ error: 'Failed to update user subscription' });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        
        // Update user's subscription status to inactive
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: 'inactive',
            plan: 'free',
            credits: 1000,
            subscription_updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer as string);

        if (updateError) {
          console.error('Error updating user:', updateError);
          return res.status(500).json({ error: 'Failed to update user subscription' });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;

        // Map price IDs to plan names
        const planMap: Record<string, { name: string, credits: number }> = {
          'price_gold': { name: 'gold', credits: 10000 },
          'price_diamond': { name: 'diamond', credits: 100000 },
          'price_elite': { name: 'elite', credits: 500000 }
        };

        const plan = planMap[priceId || ''] || { name: 'free', credits: 1000 };

        // Update user's subscription details
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
            plan: plan.name,
            credits: plan.credits,
            subscription_updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer as string);

        if (updateError) {
          console.error('Error updating user:', updateError);
          return res.status(500).json({ error: 'Failed to update user subscription' });
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return res.status(400).json({
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
