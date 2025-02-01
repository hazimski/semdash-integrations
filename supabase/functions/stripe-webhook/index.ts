import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@14.14.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { ...corsHeaders, 'Allow': 'POST' }
      }
    );
  }

  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }), 
      { 
        status: 400,
        headers: corsHeaders
      }
    );
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Received Stripe webhook event:', stripeEvent.type);

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout session:', session.id);
        
        // Get the price ID from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        // Map price IDs to plan names and credits
        const planMap: Record<string, { name: string, credits: number }> = {
          'price_1OZKn1IvZBeqKnwPvXPANgAM': { name: 'gold', credits: 10000 },
          'price_1OZKn1IvZBeqKnwPocMhmUvy': { name: 'diamond', credits: 100000 },
          'price_1OZKn1IvZBeqKnwP8YhajFGg': { name: 'elite', credits: 500000 }
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
          'price_1OZKn1IvZBeqKnwPvXPANgAM': { name: 'gold', credits: 10000 },
          'price_1OZKn1IvZBeqKnwPocMhmUvy': { name: 'diamond', credits: 100000 },
          'price_1OZKn1IvZBeqKnwP8YhajFGg': { name: 'elite', credits: 500000 }
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
        headers: corsHeaders
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
        headers: corsHeaders
      }
    );
  }
});
