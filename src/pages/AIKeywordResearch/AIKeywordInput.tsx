import React, { useState, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { generateKeywords } from '../../services/aiKeywords';
import { getUserSettings } from '../../services/settings';
import { toast } from 'react-hot-toast';

interface AIKeywordInputProps {
  value: string;
  onChange: (value: string) => void;
  onApiKeyRequired: () => void;
}

const SUGGESTION_TYPES = [
  { id: 'technical', label: 'Technical and specialized terms', prefix: 'Suggest technical and specialized terms related to' },
  { id: 'challenges', label: 'Challenges or pain points', prefix: 'Suggest challenges or pain points related to' },
  { id: 'subtopics', label: 'Subtopics and niche areas', prefix: 'Suggest subtopics and niche areas related to' },
  { id: 'comparative', label: 'Comparative phrases', prefix: 'Suggest comparative phrases related to' },
  { id: 'emerging', label: 'Emerging trends', prefix: 'Suggest emerging trends related to' },
  { id: 'products', label: 'Products and tools', prefix: 'Suggest products and tools related to' },
  { id: 'historical', label: 'Historical concepts', prefix: 'Suggest historical concepts related to' },
  { id: 'future', label: 'Future-oriented keywords', prefix: 'Suggest future-oriented keywords related to' },
  { id: 'emotional', label: 'Emotional or psychological angle keywords', prefix: 'Suggest emotional or psychological angle keywords related to' },
  { id: 'cross-industry', label: 'Cross-industry keyword linkages', prefix: 'Suggest cross-industry keyword linkages related to' },
  { id: 'controversial', label: 'Controversial or debate keywords', prefix: 'Suggest controversial or debate keywords related to' },
  { id: 'myth-busting', label: 'Myth-busting keywords', prefix: 'Suggest myth-busting keywords related to' }
];

export function AIKeywordInput({ value, onChange, onApiKeyRequired }: AIKeywordInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateKeywords = (text: string): boolean => {
    const keywordCount = text.split('\n').filter(k => k.trim()).length;
    if (keywordCount > 500) {
      setError('Maximum 500 keywords allowed');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSuggestionClick = async (type: typeof SUGGESTION_TYPES[0]) => {
    setSelectedType(type.id);
    setIsDropdownOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedType && userInput) {
      e.preventDefault();

      try {
        setIsGenerating(true);
        const selectedTypeObj = SUGGESTION_TYPES.find(t => t.id === selectedType);
        if (!selectedTypeObj) return;

        const prompt = `${selectedTypeObj.prefix} ${userInput}`;
        const keywords = await generateKeywords(prompt);

        // Validate combined keywords
        const existingKeywords = value.split('\n').filter(k => k.trim());
        const newKeywords = keywords.split('\n').filter(k => k.trim());
        const totalKeywords = [...existingKeywords, ...newKeywords];
        
        if (totalKeywords.length > 500) {
          toast.error('Maximum 500 keywords allowed');
          return;
        }

        onChange([...existingKeywords, ...newKeywords].join('\n'));
        setSelectedType(null);
        setUserInput('');
      } catch (error) {
        if (error instanceof Error && error.message === 'API_KEY_REQUIRED') {
          onApiKeyRequired();
        } else {
          toast.error('Failed to generate keywords');
        }
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keywords (one per line)
          <span className="text-sm text-gray-500 ml-2">Max 500 keywords</span>
        </label>
        <textarea
          value={value}
          onChange={(e) => {
            if (validateKeywords(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          rows={5}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your keywords here, one per line"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
          {selectedType ? (
            <div className="flex-1 flex">
              <span className="text-gray-500">
                {SUGGESTION_TYPES.find(t => t.id === selectedType)?.prefix}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="flex-1 ml-2 bg-transparent border-none focus:outline-none"
                placeholder="enter your topic"
                disabled={isGenerating}
              />
            </div>
          ) : (
            <span>Ask AI to suggest seed keywords related to your topic...</span>
          )}
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="py-1">
              {SUGGESTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSuggestionClick(type)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="text-sm text-blue-600 animate-pulse">AI is working...</div>
          </div>
        )}
      </div>
    </div>
  );
}