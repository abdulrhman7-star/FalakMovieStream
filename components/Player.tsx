// components/Player.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Maximize,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Tv,
  Film,
  Sparkles,
  Upload,
  Search,
  Type,
  Volume2,
  Clock,
  Layers,
  AlertCircle,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { getPlayerUrl, SERVERS } from '@/lib/players';
import { buildPermalink } from '@/lib/permalink';
import { LangCode } from '@/types';
import { T } from '@/lib/i18n';

interface PlayerProps {
  media: any;
  currentSeason: number;
  currentEpisode: number;
  onClose: () => void;
  onSelectEpisode?: (season: number, episode: number) => void;
  lang?: LangCode;
}

export default function Player({
  media,
  currentSeason = 1,
  currentEpisode = 1,
  onClose,
  onSelectEpisode,
  lang = 'ar',
}: PlayerProps) {
  const t = T[lang] || T.ar;
  const [playerMode, setPlayerMode] = useState<'iframe' | 'vjs'>('iframe');
  const [server, setServer] = useState<string>('yapgrid');
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [subFontSize, setSubFontSize] = useState<number>(18);
  const [subOffset, setSubOffset] = useState<number>(0);
  const [subStatus, setSubStatus] = useState<string>('مفعلة تلقائياً');
  const [customVttUrl, setCustomVttUrl] = useState<string | null>(null);
  const [showSubToolbar, setShowSubToolbar] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isTv = useMemo(() => {
    return (
      media?.mediaType === 'tv' ||
      media?.media_type === 'tv' ||
      Boolean(media?.number_of_seasons && media.number_of_seasons > 0) ||
      Boolean(media?.first_air_date && !media?.release_date)
    );
  }, [media]);

  const title = media?.title || media?.name || 'فلك TV';
  const year = (media?.release_date || media?.first_air_date || '').substring(0, 4);

  // Compute total episodes for current season if seasons metadata is present
  const totalEpisodesInSeason = useMemo(() => {
    if (!isTv || !media?.seasons) return 24;
    const s = media.seasons.find((item: any) => item.season_number === currentSeason);
    return s?.episode_count || 24;
  }, [isTv, media, currentSeason]);

  // Compute active iframe URL
  const iframeSrc = useMemo(() => {
    return getPlayerUrl(server, media, currentSeason, currentEpisode);
  }, [server, media, currentSeason, currentEpisode]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Change server handler
  const handleServerChange = (newServer: string) => {
    setIframeLoading(true);
    setServer(newServer);
  };

  // Reload handler
  const handleReload = () => {
    setIframeLoading(true);
    setReloadKey((k) => k + 1);
  };

  // Navigate TV episodes
  const goToNextEpisode = () => {
    if (!onSelectEpisode) return;
    setIframeLoading(true);
    if (currentEpisode < totalEpisodesInSeason) {
      onSelectEpisode(currentSeason, currentEpisode + 1);
    } else if (media?.number_of_seasons && currentSeason < media.number_of_seasons) {
      onSelectEpisode(currentSeason + 1, 1);
    }
  };

  const goToPrevEpisode = () => {
    if (!onSelectEpisode) return;
    setIframeLoading(true);
    if (currentEpisode > 1) {
      onSelectEpisode(currentSeason, currentEpisode - 1);
    } else if (currentSeason > 1) {
      onSelectEpisode(currentSeason - 1, 1);
    }
  };

  // Subtitle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (playerMode !== 'vjs') {
      showToast('⚠️ تم تحويل المشغل إلى مشغل فلك لتطبيق ملف الترجمة المرفوع.');
      setPlayerMode('vjs');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      let content = event.target?.result as string;
      if (file.name.endsWith('.srt')) {
        content = 'WEBVTT\n\n' + content.replace(/\r\n|\r/g, '\n').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
      }
      if (customVttUrl) {
        URL.revokeObjectURL(customVttUrl);
      }
      const blob = new Blob([content], { type: 'text/vtt;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setCustomVttUrl(url);
      setSubStatus(`مخصصة: ${file.name.substring(0, 15)}...`);
      showToast('✅ تم تحميل وتفعيل الترجمة المخصصة بنجاح!');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Subtitle font adjustments
  const adjustSubFontSize = (delta: number) => {
    const newSize = Math.max(14, Math.min(36, subFontSize + delta));
    setSubFontSize(newSize);
    showToast(`حجم خط الترجمة: ${newSize}px`);
  };

  // Subtitle offset
  const adjustSubOffset = (sec: number) => {
    const newOffset = subOffset + sec;
    setSubOffset(newOffset);
    showToast(`توقيت الترجمة: ${newOffset > 0 ? '+' : ''}${newOffset} ثانية`);
  };

  // Search online for subtitles
  const searchOnlineSubtitles = () => {
    const q = encodeURIComponent(`${title} ${year}`);
    window.open(`https://subdl.com/search/${q}`, '_blank');
  };

  // Regenerate permalink and share
  const handleShare = async () => {
    if (!media?.id) return;
    const permalink = buildPermalink({
      type: isTv ? 'tv' : 'movie',
      id: media.id,
      title,
      season: isTv ? currentSeason : undefined,
      episode: isTv ? currentEpisode : undefined,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Watch ${title} Online — Falak`,
          url: permalink,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(permalink);
      showToast('تم نسخ رابط المشاركة بنجاح!');
    } catch {}
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col antialiased text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`مشغل فلك - ${title}`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#13151f]/95 text-white border border-red-500/40 text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Controller Bar */}
      <div className="h-14 sm:h-16 bg-[#0e1017] border-b border-white/10 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0">
        {/* Title & Episode info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shrink-0">
            {isTv ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="font-extrabold text-xs sm:text-sm text-white truncate leading-tight" title={title}>
              {title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 truncate">
              {isTv ? (
                <span className="text-red-400 font-bold">
                  الموسم {currentSeason} · الحلقة {currentEpisode}
                </span>
              ) : (
                <span>فيلم {year && `(${year})`}</span>
              )}
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-medium">
                <Sparkles className="w-2.5 h-2.5" />
                ترجمة عربية تلقائية
              </span>
            </div>
          </div>
        </div>

        {/* TV Episode navigation (Next / Prev) */}
        {isTv && onSelectEpisode && (
          <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={goToPrevEpisode}
              disabled={currentEpisode <= 1 && currentSeason <= 1}
              className="px-2 py-1 text-xs text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
              title="الحلقة السابقة"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>السابقة</span>
            </button>
            <span className="text-[10px] text-gray-400 px-1 font-bold">
              حلقة {currentEpisode}
            </span>
            <button
              type="button"
              onClick={goToNextEpisode}
              className="px-2 py-1 text-xs text-gray-300 hover:text-white flex items-center gap-1"
              title="الحلقة التالية"
            >
              <span>التالية</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Server & Mode Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mode Switcher: Embed vs In-House Video.js */}
          <div className="bg-[#13151f] border border-white/10 rounded-lg p-0.5 hidden lg:flex items-center">
            <button
              type="button"
              onClick={() => setPlayerMode('iframe')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                playerMode === 'iframe'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              سيرفرات البث
            </button>
            <button
              type="button"
              onClick={() => setPlayerMode('vjs')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                playerMode === 'vjs'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              مشغل فلك المدمج
            </button>
          </div>

          {/* Server Selector for iframe mode */}
          {playerMode === 'iframe' && (
            <div className="relative">
              <select
                value={server}
                onChange={(e) => handleServerChange(e.target.value)}
                className="bg-[#13151f] text-white text-[11px] sm:text-xs font-semibold border border-white/15 px-2 sm:px-3 py-1.5 rounded-lg focus:outline-none focus:border-red-500 cursor-pointer max-w-[140px] sm:max-w-none"
                aria-label="اختر سيرفر البث"
              >
                {SERVERS.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} {srv.badge ? `(${srv.badge})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subtitle Toolbar Toggle */}
          <button
            type="button"
            onClick={() => setShowSubToolbar(!showSubToolbar)}
            className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-1 text-xs ${
              showSubToolbar
                ? 'bg-red-600/20 text-red-400 border-red-500/40'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
            }`}
            title="أدوات الترجمة العربية"
            aria-label="أدوات الترجمة العربية"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-bold">الترجمة</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition cursor-pointer flex items-center gap-1"
            title="مشاركة رابط العرض"
            aria-label="مشاركة رابط العرض"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] font-bold">مشاركة</span>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={handleReload}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition cursor-pointer"
            title="إعادة تحميل المشغل"
            aria-label="إعادة تحميل المشغل"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition cursor-pointer hidden sm:flex"
            title="ملء الشاشة"
            aria-label="ملء الشاشة"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-lg shadow-red-600/20"
            aria-label="إغلاق المشغل"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">إغلاق</span>
          </button>
        </div>
      </div>

      {/* Subtitles Customization Toolbar Bar (Collapsible) */}
      {showSubToolbar && (
        <div className="bg-[#13151f] border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              حالة الترجمة العربية:
              <span className="text-emerald-400 font-black">{subStatus}</span>
            </span>

            {/* Font Size Adjusters */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-gray-400 font-bold">الحجم:</span>
              <button
                type="button"
                onClick={() => adjustSubFontSize(-2)}
                className="px-1.5 py-0.5 hover:bg-white/10 rounded text-gray-300 font-bold"
                title="تصغير خط الترجمة"
              >
                A-
              </button>
              <span className="text-[11px] text-white font-bold">{subFontSize}px</span>
              <button
                type="button"
                onClick={() => adjustSubFontSize(2)}
                className="px-1.5 py-0.5 hover:bg-white/10 rounded text-gray-300 font-bold"
                title="تكبير خط الترجمة"
              >
                A+
              </button>
            </div>

            {/* Subtitle Time Sync */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-gray-400 font-bold">تزامن:</span>
              <button
                type="button"
                onClick={() => adjustSubOffset(-1)}
                className="px-1.5 py-0.5 hover:bg-white/10 rounded text-gray-300 font-bold"
                title="تأخير ثانية"
              >
                -1s
              </button>
              <span className="text-[11px] text-white font-bold">{subOffset}s</span>
              <button
                type="button"
                onClick={() => adjustSubOffset(1)}
                className="px-1.5 py-0.5 hover:bg-white/10 rounded text-gray-300 font-bold"
                title="تقديم ثانية"
              >
                +1s
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Upload SRT/VTT file */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-2.5 py-1 rounded-lg transition font-medium"
            >
              <Upload className="w-3 h-3 text-red-400" />
              <span>رفع ملف ترجمة (SRT/VTT)</span>
            </button>

            {/* SubDL search button */}
            <button
              type="button"
              onClick={searchOnlineSubtitles}
              className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-2.5 py-1 rounded-lg transition font-medium"
            >
              <Search className="w-3 h-3 text-amber-400" />
              <span>بحث في SubDL</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </button>
          </div>
        </div>
      )}

      {/* Main Video View Area */}
      <div className="flex-1 w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
        {playerMode === 'iframe' ? (
          <>
            {/* Loading Indicator */}
            {iframeLoading && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 p-4">
                <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-bold text-white mb-1">جاري تحميل البث من سيرفر {server}...</p>
                <p className="text-xs text-gray-400 max-w-sm text-center">
                  سيرفر YapGrid يدعم الترجمة التلقائية للعربية. إذا لم يبدأ العرض خلال ثوانٍ، جرب التبديل إلى سيرفر آخر مثل VidLink أو VidSrc.
                </p>
              </div>
            )}

            {/* Primary Iframe */}
            <iframe
              key={`${server}-${media?.id}-${currentSeason}-${currentEpisode}-${reloadKey}`}
              src={iframeSrc}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; encrypted-media"
              referrerPolicy="origin"
              title={`Falak TV Player - ${title}`}
              onLoad={() => setIframeLoading(false)}
            />
          </>
        ) : (
          /* Video.js / In-House HTML5 Video Mode with Arabic Subtitle Engine */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <video
              ref={videoRef}
              controls
              playsInline
              autoPlay
              className="w-full h-full object-contain"
              poster={media?.poster_path ? `https://image.tmdb.org/t/p/w1280${media.poster_path}` : undefined}
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              {customVttUrl ? (
                <track
                  kind="subtitles"
                  src={customVttUrl}
                  srcLang="ar"
                  label="العربية (مخصصة)"
                  default
                />
              ) : (
                <track
                  kind="subtitles"
                  src="data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00%3A00%3A01.000%20--%3E%2000%3A00%3A08.000%0A%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A8%D9%83%20%D9%81%D9%8A%20%D9%85%D9%86%D8%B5%D8%A9%20%D9%81%D9%84%D9%83%20%D8%A7%D9%84%D8%B0%D9%83%D9%8A%D8%A9%0A%0A2%0A00%3A00%3A08.500%20--%3E%2000%3A00%3A18.000%0A%D9%8A%D9%85%D9%83%D9%86%D9%83%20%D8%B1%D9%81%D8%B9%20%D9%85%D9%84%D9%81%20%D8%AA%D8%B1%D8%AC%D9%85%D8%A9%20SRT%20%D8%A3%D9%88%20VTT%20%D9%85%D8%B7%D8%A7%D8%A8%D9%82%20%D9%85%D9%86%20%D8%B4%D8%B1%D9%8A%D8%B7%20%D8%A7%D9%84%D8%A3%D8%AF%D9%88%D8%A7%D8%AA%20%D8%A3%D8%B9%D9%84%D8%A7%D9%87"
                  srcLang="ar"
                  label="العربية (فلك)"
                  default
                />
              )}
            </video>

            {/* Custom Overlay Subtitle Display Styled by Font Size Setting */}
            <style jsx global>{`
              video::cue {
                font-size: ${subFontSize}px !important;
                background-color: rgba(0, 0, 0, 0.75) !important;
                color: #ffffff !important;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8) !important;
                line-height: 1.4 !important;
                font-family: inherit !important;
              }
            `}</style>

            <div className="absolute bottom-4 left-4 bg-black/70 border border-white/10 px-3 py-1.5 rounded-lg text-[11px] text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>مشغل فلك الذكي: الترجمة العربية جاهزة ومفعلة</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Advice Bar */}
      <div className="bg-[#0e1017] border-t border-white/10 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            سيرفر <strong className="text-white">{server}</strong>: يتم تفعيل الترجمة العربية تلقائياً. في حال واجهت شاشة سوداء أو بطء، اختر سيرفر آخر من القائمة بالأعلى.
          </span>
        </div>

        {isTv && (
          <div className="flex items-center gap-2 font-bold text-gray-300">
            <span>الموسم {currentSeason}</span>
            <span>·</span>
            <span>الحلقة {currentEpisode}</span>
          </div>
        )}
      </div>
    </div>
  );
}
