import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {MapPinned,CircleFadingPlus, Cog, Map, Boxes, Home, Network, Link2, Search, Layers, BarChart2, Users, FileText, KeySquare, Sprout, Link as LinkIcon, History, Settings, LogOut, HelpCircle, Share, List, CreditCard, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ShareEarn } from './ShareEarn';

export function Sidebar() {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        { icon: History, label: 'Historical SERP', path: '/serp-checker' }      ]
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
      title: 'AI SEO Tools',
      items: [
        { icon: Boxes, label: 'Keyword Clustering', path: '/keyword-clustering' },
        { icon: Map, label: 'Topical Map', path: '/topical-map' }
      ]
    },
     {
      title: 'Account',
      items: [
        { icon: Cog, label: 'Settings', path: '/settings' },
        { icon: MapPinned, label: 'View Roadmap', path: '/roadmap' }
      ]
    }
  ];

  return (
    <div className={`h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-[#f9fafb] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <div 
            onClick={() => window.location.href = 'https://seo.semdash.com/overview'}
            className="cursor-pointer"
          >
            <img 
              src="https://famyayvemq6ogs8n.public.blob.vercel-storage.com/New-Project-5-nc091JvjtG7ETkgteLhGD743OtI1JN.png" 
              alt="Semdash Logo" 
              className="h-8 dark:invert"
            />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
        {sections.map((section, index) => (
          <div key={index} className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center ${isCollapsed ? 'px-2' : 'px-4'} py-2 text-sm font-medium rounded-lg transition-colors relative group ${
                        isActive 
                          ? 'bg-[#dbf3ff] text-[#0081dd] dark:bg-blue-900/50 dark:text-blue-200 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && item.label}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>


    </div>
  );
}
