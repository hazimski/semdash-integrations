import React from 'react';
import { ListKeyword } from '../../services/keywordLists';
import { formatNumber, formatCurrency } from '../../utils/format';
import { getDifficultyColor } from '../../utils/difficulty';

interface KeywordListTableProps {
  keywords: ListKeyword[];
  selectedKeywords: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

export function KeywordListTable({ 
  keywords, 
  selectedKeywords, 
  onSelectionChange 
}: KeywordListTableProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-gray-50 w-8 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedKeywords.size === keywords.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange(new Set(keywords.map(k => k.id)));
                    } else {
                      onSelectionChange(new Set());
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" className="sticky left-[56px] z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPC
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Language
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword) => (
              <tr key={keyword.id} className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white w-8 px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedKeywords.has(keyword.id)}
                    onChange={() => {
                      const newSelected = new Set(selectedKeywords);
                      if (newSelected.has(keyword.id)) {
                        newSelected.delete(keyword.id);
                      } else {
                        newSelected.add(keyword.id);
                      }
                      onSelectionChange(newSelected);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="sticky left-[56px] z-10 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(keyword.search_volume)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(keyword.cpc)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>{keyword.keyword_difficulty}</span>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getDifficultyColor(keyword.keyword_difficulty) }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg capitalize ${
                    keyword.intent === 'informational' ? 'bg-blue-100 text-blue-800' :
                    keyword.intent === 'commercial' ? 'bg-purple-100 text-purple-800' :
                    keyword.intent === 'navigational' ? 'bg-green-100 text-green-800' :
                    keyword.intent === 'transactional' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {keyword.intent}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.language}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {keyword.location}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
