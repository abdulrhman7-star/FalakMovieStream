// components/MediaCard.tsx
'use client';

import React from 'react';
import { Play, Bookmark, Star, Film } from 'lucide-react';
import { MediaItem } from '@/types';

interface MediaCardProps {
  item: MediaItem;
  isFavorite: boolean;
  onToggleFavorite: (item: MediaItem) => void;
  onOpenDetail: (item: MediaItem) => void;
  onQuickPlay?: (item: MediaItem) => void;
}

export default function MediaCard({
  item,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
  onQuickPlay,
}: MediaCardProps) {
  const isTv = item.mediaType === 'tv' || item.media_type === 'tv';
  const title = item.title || item.name || '—';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);
  const rating = Number(item.vote_average || 0).toFixed(1);

  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail(item);
        }
      }}
      onClick={() => onOpenDetail(item)}
      className="group relative bg-[#13151f] rounded-xl overflow-hidden border border-white/10 hover:border-red-600/70 hover:shadow-xl hover:shadow-red-600/15 transition-all duration-300 cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      {/* Poster with Play Hover Overlay */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <Film className="w-8 h-8" />
          </div>
        )}

        {/* Media type badge */}
        <span className="absolute top-2 left-2 bg-black/75 text-[10px] font-bold px-2 py-0.5 rounded text-white backdrop-blur-sm border border-white/10">
          {isTv ? 'مسلسل' : 'فيلم'}
        </span>

        {/* Quick Favorite Bookmark Button */}
        <button
          type="button"
          aria-label={isFavorite ? 'إزالة من المحفوظات' : 'إضافة إلى المحفوظات'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition cursor-pointer z-10 ${
            isFavorite
              ? 'bg-amber-500 text-black shadow'
              : 'bg-black/60 text-white/80 hover:bg-black/90 hover:text-white'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Play icon overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickPlay) {
                onQuickPlay(item);
              } else {
                onOpenDetail(item);
              }
            }}
            aria-label={`مشاهدة ${title}`}
            className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-90 group-hover:scale-100 transition-transform cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Title and metadata */}
      <div className="p-2.5 flex flex-col flex-1 justify-between">
        <h3
          className="font-bold text-xs text-white truncate group-hover:text-red-400 transition-colors"
          title={title}
        >
          {title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 font-medium">
          <span>{year || '—'}</span>
          {Number(rating) > 0 && (
            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{rating}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
