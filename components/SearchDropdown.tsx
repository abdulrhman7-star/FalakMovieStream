// components/SearchDropdown.tsx
'use client';

import React from 'react';
import { Film, Tv, Star } from 'lucide-react';
import { MediaItem } from '@/types';

interface SearchDropdownProps {
  results: MediaItem[];
  loading: boolean;
  onSelect: (item: MediaItem) => void;
  isOpen: boolean;
}

export default function SearchDropdown({ results, loading, onSelect, isOpen }: SearchDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 bg-[#0e1017] border border-white/10 rounded-2xl mt-2 max-h-[380px] overflow-y-auto shadow-2xl z-50 p-2 scrollbar-hide no-scrollbar backdrop-blur-xl"
      role="listbox"
      aria-label="نتائج البحث الفورية"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-6 text-xs text-gray-400">
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span>جاري البحث الفوري...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            النتائج الفورية ({results.length})
          </div>
          {results.map((item) => {
            const isTv = item.mediaType === 'tv' || item.media_type === 'tv';
            const title = item.title || item.name || '—';
            const year = (item.release_date || item.first_air_date || '').substring(0, 4);
            const rating = Number(item.vote_average || 0).toFixed(1);

            return (
              <div
                key={item.id}
                role="option"
                aria-selected={false}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(item);
                  }
                }}
                className="flex items-center gap-3 p-2 hover:bg-white/5 active:bg-white/10 rounded-xl cursor-pointer transition focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:outline-none"
                onClick={() => onSelect(item)}
              >
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={title}
                    className="w-10 h-14 rounded-lg object-cover bg-gray-900 border border-white/5 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-gray-800 border border-white/5 flex items-center justify-center shrink-0 text-gray-500">
                    <Film className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-start">
                  <h4 className="font-bold text-xs text-white truncate">{title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-gray-300">
                      {isTv ? <Tv className="w-3 h-3 text-red-400" /> : <Film className="w-3 h-3 text-red-400" />}
                      <span>{isTv ? 'مسلسل' : 'فيلم'}</span>
                    </span>
                    {year && <span>{year}</span>}
                    {Number(rating) > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>{rating}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-gray-500">
          لا توجد نتائج مطابقة لبحثك
        </div>
      )}
    </div>
  );
}
