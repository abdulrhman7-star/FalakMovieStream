// lib/permalink.ts
/**
 * Permalink generator, parser, and metadata synchronization for Falak TV.
 * Conforms strictly to specification:
 * Format: {BASE_URL}{pathname}?type={type}&id={id}&title={slug}[&s={season}&e={episode}]
 */

export interface ParsedPermalink {
  isValid: boolean;
  type: 'movie' | 'tv';
  id: number;
  titleSlug?: string;
  season: number;
  episode: number;
  hasEpisodeParams: boolean;
}

export const DEFAULT_SITE_TITLE = 'فلك Falak — مشاهدة أحدث الأفلام والمسلسلات مترجمة مجاناً بجودة 4K/HD';
export const DEFAULT_SITE_DESC = 'منصة فلك (Falak TV) لمشاهدة وتحميل الأفلام والمسلسلات المترجمة والمدبلجة أونلاين مجاناً بأعلى جودة HD و 4K.';

/**
 * Returns current origin at runtime without hardcoding domains.
 */
export function getRuntimeOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || '';
}

/**
 * Returns current pathname (preserving path prefixes like /app/).
 */
export function getRuntimePathname(): string {
  if (typeof window !== 'undefined' && window.location?.pathname) {
    return window.location.pathname;
  }
  return '/';
}

/**
 * Generates human-readable slug:
 * lowercased, spaces to hyphens, keeps only a-z, 0-9, -, and Arabic characters.
 */
export function slugifyTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    // keep a-z, 0-9, hyphen, and Arabic unicode range (\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF)
    .replace(/[^a-z0-9\-\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, '')
    // collapse multiple hyphens
    .replace(/-+/g, '-')
    // trim leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Builds the exact permalink URL.
 */
export function buildPermalink(params: {
  type: 'movie' | 'tv' | string;
  id: number | string;
  title?: string;
  season?: number;
  episode?: number;
  origin?: string;
  pathname?: string;
}): string {
  const origin = params.origin !== undefined ? params.origin : getRuntimeOrigin();
  const pathname = params.pathname !== undefined ? params.pathname : getRuntimePathname();
  const cleanType = String(params.type).trim().toLowerCase() === 'tv' ? 'tv' : 'movie';
  const cleanId = String(params.id).trim();
  const slug = slugifyTitle(params.title || '');

  // Exact query parameter order: type, id, title[, s, e]
  const queryParts: string[] = [];
  queryParts.push(`type=${cleanType}`);
  queryParts.push(`id=${encodeURIComponent(cleanId)}`);

  if (slug) {
    queryParts.push(`title=${encodeURIComponent(slug)}`);
  }

  if (cleanType === 'tv') {
    if (params.season !== undefined && params.episode !== undefined) {
      queryParts.push(`s=${encodeURIComponent(String(params.season))}`);
      queryParts.push(`e=${encodeURIComponent(String(params.episode))}`);
    }
  }

  const queryString = queryParts.join('&');
  return `${origin}${pathname}?${queryString}`;
}

/**
 * Parses query search string for permalink parameters.
 */
export function parsePermalink(searchStr: string): ParsedPermalink | null {
  if (!searchStr) return null;
  try {
    const cleanSearch = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr;
    const params = new URLSearchParams(cleanSearch);

    const rawType = (params.get('type') || '').trim().toLowerCase();
    const rawId = (params.get('id') || '').trim();

    if (rawType !== 'movie' && rawType !== 'tv') {
      return null;
    }

    const id = parseInt(rawId, 10);
    if (isNaN(id) || id <= 0) {
      return null;
    }

    const titleSlug = params.get('title') || undefined;

    let season = 1;
    let episode = 1;
    let hasEpisodeParams = false;

    const rawS = params.get('s');
    const rawE = params.get('e');
    if (rawS !== null || rawE !== null) {
      hasEpisodeParams = true;
      if (rawS) {
        const parsedS = parseInt(rawS, 10);
        if (!isNaN(parsedS) && parsedS > 0) season = parsedS;
      }
      if (rawE) {
        const parsedE = parseInt(rawE, 10);
        if (!isNaN(parsedE) && parsedE > 0) episode = parsedE;
      }
    }

    return {
      isValid: true,
      type: rawType as 'movie' | 'tv',
      id,
      titleSlug,
      season,
      episode,
      hasEpisodeParams,
    };
  } catch {
    return null;
  }
}

/**
 * Injects or updates a meta tag in document.head
 */
function setMetaTag(nameOrProperty: string, content: string, isProperty = false) {
  if (typeof document === 'undefined') return;
  const attribute = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, nameOrProperty);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Injects or updates canonical link in document.head
 */
function setCanonical(href: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * Updates head metadata, canonical, OpenGraph, and JSON-LD when media is open.
 */
export function updateMediaMetadata(media: any, season = 1, episode = 1) {
  if (typeof document === 'undefined' || !media) return;

  const rawTitle = media.title || media.name || 'Hope';
  const isTv = media.mediaType === 'tv' || media.media_type === 'tv';
  const type = isTv ? 'tv' : 'movie';
  const permalink = buildPermalink({
    type,
    id: media.id,
    title: rawTitle,
    season: isTv ? season : undefined,
    episode: isTv ? episode : undefined,
  });

  // 1. Page Title: "Watch Hope Online — Falak"
  document.title = `Watch ${rawTitle} Online — Falak`;

  // 2. Canonical URL matching exact current permalink
  setCanonical(permalink);

  // 3. Open Graph Tags
  const overview = media.overview || DEFAULT_SITE_DESC;
  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w780${media.poster_path}`
    : media.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
    : '';

  setMetaTag('og:title', `${rawTitle} — Falak TV`, true);
  setMetaTag('og:description', overview, true);
  if (posterUrl) {
    setMetaTag('og:image', posterUrl, true);
  }
  setMetaTag('og:url', permalink, true);
  setMetaTag('og:type', isTv ? 'video.tv_show' : 'video.movie', true);

  // Twitter cards
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', `${rawTitle} — Falak TV`);
  setMetaTag('twitter:description', overview);
  if (posterUrl) {
    setMetaTag('twitter:image', posterUrl);
  }

  // 4. JSON-LD structured data block
  let jsonLdScript = document.getElementById('falak-media-jsonld') as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement('script');
    jsonLdScript.id = 'falak-media-jsonld';
    jsonLdScript.type = 'application/ld+json';
    document.head.appendChild(jsonLdScript);
  }

  const jsonLdData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': isTv ? 'TVSeries' : 'Movie',
    name: rawTitle,
    description: overview,
    url: permalink,
  };

  if (posterUrl) {
    jsonLdData.image = posterUrl;
  }
  const releaseDate = media.release_date || media.first_air_date;
  if (releaseDate) {
    jsonLdData.datePublished = releaseDate;
  }
  if (media.vote_average) {
    jsonLdData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(media.vote_average).toFixed(1),
      bestRating: '10',
      worstRating: '1',
      ratingCount: media.vote_count || 100,
    };
  }

  jsonLdScript.textContent = JSON.stringify(jsonLdData, null, 2);
}

/**
 * Resets document title, canonical, OpenGraph, and removes JSON-LD when modal closes.
 */
export function resetMediaMetadata() {
  if (typeof document === 'undefined') return;

  const origin = getRuntimeOrigin();
  const pathname = getRuntimePathname();
  const cleanUrl = `${origin}${pathname}`;

  document.title = DEFAULT_SITE_TITLE;
  setCanonical(cleanUrl);

  setMetaTag('og:title', DEFAULT_SITE_TITLE, true);
  setMetaTag('og:description', DEFAULT_SITE_DESC, true);
  setMetaTag('og:url', cleanUrl, true);
  setMetaTag('og:type', 'website', true);

  // Remove JSON-LD script block
  const jsonLdScript = document.getElementById('falak-media-jsonld');
  if (jsonLdScript) {
    jsonLdScript.remove();
  }
}
