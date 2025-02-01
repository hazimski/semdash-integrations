import React from "react";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";

interface PricingTableProps {
  userEmail?: string | null;
}

const plans = [
  {
    name: "Basic",
    price: "$1",
    credits: "2,000",
    features: [
      "2,000 monthly credits",
      "Basic support",
      "API access",
      "Standard analytics",
      "Email support",
    ],
    priceId: "prod_RfhyCZLmsj2qYy",
    popular: false,
  },
  {
    name: "Pro",
    price: "$2",
    credits: "4,000",
    features: [
      "4,000 monthly credits",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Priority email support",
    ],
    priceId: "prod_RfhzALijEpI4XT",
    popular: true,
  },
  {
    name: "Premium",
    price: "$3",
    credits: "5,000",
    features: [
      "5,000 monthly credits",
      "Premium support",
      "Advanced analytics",
      "API access",
      "24/7 email support",
    ],
    priceId: "prod_RfhzOpGhXNWWCq",
    popular: false,
  },
];

export function PricingTable({ userEmail }: PricingTableProps) {
  const { user } = useAuth();

  const handleSubscribe = async (plan: (typeof plans)[0]) => {
    try {
      if (!user) {
        toast.error('Please log in to subscribe');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          userId: user.id,
          userEmail: userEmail
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout process');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${
            plan.popular ? "ring-2 ring-blue-500 scale-105 z-10" : ""
          }`}
        >
          {plan.popular && (
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
              Most Popular
            </div>
          )}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {plan.name}
            </h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {plan.price}
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                /month
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {plan.credits} credits per month
            </p>

            <ul className="mt-6 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              className={`mt-8 w-full py-3 px-4 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                plan.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              Subscribe Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
