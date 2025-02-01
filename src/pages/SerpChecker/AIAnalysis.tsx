import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getUserSettings, updateOpenAIKey } from '../../services/settings';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AIAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const loadingMessages = [
  "Analyzing SERP data...",
  "Identifying ranking patterns...",
  "Evaluating domain authority...",
  "Examining content quality...",
  "Assessing competitive landscape...",
  "Generating optimization insights..."
];

export function AIAnalysis({ isOpen, onClose, data }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
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

  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    
    if (isLoading) {
      messageInterval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
    }

    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [isLoading]);

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
      generateAnalysis();
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  useEffect(() => {
    if (isOpen && data && !hasApiKey) {
      setShowApiKeyDialog(true);
    } else if (isOpen && data && hasApiKey && !analysis) {
      generateAnalysis();
    }
  }, [isOpen, data, hasApiKey]);

  const generateAnalysis = async () => {
    if (!data) return;

    try {
      setIsLoading(true);
      setMessageIndex(0);
      const settings = await getUserSettings();
      
      if (!settings?.openai_api_key) {
        setShowApiKeyDialog(true);
        return;
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert SEO specialist tasked with analyzing the following SERP (Search Engine Results Page) data...`
            },
            {
              role: 'user',
              content: JSON.stringify(data, null, 2)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.openai_api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) throw new Error('No analysis generated');
      
      setAnalysis(content);
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      
      if (error.response?.data?.error?.code === 'rate_limit_exceeded') {
        toast.error(error.response.data.error.message);
      } else {
        toast.error('Failed to generate analysis');
      }
      
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {showApiKeyDialog ? (
            <div className="bg-white p-6 rounded-lg">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  OpenAI API Key Required
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  To use AI Analysis, you need to provide your OpenAI API key. This key will be securely stored and used only for generating SEO recommendations.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
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
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-32 h-32">
                <DotLottieReact
                  src="https://lottie.host/91de797c-01f7-4577-9266-f47e331a0374/EPunSeZM1k.lottie"
                  loop
                  autoplay
                />
              </div>
              <p className="text-gray-600 text-center animate-pulse">
                {loadingMessages[messageIndex]}
              </p>
            </div>
          ) : (
            <div className="prose prose-blue max-w-none">
              {analysis.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}