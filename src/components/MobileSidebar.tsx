import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X,Map, Boxes, Home, Network, Link2, Search, Layers, BarChart2, Users, FileText, KeySquare, Sprout, Link as LinkIcon, History, Settings, LogOut, HelpCircle, Share, List, CreditCard, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { useQuery } from '@tanstack/react-query';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Query to check if user has valid Google Search Console token
  const { data: userSettings } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('google_access_token, google_token_expiry')
        .single();
      return settings;
    }
  });

  const handleGoogleSearchConsoleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (userSettings?.google_access_token && new Date(userSettings.google_token_expiry) > new Date()) {
      navigate('/google-search-console/domains');
    } else {
      navigate('/google-search-console');
    }
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sections = [
    {
      title: 'Competitve Research',
      items: [
        { icon: Home, label: 'Domain Overview', path: '/overview' },
        { icon: Users, label: 'Keyword Gap', path: '/keyword-gap' },
        { icon: LinkIcon, label: 'Backlink Gap', path: '/backlink-gap' },
        { icon: Share, label: 'Traffic Share', path: '/traffic-share' },
        { icon: Users, label: 'Competitor Domains', path: '/competitor-analysis' },
        { icon: FileText, label: 'Top Pages', path: '/pages' },
      ]
    },
    {
      title: 'SERP CHECKER',
      items: [
        { icon: History, label: 'Historical SERP', path: '/serp-checker' },
        { icon: MapPin, label: 'Local SERP', path: '/local-serp' }
      ]
    },
    {
      title: 'KEYWORD Research',
      items: [
        { icon: Search, label: 'Keyword Overview', path: '/keyword-overview' },
        { icon: KeySquare, label: 'Ranked Keywords', path: '/ranked-keywords' },
        { icon: Sprout, label: 'Longtail keywords', path: '/seed' },
        { icon: Network, label: 'People Also Search', path: '/serp' },
        { icon: HelpCircle, label: 'People Also Ask', path: '/ppa' },
        { icon: List, label: 'Keyword Lists', path: '/keyword-lists' }
      ]
    },
    {
      title: 'Backlink Research',
      items: [
        { icon: Link2, label: 'Backlinks', path: '/botox' },
        { icon: LinkIcon, label: 'Referring Domains', path: '/referring-domains' },
        { icon: Layers, label: 'Pages By Links', path: '/pages-by-links' },
      ]
    },
    {
      title: 'SEO Tools',
      items: [
        { icon: Boxes, label: 'Keyword Clustering', path: '/keyword-clustering' },
        { icon: Map, label: 'Topical Map', path: '/topical-map' },
        { 
          icon: BarChart2, 
          label: 'Search Console', 
          path: '/google-search-console',
          onClick: handleGoogleSearchConsoleClick
        }
      ]
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className={`
          fixed inset-y-0 left-0 w-64 bg-[#f9fafb] shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <img 
              src="https://famyayvemq6ogs8n.public.blob.vercel-storage.com/New-Project-5-nc091JvjtG7ETkgteLhGD743OtI1JN.png" 
              alt="Semdash Logo" 
              className="h-8"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
            {sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      {item.onClick ? (
                        <a
                          href={item.path}
                          onClick={item.onClick}
                          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </a>
                      ) : (
                        <NavLink
                          to={item.path}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-[#dbf3ff] text-[#0081dd] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`
                          }
                        >
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </NavLink>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}