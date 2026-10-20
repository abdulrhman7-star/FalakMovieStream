// lib/seo.ts
import { MediaItem } from '@/types';
import { slugify } from './helpers';

export const buildPermalink = (media: MediaItem | null, season?: number, episode?: number) => {
    if (!media) return typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://falak.tv/';
    const url = new URL((typeof window !== 'undefined' ? window.location.origin : 'https://falak.tv/'));
    url.searchParams.set('type', media.mediaType);
    url.searchParams.set('id', String(media.id));
    const title = slugify(media.title || media.name);
    if (title) url.searchParams.set('title', title);
    if (media.mediaType === 'tv' && season) {
        url.searchParams.set('s', String(season));
        url.searchParams.set('e', String(episode || 1));
    }
    return url.toString();
};
