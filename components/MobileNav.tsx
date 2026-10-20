// components/MobileNav.tsx
'use client';

import React from 'react';
import { Home, Search, Bookmark } from 'lucide-react';
import { T } from '@/lib/i18n';
import { LangCode } from '@/types';

interface MobileNavProps {
  lang: LangCode;
  activeTab: 'home' | 'search' | 'favorites';
  onTabChange: (tab: 'home' | 'search' | 'favorites') => void;
  favoritesCount: number;
  hidden?: boolean;
}

export default function MobileNav({
  lang,
  activeTab,
  onTabChange,
  favoritesCount,
  hidden = false,
}: MobileNavProps) {
  if (hidden) return null;

  const t = T[lang] || T.ar;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0e1017]/95 backdrop-blur-md border-t border-white/10 select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="التنقل الرئيسي للهاتف"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {/* Home Item */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          aria-label={t.nav_home}
          aria-current={activeTab === 'home' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors duration-200 cursor-pointer ${
            activeTab === 'home' ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-none">{t.nav_home}</span>
        </button>

        {/* Search Item */}
        <button
          type="button"
          onClick={() => onTabChange('search')}
          aria-label={t.btn_search}
          aria-current={activeTab === 'search' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors duration-200 cursor-pointer ${
            activeTab === 'search' ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-none">{t.btn_search}</span>
        </button>

        {/* Favorites Item */}
        <button
          type="button"
          onClick={() => onTabChange('favorites')}
          aria-label={t.my_favorites}
          aria-current={activeTab === 'favorites' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors duration-200 cursor-pointer relative ${
            activeTab === 'favorites' ? 'text-red-500 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5 mb-1" />
            {favoritesCount > 0 && (
              <span
                className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.2 min-w-[18px] text-center shadow"
                aria-label={`${favoritesCount} عناصر محفوظة`}
              >
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none">{t.my_favorites}</span>
        </button>
      </div>
    </nav>
  );
}
