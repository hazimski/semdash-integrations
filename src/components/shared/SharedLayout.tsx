import React from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../ThemeToggle';
import { Link } from 'react-router-dom';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center">
              <a href="https://seo.semdash.com" className="flex items-center">
                <img 
                  src="https://app.semdash.com/dist/img/SeoLogo.webp" 
                  alt="Semdash Logo" 
                  className="h-8 dark:invert"
                />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="https://seo.semdash.com/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="https://seo.semdash.com/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-[100rem] mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}