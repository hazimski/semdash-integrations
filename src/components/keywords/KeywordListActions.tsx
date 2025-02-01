import React, { useState, useEffect } from 'react';
import { ListPlus } from 'lucide-react';
import { createKeywordList, addKeywordsToList, getKeywordLists, KeywordList } from '../../services/keywordLists';
import { toast } from 'react-hot-toast';

interface KeywordListActionsProps {
  selectedKeywords: Set<string>;
  onClearSelection: () => void;
  locationName: string;
  languageName: string;
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    cpc: number;
    keywordDifficulty: number;
    intent: string;
  }>;
}

export function KeywordListActions({ 
  selectedKeywords,
  onClearSelection,
  locationName,
  languageName,
  keywords
}: KeywordListActionsProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [existingLists, setExistingLists] = useState<KeywordList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isSavingToExisting, setIsSavingToExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadExistingLists();
  }, []);

  const loadExistingLists = async () => {
    try {
      const lists = await getKeywordLists();
      setExistingLists(lists);
    } catch (error) {
      // Error is already logged in the service
      // No need to show error toast since this is not a critical failure
    }
  };

  const handleSaveToList = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let listId = selectedListId;

      if (!isSavingToExisting) {
        if (!newListName) {
          toast.error('Please enter a list name');
          return;
        }

        const list = await createKeywordList(newListName, newListDescription);
        listId = list.id;
      } else if (!listId) {
        toast.error('Please select a list');
        return;
      }

      const selectedKeywordData = keywords
        .filter(k => selectedKeywords.has(k.keyword))
        .map(k => ({
          keyword: k.keyword,
          search_volume: k.searchVolume,
          cpc: k.cpc,
          competition: 0,
          keyword_difficulty: k.keywordDifficulty,
          intent: k.intent,
          source: 'AI Research',
          language: languageName,
          location: locationName
        }));

      await addKeywordsToList(listId, selectedKeywordData);

      toast.success('Keywords saved to list successfully');
      setShowSaveDialog(false);
      setNewListName('');
      setNewListDescription('');
      setSelectedListId('');
      onClearSelection();
      setIsSavingToExisting(false);
    } catch (error) {
      console.error('Error saving keywords:', error);
      toast.error('Failed to save keywords to list');
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedKeywords.size === 0) return null;

  return (
    <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-700">
          {selectedKeywords.size} keywords selected
        </span>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <ListPlus className="w-4 h-4 mr-2" />
          Save to List
        </button>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Keywords to List</h3>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsSavingToExisting(false)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                    !isSavingToExisting 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  New List
                </button>
                <button
                  onClick={() => setIsSavingToExisting(true)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg ${
                    isSavingToExisting 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Existing List
                </button>
              </div>

              {isSavingToExisting ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select List</label>
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a list...</option>
                    {existingLists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">List Name</label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter list name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter list description"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveToList}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Keywords'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
