// lib/players.ts
import { MediaType } from '@/types';

export interface PlayerServer {
  id: string;
  name: string;
  badge?: string;
  hasArabicSubs: boolean;
}

export const SERVERS: PlayerServer[] = [
  { id: 'yapgrid', name: 'YapGrid', badge: 'مترجم تلقائياً 🚀', hasArabicSubs: true },
  { id: 'vidlink', name: 'VidLink Pro', badge: 'سريع 4K', hasArabicSubs: true },
  { id: 'vidsrc', name: 'VidSrc Me', badge: 'سيرفر بديل', hasArabicSubs: true },
  { id: 'vidcore', name: 'VidCore', badge: 'HD عالي', hasArabicSubs: true },
  { id: 'vidsrcmov', name: 'VidSrc Mov', badge: 'مستقر', hasArabicSubs: true },
  { id: 'autoembed', name: 'AutoEmbed', badge: 'احتياطي', hasArabicSubs: false },
  { id: 'multiembed', name: 'MultiEmbed', badge: 'متعدد الخوادم', hasArabicSubs: false },
];

export const getPlayerUrl = (server: string, media: any, s: number = 1, ep: number = 1): string => {
  if (!media || !media.id) return '';

  const id = media.id;
  const isTv =
    media.mediaType === 'tv' ||
    media.media_type === 'tv' ||
    (Boolean(media.number_of_seasons) && Number(media.number_of_seasons) > 0) ||
    Boolean(media.first_air_date && !media.release_date);

  const season = Math.max(1, Number(s) || 1);
  const episode = Math.max(1, Number(ep) || 1);
  const imdbId = media.external_ids?.imdb_id || media.imdb_id || id;

  switch (server) {
    case 'yapgrid':
      return isTv
        ? `https://yapgrid.com/embed/tv/${id}/${season}/${episode}?autoplay=1&lang=ar`
        : `https://yapgrid.com/embed/movie/${id}?autoplay=1&lang=ar`;
    case 'vidlink':
      return isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}?sub_lang=ar&primary_color=ffdd00&autoplay=1`
        : `https://vidlink.pro/movie/${id}?sub_lang=ar&primary_color=ffdd00&autoplay=1`;
    case 'vidsrc':
      return isTv
        ? `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${season}&episode=${episode}&ds_lang=ar&sub_lang=ar&autonext=1&autoplay=1`
        : `https://vidsrcme.ru/embed/movie?imdb=${imdbId}&ds_lang=ar&sub_lang=ar&autoplay=1`;
    case 'vidcore':
      return isTv
        ? `https://vidcore.org/embed/tv/${id}/${season}/${episode}?theme=ff1e27&autoplay=true&lang=ar&disableInfo=false`
        : `https://vidcore.org/embed/movie/${id}?theme=ff1e27&autoplay=true&lang=ar&disableInfo=false`;
    case 'vidsrcmov':
      return isTv
        ? `https://vidsrc.mov/embed/tv/${id}/${season}/${episode}?sub_lang=ar`
        : `https://vidsrc.mov/embed/movie/${id}?sub_lang=ar`;
    case 'autoembed':
      return isTv
        ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${id}`;
    case 'multiembed':
    default:
      return isTv
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}&autoplay=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&autoplay=1`;
  }
};
