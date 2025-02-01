import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const loadingMessages = [
  "Analyzing your topic...",
  "Mapping content relationships...",
  "Identifying key categories...",
  "Determining search intent...",
  "Organizing topic clusters...",
  "Calculating content relevance...",
  "Building your topical map..."
];

export function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-lg">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg text-gray-700 font-medium animate-pulse">
          {loadingMessages[messageIndex]}
        </p>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 h-32 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}