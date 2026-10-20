// components/DetailPanel.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, Bookmark, Share2, Youtube, X } from 'lucide-react';
import { fetchTMDB } from '@/lib/tmdb';
import { T } from '@/lib/i18n';
import { LangCode } from '@/types';

import { buildPermalink } from '@/lib/permalink';

interface DetailPanelProps {
  media: any;
  lang?: LangCode;
  isFavorite: boolean;
  onToggleFavorite: (item: any) => void;
  onClose: () => void;
  onWatch: () => void;
  onSelectEpisode?: (season: number, episode: number) => void;
  currentSeason?: number;
  currentEpisode?: number;
}

export default function DetailPanel({
  media,
  lang = 'ar',
  isFavorite,
  onToggleFavorite,
  onClose,
  onWatch,
  onSelectEpisode,
  currentSeason = 1,
  currentEpisode = 1,
}: DetailPanelProps) {
  const t = T[lang] || T.ar;
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Derive trailer key without synchronous effect setState
  const trailerKey = useMemo(() => {
    if (media?.videos?.results) {
      const trailer = media.videos.results.find(
        (v: any) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
      );
      return trailer?.key || null;
    }
    return null;
  }, [media]);

  // Load TV episodes
  useEffect(() => {
    let ignore = false;
    const isTv = media?.mediaType === 'tv' || media?.media_type === 'tv';
    if (isTv && media.id) {
      const fetchEpisodes = async () => {
        try {
          const data = await fetchTMDB(`/tv/${media.id}/season/${currentSeason}`);
          if (!ignore) {
            setEpisodes(data.episodes || []);
            setLoadingEpisodes(false);
          }
        } catch {
          if (!ignore) {
            setEpisodes([]);
            setLoadingEpisodes(false);
          }
        }
      };
      fetchEpisodes();
    }
    return () => {
      ignore = true;
    };
  }, [media, currentSeason]);

  const handleShare = async () => {
    const isTv = media?.mediaType === 'tv' || media?.media_type === 'tv';
    const type = isTv ? 'tv' : 'movie';
    const rawTitle = media.title || media.name || 'Falak TV';
    const permalink = buildPermalink({
      type,
      id: media.id,
      title: rawTitle,
      season: isTv ? currentSeason : undefined,
      episode: isTv ? currentEpisode : undefined,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Watch ${rawTitle} Online — Falak`,
          url: permalink,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(permalink);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {}
  };

  const seasonsList = (media?.seasons || []).filter((s: any) => s.season_number > 0);
  const year = (media?.release_date || media?.first_air_date || '').substring(0, 4);
  const rating = Number(media?.vote_average || 0).toFixed(1);
  const castList = (media?.credits?.cast || []).slice(0, 5);

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={media?.title || media?.name || 'تفاصيل العمل'}
    >
      <div
        className="bg-[#13151f] border border-white/10 p-6 rounded-2xl max-w-4xl w-full my-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Copied Toast Banner */}
        {copiedToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 z-20">
            <span>✓ تم نسخ رابط المشاركة بنجاح!</span>
          </div>
        )}

        {/* Top close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t.btn_close}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          {/* Poster */}
          <div className="flex justify-center">
            {media?.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                alt={media.title || media.name}
                className="w-[130px] md:w-[220px] aspect-[2/3] object-cover rounded-xl shadow-lg border border-white/10"
              />
            ) : (
              <div className="w-[130px] md:w-[220px] aspect-[2/3] bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 text-xs">
                لا يوجد بوستر
              </div>
            )}
          </div>

          {/* Details info */}
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              {media.title || media.name}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="bg-red-600/20 text-red-400 border border-red-600/30 text-[11px] font-bold px-2.5 py-1 rounded-full">
                {media.mediaType === 'tv' ? t.badge_tv : t.badge_movie}
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2.5 py-1 rounded-full">
                ⭐ {rating}
              </span>
              {year && (
                <span className="bg-white/5 border border-white/10 text-gray-300 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  📅 {year}
                </span>
              )}
              {media.number_of_seasons && (
                <span className="bg-white/5 border border-white/10 text-gray-300 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  📚 {media.number_of_seasons} {t.seasons_count}
                </span>
              )}
            </div>

            {/* Cast chips */}
            {castList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {castList.map((c: any, idx: number) => (
                  <span
                    key={idx}
                    className="bg-white/5 text-gray-300 text-[10px] px-2.5 py-0.5 rounded-full border border-white/5"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="mt-4 text-gray-300 text-xs leading-relaxed max-h-[120px] overflow-y-auto pr-1">
              {media.overview || t.overview_unavailable}
            </p>

            {/* TV Episodes module */}
            {media.mediaType === 'tv' && (
              <div className="mt-4 p-3.5 bg-[#0e1017] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <h4 className="font-bold text-xs text-white">
                    {t.tv_seasons_heading}
                  </h4>
                  {seasonsList.length > 0 && (
                    <select
                      value={currentSeason}
                      onChange={(e) => {
                        const sNum = Number(e.target.value);
                        setLoadingEpisodes(true);
                        if (onSelectEpisode) onSelectEpisode(sNum, 1);
                      }}
                      className="bg-[#13151f] text-white text-xs border border-white/10 rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500"
                    >
                      {seasonsList.map((s: any) => (
                        <option key={s.season_number} value={s.season_number}>
                          {t.season_label} {s.season_number}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {loadingEpisodes ? (
                    <span className="text-[11px] text-gray-500 col-span-full py-2">
                      جاري تحميل الحلقات...
                    </span>
                  ) : episodes.length > 0 ? (
                    episodes.map((ep: any) => {
                      const isActive = currentEpisode === ep.episode_number;
                      return (
                        <button
                          key={ep.id || ep.episode_number}
                          type="button"
                          onClick={() => {
                            if (onSelectEpisode) onSelectEpisode(currentSeason, ep.episode_number);
                          }}
                          className={`p-1.5 text-center rounded-lg text-xs font-bold transition cursor-pointer ${
                            isActive
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                              : 'bg-white/5 hover:bg-white/10 text-gray-300'
                          }`}
                        >
                          {t.episode_label} {ep.episode_number}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-gray-500 col-span-full py-2">
                      {t.no_results}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={onWatch}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-red-600/30 transition cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t.btn_watch}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleFavorite(media)}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full border transition cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? t.btn_in_fav : t.btn_add_fav}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-bold px-4 py-2.5 rounded-full transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.btn_share}</span>
              </button>

              {trailerKey && (
                <button
                  type="button"
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank')}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-red-400 border border-red-500/20 text-xs font-bold px-4 py-2.5 rounded-full transition cursor-pointer"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>{t.btn_trailer}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-white/10 text-xs font-bold px-4 py-2.5 rounded-full transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.btn_close}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
