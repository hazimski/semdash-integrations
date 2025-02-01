import React from 'react';
import { Copy, Share2, Menu, Key } from 'lucide-react';

interface CopilotHeaderProps {
  hasApiKey: boolean;
  hasStrategy: boolean;
  isExpanded: boolean;
  onApiKeyClick: () => void;
  onCopy: () => void;
  onShare: () => void;
  onToggleExpand: () => void;
}

export function CopilotHeader({
  hasApiKey,
  hasStrategy,
  isExpanded,
  onApiKeyClick,
  onCopy,
  onShare,
  onToggleExpand
}: CopilotHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          CopilotAI
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          — your personal recommendations
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {!hasApiKey && (
          <button
            onClick={onApiKeyClick}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Set API Key"
          >
            <Key className="w-5 h-5" />
          </button>
        )}
        {hasStrategy && (
          <>
            <button
              onClick={onCopy}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Copy all"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={onShare}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Share Copilot"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </>
        )}
        <button
          onClick={onToggleExpand}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}