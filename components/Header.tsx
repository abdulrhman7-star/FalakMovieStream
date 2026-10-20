// components/Header.tsx
'use client';

import React from 'react';
import { Film, LogIn, LogOut, Search as SearchIcon } from 'lucide-react';
import { T } from '@/lib/i18n';
import { LangCode } from '@/types';
import SearchDropdown from './SearchDropdown';

interface HeaderProps {
  lang: LangCode;
  activeTab: 'home' | 'search' | 'favorites';
  onTabChange: (tab: 'home' | 'search' | 'favorites') => void;
  favoritesCount: number;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: any[];
  searchLoading: boolean;
  onSelectResult: (item: any) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export default function Header({
  lang,
  activeTab,
  onTabChange,
  favoritesCount,
  user,
  onLogin,
  onLogout,
  searchQuery,
  onSearchChange,
  searchResults,
  searchLoading,
  onSelectResult,
  searchOpen,
  setSearchOpen,
}: HeaderProps) {
  const t = T[lang] || T.ar;

  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange('home');
    }
  };

  const getUserInitial = () => {
    if (!user) return '';
    if (user.displayName) return user.displayName.trim().charAt(0).toUpperCase();
    if (user.email) return user.email.trim().charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#07080b]/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="container mx-auto px-4 h-[72px] flex items-center justify-between gap-3">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onTabChange('home')}
            onKeyDown={handleLogoKeyDown}
            aria-label="العودة إلى الصفحة الرئيسية فلك Falak TV"
            className="flex items-center gap-2.5 cursor-pointer group focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-0.5">
                فلك<span className="text-red-500">.</span>
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                Falak TV
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-center max-w-xl mx-4">
          <nav className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-full" aria-label="التنقل الرئيسي">
            <button
              type="button"
              onClick={() => onTabChange('home')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.nav_home}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('favorites')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer relative flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{t.my_favorites}</span>
              {favoritesCount > 0 && (
                <span className="bg-red-500/80 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Search Box on Desktop */}
          <div className="relative flex-1 max-w-xs">
            <div className="relative flex items-center">
              <SearchIcon className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setSearchOpen(true);
                }}
                placeholder={t.search_placeholder}
                className="w-full bg-[#13151f] border border-white/10 rounded-full pr-9 pl-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <SearchDropdown
              results={searchResults}
              loading={searchLoading}
              onSelect={onSelectResult}
              isOpen={searchOpen}
            />
          </div>
        </div>

        {/* Right Section: Authentication / User Area */}
        <div className="flex items-center justify-end min-w-[110px]">
          {user ? (
            <div className="flex items-center gap-2 bg-[#13151f] border border-white/10 rounded-full pl-2 pr-1 py-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-white/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow">
                  {getUserInitial()}
                </div>
              )}
              <span className="text-xs font-semibold max-w-[80px] truncate hidden sm:inline text-gray-200">
                {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={onLogout}
                aria-label={t.signout_btn}
                title={t.signout_btn}
                className="p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-white/5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              aria-label={t.login_btn}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-red-600/25 transition cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.login_btn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
