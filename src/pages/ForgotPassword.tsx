import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../config/supabase';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isSubmitted 
                ? "Check your email for reset instructions" 
                : "Enter your email to receive reset instructions"}
            </p>
          </div>

          {!isSubmitted ? (
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  We've sent password reset instructions to {email}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/login"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help? Contact our support team at{' '}
            <a 
              href="mailto:support@semdash.com" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@semdash.com
            </a>
          </p>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
