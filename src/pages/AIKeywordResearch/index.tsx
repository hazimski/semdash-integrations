import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIKeywordForm } from './AIKeywordForm';
import { WistiaVideoSection } from '../../components/shared/VideoSection';
import { compressParams } from '../../utils/urlCompression';
import { toast } from 'react-hot-toast';

export function AIKeywordResearch() {
  const navigate = useNavigate();

  const handleSearch = async (keywords: string[], location: string, language: string) => {
    try {
      const params = {
        keywords: JSON.stringify(keywords),
        location,
        language
      };
      
      const compressed = compressParams(params);
      navigate(`/ai-keyword-research/results/${compressed}`);
    } catch (error) {
      console.error('Error creating short URL:', error);
      toast.error('Failed to process request');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Bulk Keyword Research
          </h1>
          <p className="text-lg text-gray-600">
            Discover keywords with AI-powered suggestions
          </p>
        </div>

        <AIKeywordForm onSearch={handleSearch} />

    
      </div>
    </div>
  );
}