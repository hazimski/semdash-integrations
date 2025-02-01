import React from 'react';
import type { ClusteringType } from '../../services/keywordClustering';

interface ClusteringTypeSelectProps {
  value: ClusteringType;
  onChange: (type: ClusteringType) => void;
}

export function ClusteringTypeSelect({ value, onChange }: ClusteringTypeSelectProps) {
  const types: { value: ClusteringType; label: string; description: string }[] = [
    {
      value: 'semantic',
      label: 'Semantic',
      description: 'Group keywords by meaning and search intent'
    },
    {
      value: 'modifier',
      label: 'Modifier',
      description: 'Group by qualifiers like "best", "how to", etc.'
    },
    {
      value: 'topic',
      label: 'Topic',
      description: 'Group by specific subject matter or subtopic'
    },
    {
      value: 'theme',
      label: 'Theme',
      description: 'Group into broad thematic categories'
    }
  ];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Clustering Type
      </label>
      <div className="grid grid-cols-2 gap-4">
        {types.map(type => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              value === type.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
            }`}
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {type.label}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {type.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}