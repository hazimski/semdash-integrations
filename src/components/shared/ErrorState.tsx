import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  suggestions?: string[];
}

export function ErrorState({ 
  title = 'Nothing found',
  message = 'This could be because:',
  suggestions = [
    'Your filters are too specific. Broaden your search criteria',
    'The domain name was mistyped or doesn\'t exist. Double-check its spelling.',
    'This is a new website or page, and we haven’t crawled it yet. Please come back later.'
  ]
}: ErrorStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700" style={{ boxShadow: 'var(--intergalactic-box-shadow-card, 0px 0px 1px 0px rgba(25, 27, 35, 0.16), 0px 1px 2px 0px rgba(25, 27, 35, 0.12))' }}>
      <div className="flex justify-center mb-6">
        {/* Removed background from this div */}
        <div className="rounded-full p-4">
          {/* Image size updated to w-16 h-16, no background */}
          <img src="https://app.semdash.com/dist/img/NothingFound.svg" alt="Nothing Found" className="w-16 h-16" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h2>
      {message && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
      )}
      {suggestions && suggestions.length > 0 && (
        <ul className="text-left space-y-2 max-w-lg mx-auto">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index}
              className="flex items-start text-gray-600 dark:text-gray-400"
            >
              <span className="mr-2">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
