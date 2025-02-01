import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getRemainingCredits, deductCredits } from '../services/credits';
import { toast } from 'react-hot-toast';

interface CreditsContextType {
  credits: number;
  isLoading: boolean;
  checkCredits: (amount: number) => Promise<boolean>;
  deductUserCredits: (amount: number, action: string) => Promise<boolean>;
  refreshCredits: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(0);
      setIsLoading(false);
      return;
    }

    try {
      const remainingCredits = await getRemainingCredits(user.id);
      setCredits(remainingCredits);
    } catch (error) {
      console.error('Error loading credits:', error);
      setCredits(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits, session]);

  const checkCredits = async (amount: number): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Please log in to continue');
      navigate('/login');
      return false;
    }

    try {
      const currentCredits = await getRemainingCredits(user.id);
      if (currentCredits < amount) {
        toast.error('Insufficient credits. Please upgrade your plan.');
        navigate('/settings');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking credits:', error);
      toast.error('Error checking credits. Please try again.');
      return false;
    }
  };

  const deductUserCredits = async (amount: number, action: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const success = await deductCredits(user.id, amount, action);
      if (success) {
        await refreshCredits();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  };

  const value = {
    credits,
    isLoading,
    checkCredits,
    deductUserCredits,
    refreshCredits
  };

  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}
