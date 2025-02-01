import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export function ShareEarn() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const fetchReferralCode = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching referral code:', error);
      toast.error('Failed to load referral link');
      return;
    }

    setReferralCode(data.referral_code);
  };

  const handleShare = () => {
    setShowModal(true);
    fetchReferralCode();
  };

  const getReferralLink = () => {
    return `${window.location.origin}/signup?ref=${referralCode}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      toast.success('Referral link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Share2 className="w-5 h-5 mr-3" />
        Share & Earn
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Share & Earn Credits
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Share your referral link with friends. When they sign up, you both get 1,000 extra credits!
            </p>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={getReferralLink()}
                  readOnly
                  className="w-full pr-20 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
