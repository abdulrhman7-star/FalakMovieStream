// components/Header.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Film, LogIn, LogOut, Search as SearchIcon, Globe, ChevronDown, Check } from 'lucide-react';
import { T, LANGUAGES } from '@/lib/i18n';
import { LangCode } from '@/types';
import SearchDropdown from './SearchDropdown';

interface HeaderProps {
  lang: LangCode;
  onLangChange: (lang: LangCode) => void;
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
  onLangChange,
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
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }
    if (langOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langOpen]);

  const currentLang = LANGUAGES.find((item) => item.code === lang) || LANGUAGES[0];

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

        {/* Right Section: Language Switcher & Authentication */}
        <div className="flex items-center gap-2 sm:gap-2.5 justify-end">
          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((prev) => !prev)}
              aria-expanded={langOpen}
              aria-haspopup="listbox"
              aria-label={lang === 'ar' ? 'تغيير لغة العرض' : 'Change language'}
              className="flex items-center gap-1.5 bg-[#13151f] hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold px-2.5 py-1.5 rounded-full transition cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Globe className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="text-sm leading-none" aria-hidden="true">{currentLang.flag}</span>
              <span className="hidden sm:inline text-xs font-bold text-gray-200">{currentLang.label}</span>
              <span className="sm:hidden text-[11px] font-bold uppercase">{currentLang.code}</span>
              <ChevronDown
                className={`w-3 h-3 text-gray-400 transition-transform duration-200 shrink-0 ${
                  langOpen ? 'rotate-180 text-red-400' : ''
                }`}
              />
            </button>

            {langOpen && (
              <div
                role="listbox"
                aria-label={lang === 'ar' ? 'اختر لغة العرض' : 'Select language'}
                className="absolute top-full mt-2 end-0 z-50 min-w-[170px] bg-[#0e1017]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-0.5 animate-in fade-in zoom-in-95"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 mb-1">
                  {lang === 'ar' ? 'لغة الموقع' : 'Language'}
                </div>
                {LANGUAGES.map((item) => {
                  const isSelected = item.code === lang;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onLangChange(item.code);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-red-600/15 text-red-400 font-bold'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none" aria-hidden="true">{item.flag}</span>
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Auth */}
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
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-md shadow-red-600/25 transition cursor-pointer active:scale-95 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">{t.login_btn}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
