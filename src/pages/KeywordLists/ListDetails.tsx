import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { KeywordListHeader } from '../../components/keywords/KeywordListHeader';
import { KeywordListTable } from '../../components/keywords/KeywordListTable';
import { getKeywordsInList, deleteKeywordsFromList } from '../../services/keywordLists';
import type { ListKeyword } from '../../services/keywordLists';

export function ListDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState<ListKeyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadKeywords();
  }, [id]);

  const loadKeywords = async () => {
    try {
      setIsLoading(true);
      const data = await getKeywordsInList(id!);
      setKeywords(data);
    } catch (error) {
      toast.error('Failed to load keywords');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!keywords.length) return;

    const headers = [
      'Keyword',
      'Volume',
      'CPC',
      'Difficulty',
      'Intent',
      'Source',
      'Language',
      'Location'
    ];

    const csvData = [
      headers.join(','),
      ...keywords.map(kw => [
        kw.keyword,
        kw.search_volume,
        kw.cpc,
        kw.keyword_difficulty,
        kw.intent,
        kw.source,
        kw.language,
        kw.location
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'keyword_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!id || !selectedKeywords.size) return;

    try {
      await deleteKeywordsFromList(id, Array.from(selectedKeywords));
      toast.success('Keywords deleted successfully');
      setSelectedKeywords(new Set());
      loadKeywords();
    } catch (error) {
      toast.error('Failed to delete keywords');
    }
  };

  const handleCluster = () => {
    const keywordStrings = keywords.map(k => k.keyword);
    const searchParams = new URLSearchParams({
      keywords: JSON.stringify(keywordStrings),
      type: 'semantic'
    });
    navigate(`/keyword-clustering/results?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          to="/keyword-lists"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCluster}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <Layers className="w-4 h-4 mr-2" />
            Cluster Keywords
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          {selectedKeywords.size > 0 && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedKeywords.size})
            </button>
          )}
        </div>
      </div>

      <KeywordListTable
        keywords={keywords}
        selectedKeywords={selectedKeywords}
        onSelectionChange={setSelectedKeywords}
      />
    </div>
  );
}