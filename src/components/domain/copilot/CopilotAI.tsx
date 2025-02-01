import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { generateSEOStrategy } from '../../../services/openai';
import { getUserSettings, updateOpenAIKey } from '../../../services/settings';
import { ApiKeyDialog } from './ApiKeyDialog';
import { CopilotHeader } from './CopilotHeader';
import { CopilotContent } from './CopilotContent';

interface CopilotAIProps {
  domain: string;
  data: any;
  isLoading?: boolean;
}

export function CopilotAI({ domain, data, isLoading }: CopilotAIProps) {
  const [strategy, setStrategy] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
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
      <CopilotHeader
        hasApiKey={hasApiKey}
        hasStrategy={!!strategy}
        isExpanded={isExpanded}
        onApiKeyClick={() => setShowApiKeyDialog(true)}
        onCopy={handleCopy}
        onShare={handleShare}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <div className="p-6">
          <CopilotContent
            strategy={strategy}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>
      )}

      {showApiKeyDialog && (
        <ApiKeyDialog
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiKeyDialog(false)}
        />
      )}
    </div>
  );
}