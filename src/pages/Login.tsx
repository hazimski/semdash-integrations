import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { LogIn, ArrowRight, Lock, Mail, Chrome } from 'lucide-react';
import { supabase } from '../config/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/overview`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      toast.error('Failed to sign in with Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/overview');
    } catch (error) {
      toast.error('Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        {/* Centered Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to access your SEO dashboard
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <Chrome className="w-5 h-5 mr-2" />
              {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            <div className="text-center">
              <Link 
                to="/signup" 
                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                New to SemDash? Create an account
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
