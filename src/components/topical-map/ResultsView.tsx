import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TopicalMap } from '../../services/topicalMap';

interface ResultsViewProps {
  keyword: string;
  map: TopicalMap;
}

export function ResultsView({ keyword, map }: ResultsViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to="/topical-map"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
          <h1 className="mt-2 text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Topical Map for "{keyword}"
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore content opportunities and topic clusters for your keyword
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {map.categories.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              {category.pages.map((page, pageIndex) => (
                <div 
                  key={pageIndex}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-gray-900 font-medium">{page.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                      page.intent === 'informational' ? 'bg-blue-100 text-blue-800' :
                      page.intent === 'commercial' ? 'bg-green-100 text-green-800' :
                      page.intent === 'transactional' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {page.intent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}