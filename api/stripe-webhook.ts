import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET');
}

if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  runtime: 'edge'
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body = await req.text();
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Received Stripe webhook event:', stripeEvent.type);

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout session:', session.id);
        
        // Get the price ID from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        // Map price IDs to plan names
        const planMap: Record<string, { name: string, credits: number }> = {
          'prod_RfhyCZLmsj2qYy': { name: 'basic', credits: 2000 },
          'prod_RfhzALijEpI4XT': { name: 'pro', credits: 4000 },
          'prod_RfhzOpGhXNWWCq': { name: 'premium', credits: 5000 }
        };

        const plan = planMap[priceId || ''] || { name: 'free', credits: 1000 };
        console.log('Selected plan:', plan);

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
          throw new Error('Failed to update user subscription');
        }

        console.log('Successfully updated user subscription');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        console.log('Processing subscription deletion:', subscription.id);
        
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
          throw new Error('Failed to update user subscription');
        }

        console.log('Successfully deactivated subscription');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        console.log('Processing subscription update:', subscription.id);
        
        const priceId = subscription.items.data[0]?.price.id;

        // Map price IDs to plan names
        const planMap: Record<string, { name: string, credits: number }> = {
          'price_1OqXXXXXXXXXXXXX': { name: 'basic', credits: 2000 },
          'price_2OqXXXXXXXXXXXXX': { name: 'pro', credits: 4000 },
          'price_3OqXXXXXXXXXXXXX': { name: 'premium', credits: 5000 }
        };

        const plan = planMap[priceId || ''] || { name: 'free', credits: 1000 };
        console.log('Updated plan:', plan);

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
          throw new Error('Failed to update user subscription');
        }

        console.log('Successfully updated subscription');
        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error'
      }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
