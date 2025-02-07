
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AccountInfo } from '../components/settings/AccountInfo';
import { OpenAIKeySection } from '../components/settings/OpenAIKeySection';
import { PasswordUpdateSection } from '../components/settings/PasswordUpdateSection';
import { getUserSettings, updateOpenAIKey } from '../services/settings';
import { PricingTable } from './Subscription/PricingTable';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [openAIKey, setOpenAIKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      if (settings) {
        setOpenAIKey(settings.openai_api_key || '');
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOpenAIKey = async () => {
    setIsSaving(true);
    try {
      await updateOpenAIKey(openAIKey);
      toast.success('OpenAI API key updated successfully');
    } catch (error) {
      toast.error('Failed to update OpenAI API key');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8">
        <AccountInfo />
        
        <PasswordUpdateSection />
        
        <OpenAIKeySection 
          openAIKey={openAIKey}
          onChange={setOpenAIKey}
          onSave={handleSaveOpenAIKey}
          isSaving={isSaving}
        />

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upgrade Your Plan</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Get more credits and unlock advanced features
            </p>
          </div>
          <PricingTable userEmail={user?.email} />
        </div>
      </div>
    </div>
  );
}
