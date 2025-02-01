import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../hooks/useCredits';

export function AccountInfo() {
  const { user } = useAuth();
  const { credits } = useCredits();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Account Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user?.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Available Credits</label>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{credits}</p>
        </div>
      </div>
    </div>
  );
}