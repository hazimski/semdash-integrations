import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';
import { PricingTable } from './PricingTable';

export function Subscription() {
  const { user } = useAuth();
  const { credits } = useCredits();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Subscription</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your subscription and credits
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Current Plan</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Credits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{credits}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Plan</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Free Plan</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your account is credited with 1,000 credits every month on the free plan.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upgrade Your Plan</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get more credits and unlock advanced features
          </p>
        </div>

        <PricingTable userEmail={user?.email} />
      </div>
    </div>
  );
}
