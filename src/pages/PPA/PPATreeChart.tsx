import React, { useState } from 'react';
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

interface ExpandedElement {
  description: string;
  url: string;
  title: string;
  domain: string;
}

interface PPAItem {
  title: string;
  seed_question: string | null;
  expanded_element: ExpandedElement[];
}

interface PPATreeChartProps {
  data: PPAItem[];
  rootKeyword: string;
  isLoading: boolean;
  error: string | null;
}

export function PPATreeChart({ data, rootKeyword, isLoading, error }: PPATreeChartProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Separate items into levels
  const level1Items = data.filter(item => !item.seed_question);
  const level2Items = data.filter(item => item.seed_question);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const NodeContent = ({ 
    title, 
    description,
    url,
    domain,
    level,
    hasChildren = false,
    isExpanded = false,
    onToggle
  }: { 
    title: string; 
    description?: string;
    url?: string;
    domain?: string;
    level: number;
    hasChildren?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
  }) => (
    <div 
      className={`
        relative pl-8 pr-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer
        ${level === 1 ? 'ml-8' : level === 2 ? 'ml-16' : ''}
      `}
      onClick={onToggle}
    >
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
      
      <div className="flex items-start space-x-3">
        {hasChildren && (
          <div className="mt-1 p-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          {(isExpanded || !hasChildren) && description && (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">{description}</p>
              {url && domain && (
                <a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  {domain}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Root keyword */}
      <div className="p-4 border-b border-gray-200">
        <NodeContent 
          title={rootKeyword}
          level={0}
          hasChildren={level1Items.length > 0}
          isExpanded={true}
        />
      </div>

      <div className="divide-y divide-gray-100">
        {/* Level 1 items */}
        {level1Items.map((item, index) => {
          const nodeId = `level1-${index}`;
          const isExpanded = expandedNodes[nodeId];
          const relatedLevel2Items = level2Items.filter(
            l2 => l2.seed_question === item.title
          );
          
          return (
            <div key={nodeId}>
              <NodeContent 
                title={item.title}
                description={item.expanded_element[0]?.description}
                url={item.expanded_element[0]?.url}
                domain={item.expanded_element[0]?.domain}
                level={1}
                hasChildren={relatedLevel2Items.length > 0}
                isExpanded={isExpanded}
                onToggle={() => toggleNode(nodeId)}
              />

              {/* Level 2 items */}
              {isExpanded && relatedLevel2Items.map((l2Item, l2Index) => (
                <NodeContent 
                  key={`${nodeId}-${l2Index}`}
                  title={l2Item.title}
                  description={l2Item.expanded_element[0]?.description}
                  url={l2Item.expanded_element[0]?.url}
                  domain={l2Item.expanded_element[0]?.domain}
                  level={2}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
