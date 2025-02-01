import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { acceptInvite } from '../services/team';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export function InviteAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: `/invite?token=${token}` } });
      return;
    }

    async function handleAcceptInvite() {
      try {
        const success = await acceptInvite(token);
        if (success) {
          toast.success('Successfully joined team');
          navigate('/settings');
        } else {
          setError('Invalid or expired invitation');
        }
      } catch (err) {
        console.error('Error accepting invite:', err);
        setError('Failed to accept invitation');
      } finally {
        setLoading(false);
      }
    }

    handleAcceptInvite();
  }, [searchParams, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
