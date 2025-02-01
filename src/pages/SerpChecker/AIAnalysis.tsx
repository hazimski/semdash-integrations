import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getUserSettings } from '../../services/settings';
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
    const generateAnalysis = async () => {
      if (!data || !isOpen) return;

      try {
        setIsLoading(true);
        setMessageIndex(0);
        const settings = await getUserSettings();
        
        if (!settings?.openai_api_key) {
          toast.error('OpenAI API key required');
          onClose();
          return;
        }

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert SEO specialist tasked with analyzing the following SERP (Search Engine Results Page) data. Your goal is to provide a comprehensive, actionable analysis and a prioritized action plan for improving rankings and capitalizing on SERP opportunities.\n\n
User Intent Breakdown:\n
- Analyze the user intent for each result and categorize it as Information, Transactional, Navigational, or Commercial. Provide a percentage breakdown for each intent type across the SERP. Explain why you categorize a result as such, referencing the data (e.g., keywords, titles, meta descriptions, featured snippets, etc.).\n
- Provide examples for each intent type from the SERP results and explain your reasoning behind the categorization.\n\n
Actionable Insights:\n
- Based solely on the provided SERP data, outline specific, data-driven recommendations.\n
- Offer actionable SEO tips that are directly tied to the patterns or insights you derive from the SERP results.\n
- Ensure all recommendations are specific, not generalized. Avoid fluff—recommend practical, clear actions with detailed explanations.\n
- Reference why each tip is necessary and how it can help improve rankings.\n\n
Detailed Action Plan:\n
- Create a detailed and prioritized action plan, including the most impactful SEO strategies to implement based on the provided SERP data.\n
- Identify target keywords to pursue based on trends in titles, descriptions, and estimated traffic (etv).\n
- For each keyword:\n
  - Suggest content types to create (e.g., blogs, videos, product pages).\n
  - Recommend the number of backlinks to aim for, using competitor data (referring_main_domains, dofollow, backlinks) as benchmarks.\n
  - Provide examples of relevant publications or websites for link-building.\n
- Clearly articulate the reasoning behind each action, avoiding assumptions or speculative advice. Use data from the provided API response to inform every step.\n
- Focus on leverage points in the SERP (such as featured snippets, PAA boxes, local packs, etc.) and provide specific tactics to capitalize on those opportunities.\n\n
Examples and Specificity:\n
- Every insight and recommendation should be backed by specific examples from the data you are analyzing. For instance, if certain content types appear more frequently in the SERP, suggest strategies that align with those content types (e.g., long-form content, videos, product pages, etc.).\n
- Do not provide general SEO advice (e.g., “use better keywords” or “optimize meta descriptions”). Instead, reference exact data points from the SERP to justify each recommendation.\n\n
Priority and Impact:\n
- Prioritize the recommendations by expected impact on rankings. Which actions should be tackled first for the most significant effect?\n
- Be clear and methodical in how you present the data and your insights.\n
- Remember: Your analysis must strictly be based on the provided SERP data—do not make any assumptions or provide insights not directly derived from the data. Avoid unnecessary conjecture or irrelevant advice.`
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
        
        // Handle rate limit error
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

    generateAnalysis();
  }, [data, isOpen]);

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