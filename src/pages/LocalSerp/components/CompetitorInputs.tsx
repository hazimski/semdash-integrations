import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { MAX_COMPETITORS } from '../constants';

interface CompetitorInputsProps {
  competitors: string[];
  onCompetitorChange: (index: number, value: string) => void;
  onAddCompetitor: () => void;
  onRemoveCompetitor: (index: number) => void;
}

export function CompetitorInputs({
  competitors,
  onCompetitorChange,
  onAddCompetitor,
  onRemoveCompetitor
}: CompetitorInputsProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Competitor Domains (Optional)
        </label>
        {competitors.length < MAX_COMPETITORS && (
          <button
            type="button"
            onClick={onAddCompetitor}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Competitor
          </button>
        )}
      </div>
      {competitors.map((competitor, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={competitor}
            onChange={(e) => onCompetitorChange(index, e.target.value)}
            placeholder={`Competitor ${index + 1}`}
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => onRemoveCompetitor(index)}
            className="text-red-600 hover:text-red-800 p-2"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}