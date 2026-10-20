// types/index.ts
export type LangCode = 'ar' | 'en' | 'fr' | 'es' | 'tr';
export type MediaType = 'movie' | 'tv';

export interface MediaItem {
  id: number;
  mediaType: MediaType;
  title?: string;
  name?: string;
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genres?: { id: number; name: string }[];
  seasons?: { season_number: number }[];
  number_of_seasons?: number;
  credits?: { cast: { name: string }[] };
  videos?: { results: { type: string; site: string; key: string }[] };
  external_ids?: { imdb_id?: string };
  media_type?: string;
}

export interface FavoriteItem {
  id: number;
  mediaType: MediaType;
  title: string;
  poster_path: string;
  vote_average: number;
  year: string;
  addedAt: number;
}

export interface Toast {
  id: number;
  msg: string;
}

export interface Episode {
  episode_number: number;
  id: number;
}
