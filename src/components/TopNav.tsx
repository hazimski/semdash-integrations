import React, { useState } from 'react';
import { Search, CreditCard, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '../hooks/useCredits';
import { MobileSidebar } from './MobileSidebar';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function TopNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { credits } = useCredits();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const searchParams = new URLSearchParams({
      keyword: searchTerm.trim(),
      location: '2840', // Default to US
      language: 'en'    // Default to English
    });
    navigate(`/keyword-overview/results?${searchParams.toString()}`);
  };

  return (
    <>
      <nav className="bg-[#f9fafb] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16">
        <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="sm:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search form - responsive design */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[500px] mx-4">
            <div className="flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter keyword"
                className="w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 bg-[#4193f0] text-white font-medium rounded-r-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm whitespace-nowrap"
              >
                <Search className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <CreditCard className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{credits} credits</span>
              <span className="sm:hidden">{credits}</span>
            </div>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}