import React from 'react';

interface CopilotContentProps {
  strategy: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function CopilotContent({ strategy, isGenerating, onGenerate }: CopilotContentProps) {
  if (!strategy && !isGenerating) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate personalized SEO recommendations based on your domain analysis
        </p>
        <button
          onClick={onGenerate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Strategy
        </button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-gray-600 dark:text-gray-400">
          Generating recommendations...
        </span>
      </div>
    );
  }

  if (strategy) {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap">{strategy}</div>
      </div>
    );
  }

  return null;
}