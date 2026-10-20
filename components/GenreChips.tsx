// components/GenreChips.tsx
'use client';

import React from 'react';
import { GENRE_NAMES } from '@/lib/i18n';
import { LangCode } from '@/types';

interface GenreChipsProps {
  lang: LangCode;
  activeGenre: string;
  onSelectGenre: (genreId: string) => void;
}

export default function GenreChips({ lang, activeGenre, onSelectGenre }: GenreChipsProps) {
  const allLabel = lang === 'ar' ? 'الكل' : lang === 'tr' ? 'Tümü' : 'All';
  const genreIds = Object.keys(GENRE_NAMES).map(Number);

  return (
    <div className="w-full relative my-4">
      <div
        className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-hide no-scrollbar scroll-smooth"
        role="tablist"
        aria-label="تصنيفات الأفلام"
      >
        {/* All Chip */}
        <button
          type="button"
          role="tab"
          aria-selected={activeGenre === ''}
          onClick={() => onSelectGenre('')}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none ${
            activeGenre === ''
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {allLabel}
        </button>

        {/* Individual Genre Chips */}
        {genreIds.map((id) => {
          const name = GENRE_NAMES[id]?.[lang] || GENRE_NAMES[id]?.ar || String(id);
          const isSelected = activeGenre === String(id);

          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectGenre(String(id))}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
