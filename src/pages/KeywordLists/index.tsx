import React, { useState, useEffect } from 'react';
import { getKeywordLists, deleteKeywordList, KeywordList } from '../../services/keywordLists';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function KeywordLists() {
  const [lists, setLists] = useState<KeywordList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setIsLoading(true);
      const data = await getKeywordLists();
      setLists(data);
    } catch (error) {
      toast.error('Failed to load keyword lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      await deleteKeywordList(listId);
      toast.success('List deleted successfully');
      loadLists();
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Keyword Lists</h1>
        <Link
          to="/seed"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Keywords
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <div
            key={list.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{list.name}</h3>
                {list.description && (
                  <p className="mt-1 text-sm text-gray-500">{list.description}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  Created on {new Date(list.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(list.id)}
                className="p-2 text-gray-400 hover:text-red-500"
                title="Delete list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <Link
                to={`/keyword-lists/${list.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Keywords →
              </Link>
            </div>
          </div>
        ))}

        {lists.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No keyword lists yet.</p>
            <Link
              to="/seed"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add your first keywords
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
