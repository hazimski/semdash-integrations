import React from 'react';
import { Key } from 'lucide-react';

interface OpenAIKeySectionProps {
  openAIKey: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function OpenAIKeySection({ openAIKey, onChange, onSave, isSaving }: OpenAIKeySectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">OpenAI API Key</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="password"
              value={openAIKey}
              onChange={(e) => onChange(e.target.value)}
              placeholder="sk-..."
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your OpenAI API key will be used for CopilotAI features
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save API Key'}
        </button>
      </div>
    </div>
  );
}