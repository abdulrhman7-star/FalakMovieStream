// components/GenreChips.tsx
'use client';

import React, { useRef } from 'react';
import { GENRE_NAMES, T } from '@/lib/i18n';
import { LangCode } from '@/types';
import { Check, X, RotateCcw, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

interface GenreChipsProps {
  lang: LangCode;
  selectedGenres: string[];
  onToggleGenre: (genreId: string) => void;
  onClearGenres: () => void;
  genreLogic: 'or' | 'and';
  onChangeLogic: (logic: 'or' | 'and') => void;
}

export default function GenreChips({
  lang,
  selectedGenres,
  onToggleGenre,
  onClearGenres,
  genreLogic,
  onChangeLogic,
}: GenreChipsProps) {
  const t = T[lang] || T.ar;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allLabel = lang === 'ar' ? 'الكل' : lang === 'tr' ? 'Tümü' : 'All';
  const genreIds = Object.keys(GENRE_NAMES).map(Number);
  const isAllActive = selectedGenres.length === 0;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full my-4 bg-[#0d0f17]/80 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md transition-all">
      {/* Top Filter Controls: Title, Count badge, Clear button, and Logic Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        {/* Left/Start: Title, Active Counter Badge, and Clear button */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white">
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            <span>{t.genre_filter_title}</span>
          </div>

          {selectedGenres.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-600/20 text-red-400 border border-red-500/30">
              <span>{selectedGenres.length}</span>
              <span>{t.genre_selected_count}</span>
            </span>
          )}

          {selectedGenres.length > 0 && (
            <button
              type="button"
              onClick={onClearGenres}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 border border-white/10 transition-all cursor-pointer active:scale-95"
              title={t.genre_clear_all}
            >
              <RotateCcw className="w-3 h-3 text-red-400" />
              <span>{t.genre_clear_all}</span>
            </button>
          )}
        </div>

        {/* Right/End: Match Mode Switcher (OR vs AND) */}
        <div className="flex items-center gap-1 bg-[#13151f] p-1 rounded-xl border border-white/10 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => onChangeLogic('or')}
            title={t.genre_mode_hint_any}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              genreLogic === 'or'
                ? 'bg-red-600 text-white shadow-sm font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.genre_mode_any}
          </button>
          <button
            type="button"
            onClick={() => onChangeLogic('and')}
            title={t.genre_mode_hint_all}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              genreLogic === 'and'
                ? 'bg-red-600 text-white shadow-sm font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.genre_mode_all}
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Genre Chips Bar with Arrow Buttons */}
      <div className="relative group/scroll mt-3">
        {/* Left Arrow Button (visible on hover or focus on larger screens) */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#181a26]/90 border border-white/20 text-white items-center justify-center opacity-0 group-hover/scroll:opacity-100 hover:bg-red-600 transition-all shadow-lg cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#181a26]/90 border border-white/20 text-white items-center justify-center opacity-0 group-hover/scroll:opacity-100 hover:bg-red-600 transition-all shadow-lg cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none no-scrollbar scroll-smooth"
          role="group"
          aria-label={t.genre_filter_title}
        >
          {/* "All" Chip */}
          <button
            type="button"
            aria-pressed={isAllActive}
            onClick={onClearGenres}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none active:scale-95 ${
              isAllActive
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/30 border border-red-500/40'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {isAllActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{allLabel}</span>
          </button>

          {/* Individual Genre Chips */}
          {genreIds.map((id) => {
            const name = GENRE_NAMES[id]?.[lang] || GENRE_NAMES[id]?.ar || String(id);
            const strId = String(id);
            const isSelected = selectedGenres.includes(strId);

            return (
              <button
                key={id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleGenre(strId)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/40 border border-red-500/50'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-50 duration-150" />}
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tags Quick-Dismiss Rack (visible when 1 or more genres are selected) */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 mt-2.5 border-t border-white/5 text-xs text-gray-400">
          <span className="text-[11px] font-semibold text-gray-400 me-1">
            {t.genre_active_label}
          </span>
          {selectedGenres.map((genreId) => {
            const numId = Number(genreId);
            const name = GENRE_NAMES[numId]?.[lang] || GENRE_NAMES[numId]?.ar || genreId;
            return (
              <span
                key={genreId}
                className="inline-flex items-center gap-1 bg-red-600/15 border border-red-500/30 text-red-300 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
              >
                <span>{name}</span>
                <button
                  type="button"
                  onClick={() => onToggleGenre(genreId)}
                  className="hover:text-white hover:bg-red-500/40 rounded-full p-0.5 transition cursor-pointer"
                  aria-label={`Remove ${name}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            );
          })}
          <span className="text-[10px] text-gray-400 ms-1">
            {genreLogic === 'and' ? `(${t.genre_mode_hint_all})` : `(${t.genre_mode_hint_any})`}
          </span>
        </div>
      )}
    </div>
  );
}
