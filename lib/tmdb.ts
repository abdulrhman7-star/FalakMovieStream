// lib/tmdb.ts — add above fetchTMDB
const cache = new Map<string, { ts: number; data: any }>();
const CACHE_MS = 60_000;

interface FetchTMDBOptions {
  lang?: string;
  signal?: AbortSignal;
}

export async function fetchTMDB<T = any>(
  path: string,
  { lang = 'ar-SA', signal }: FetchTMDBOptions = {}
): Promise<T> {
  const [rawPath, rawQuery = ''] = path.split('?');
  const normalizedPath = rawPath.replace(/^\/+/, '');
  const params = new URLSearchParams(rawQuery);
  if (!params.has('language')) params.set('language', lang);
  const key = `${normalizedPath}?${params.toString()}`;

  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_MS) return hit.data as T;

  const res = await fetch(`/api/tmdb/${key}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `TMDB ${res.status} on ${normalizedPath}`);
  }
  const data = await res.json();
  cache.set(key, { ts: Date.now(), data });
  if (cache.size > 100) cache.delete(cache.keys().next().value!);
  return data;
}