import React, { useState, useEffect } from 'react';
import { Copy, Share2, X, Menu, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateSEOStrategy } from '../../services/openai';
import { getUserSettings, updateOpenAIKey } from '../../services/settings';

interface CopilotAIProps {
  domain: string;
  data: any;
  isLoading?: boolean;
}

export function CopilotAI({ domain, data, isLoading }: CopilotAIProps) {
  const [strategy, setStrategy] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      setHasApiKey(!!settings?.openai_api_key);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.startsWith('sk-')) {
      toast.error('Invalid API key format. It should start with "sk-"');
      return;
    }

    try {
      await updateOpenAIKey(apiKey);
      setHasApiKey(true);
      setShowApiKeyDialog(false);
      toast.success('API key saved successfully');
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSEOStrategy(domain, data);
      setStrategy(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('API key')) {
        setHasApiKey(false);
        setShowApiKeyDialog(true);
      }
      toast.error('Failed to generate SEO strategy');
    } finally {
      setIsGenerating(false);
      setLoadingMessageIndex(0);
    }
  };

  const handleCopy = async () => {
    if (!strategy) return;
    try {
      await navigator.clipboard.writeText(strategy);
      toast.success('Strategy copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy strategy');
    }
  };

  const handleShare = () => {
    toast.success('Share feature coming soon');
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
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
              onClick={() => setShowApiKeyDialog(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Set API Key"
            >
              <Key className="w-5 h-5" />
            </button>
          )}
          {strategy && (
            <>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Copy all"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Share Copilot"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          {!strategy && !isGenerating && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate personalized SEO recommendations based on your domain analysis
              </p>
              <button
                onClick={handleGenerate}
                  className="px-4 py-2 bg-[#009f81] text-white rounded-lg hover:bg-[#007C65] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Generate Strategy
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Generating recommendations...
              </span>
            </div>
          )}

          {strategy && !isGenerating && (
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{strategy}</div>
            </div>
          )}
        </div>
      )}

      {/* API Key Dialog */}
      {showApiKeyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                OpenAI API Key Required
              </h3>
              <button
                onClick={() => setShowApiKeyDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              To use CopilotAI, you need to provide your OpenAI API key. This key will be securely stored and used only for generating SEO recommendations.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApiKeyDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
