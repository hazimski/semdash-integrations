import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';

interface KeywordInputProps {
  keywords: string;
  onChange: (keywords: string) => void;
  onImportCSV: (keywords: string[]) => void;
}

export function KeywordInput({ keywords, onChange, onImportCSV }: KeywordInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const keywords = results.data
          .flat()
          .filter(Boolean)
          .map(k => k.toString().trim());

        if (keywords.length > 200) {
          setError('Maximum 200 keywords allowed');
          return;
        }

        onImportCSV(keywords);
        setError(null);
      },
      error: () => {
        setError('Failed to parse CSV file');
      }
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n').filter(Boolean);
    if (lines.length > 200) {
      setError('Maximum 200 keywords allowed');
      return;
    }
    onChange(e.target.value);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Keywords (one per line, max 200)
        </label>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
        >
          <Upload className="w-4 h-4 mr-1" />
          Import CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <textarea
        value={keywords}
        onChange={handleTextChange}
        rows={10}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700"
        placeholder="Enter your keywords here, one per line..."
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}