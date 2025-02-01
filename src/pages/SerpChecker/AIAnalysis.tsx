import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getUserSettings } from '../../services/settings';

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

  useEffect(() => {
    if (isOpen && data) {
      generateAnalysis();
    }
  }, [isOpen, data]);

  const generateAnalysis = async () => {
    if (!data) return;

    try {
      setIsLoading(true);
      setMessageIndex(0);
      const settings = await getUserSettings();
      
      if (!settings?.openai_api_key) {
        throw new Error('OpenAI API key not found');
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
      toast.error('Failed to generate analysis');
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
          {isLoading ? (
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