import React from 'react';
import { formatNumber } from '../../utils/format';
import { getDifficultyColor } from '../../utils/difficulty';

interface DifficultyCardProps {
  difficulty: number;
  referringDomains: number;
  backlinks: number;
  mainDomainRanking: number;
}

export function DifficultyCard({ 
  difficulty, 
  referringDomains,
  backlinks,
  mainDomainRanking 
}: DifficultyCardProps) {
  const difficultyLevel = 
    difficulty <= 25 ? 'Easy' :
    difficulty <= 50 ? 'Moderate' :
    difficulty <= 75 ? 'Hard' : 'Super hard';

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-6 flex-none">
        <h3 className="text-lg font-semibold text-gray-900">Keyword Difficulty</h3>
      </div>

      <div className="flex-1 min-h-0 p-6 pt-0 flex flex-col justify-between">
        <div className="relative flex justify-center">
          <div className="relative">
            <svg className="w-32 h-32">
              <circle
                className="text-gray-200"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              <circle
                className="text-blue-600"
                strokeWidth="12"
                strokeDasharray={360}
                strokeDashoffset={360 - (360 * difficulty) / 100}
                strokeLinecap="round"
                stroke={getDifficultyColor(difficulty)}
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition: 'stroke-dashoffset 1s ease-in-out'
                }}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-bold">{Math.round(difficulty)}</div>
              <div className="text-sm text-gray-500">out of 100</div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-semibold" style={{ color: getDifficultyColor(difficulty) }}>
            {difficultyLevel}
          </p>
        </div>

        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>~{formatNumber(referringDomains)} ref.domains to rank in top 10</span>
          </div>
          <div className="flex justify-between">
            <span>~{formatNumber(backlinks)} backlinks to rank in top 10</span>
          </div>
          <div className="flex justify-between">
            <span>~{formatNumber(mainDomainRanking)} main domain ranking to rank in top 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
