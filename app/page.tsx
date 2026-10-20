// app/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import GenreChips from '@/components/GenreChips';
import DetailPanel from '@/components/DetailPanel';
import Player from '@/components/Player';
import MediaCard from '@/components/MediaCard';
import { fetchTMDB } from '@/lib/tmdb';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { Play, Bookmark, Search as SearchIcon, Film, Trash2, ArrowLeft } from 'lucide-react';
import { MediaItem } from '@/types';
import {
  buildPermalink,
  parsePermalink,
  updateMediaMetadata,
  resetMediaMetadata,
} from '@/lib/permalink';

const LOCAL_FAVORITES_KEY = 'falak_favorites_guest';

export default function FalakPage() {
  // Navigation & UI State (pure SSR-safe defaults to prevent hydration mismatch)
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites'>('home');
  const [activeGenre, setActiveGenre] = useState<string>('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Player & Detail Modal State
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  // Permalink & Loading Feedback State
  const [isInitialPermalinkLoading, setIsInitialPermalinkLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedMediaRef = useRef<any>(selectedMedia);
  useEffect(() => {
    selectedMediaRef.current = selectedMedia;
  }, [selectedMedia]);

  const showAppToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Auth & Favorites State (favorites restored from localStorage inside useEffect)
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<MediaItem[]>([]);

  // Smooth Tab Switching
  const handleTabChange = useCallback((tab: 'home' | 'search' | 'favorites') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (tab === 'search') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    }
  }, []);

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'favorites'));
          const cloudFavs: MediaItem[] = [];
          snapshot.forEach((docSnap) => {
            cloudFavs.push(docSnap.data() as MediaItem);
          });
          if (cloudFavs.length > 0) {
            setFavorites((prev) => {
              const merged = [...cloudFavs];
              prev.forEach((p) => {
                if (!merged.some((m) => m.id === p.id)) {
                  merged.push(p);
                }
              });
              localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(merged));
              return merged;
            });
          }
        } catch (e) {
          console.warn('Failed to fetch user favorites from cloud:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync favorites helper
  const syncFavoritesStorage = (updated: MediaItem[]) => {
    setFavorites(updated);
    try {
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Toggle Favorite
  const toggleFavorite = async (item: any) => {
    const isFav = favorites.some((f) => f.id === item.id);
    const mediaItem: MediaItem = {
      id: item.id,
      mediaType: item.mediaType || item.media_type || 'movie',
      title: item.title || item.name || '',
      poster_path: item.poster_path || '',
      vote_average: item.vote_average || 0,
      release_date: item.release_date || item.first_air_date || '',
    };

    let updatedList: MediaItem[];
    if (isFav) {
      updatedList = favorites.filter((f) => f.id !== item.id);
      if (user) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'favorites', `${mediaItem.mediaType}_${item.id}`));
        } catch {}
      }
    } else {
      updatedList = [mediaItem, ...favorites];
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'favorites', `${mediaItem.mediaType}_${item.id}`), mediaItem);
        } catch {}
      }
    }
    syncFavoritesStorage(updatedList);
  };

  // Google Sign-in Handler
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', error);
      }
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch movies when genre changes or on initial mount
  useEffect(() => {
    let isCancelled = false;

    async function loadMovies() {
      setLoading(true);
      try {
        const endpoint = activeGenre
          ? `/discover/movie?with_genres=${activeGenre}&sort_by=popularity.desc`
          : `/movie/popular`;
        const data = await fetchTMDB(endpoint);
        if (!isCancelled) {
          setMedia(data.results || []);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        if (!isCancelled) {
          setMedia([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadMovies();
    return () => {
      isCancelled = true;
    };
  }, [activeGenre]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  // Live search debounce handler
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchOpen(true);
      try {
        const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(searchQuery.trim())}`);
        const filtered = (data.results || []).filter(
          (item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );
        setSearchResults(filtered);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 1. Initial mount: safely restore client-side state (localStorage favorites, URL tab, permalink) without SSR hydration mismatches
  useEffect(() => {
    // 1a. Restore favorites from local storage
    try {
      const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
      if (stored) {
        const parsedFavs = JSON.parse(stored);
        if (Array.isArray(parsedFavs)) {
          queueMicrotask(() => {
            setFavorites(parsedFavs);
          });
        }
      }
    } catch (e) {
      console.warn('Could not read guest favorites:', e);
    }

    // 1b. Parse search query parameters
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const tabParam = params.get('tab');
    if (tabParam === 'search' || tabParam === 'favorites') {
      queueMicrotask(() => {
        setActiveTab(tabParam);
      });
    }

    // 1c. Parse permalink
    const parsed = parsePermalink(search);
    if (parsed && parsed.isValid) {
      queueMicrotask(() => {
        setIsInitialPermalinkLoading(true);
      });
      fetchTMDB(`/${parsed.type}/${parsed.id}?append_to_response=credits,videos,external_ids`)
        .then((details) => {
          const fullItem = { ...details, mediaType: parsed.type };
          setSelectedMedia(fullItem);
          setCurrentSeason(parsed.season);
          setCurrentEpisode(parsed.episode);
          setShowPlayer(false);
          updateMediaMetadata(fullItem, parsed.season, parsed.episode);
        })
        .catch((err) => {
          console.warn('Permalink item not found:', err);
          showAppToast('العنصر المطلوب غير موجود');
          resetMediaMetadata();
          // Fall back gracefully to clean URL without crashing
          const pathname = window.location.pathname || '/';
          const cleanUrl = tabParam && tabParam !== 'home' ? `${pathname}?tab=${tabParam}` : pathname;
          window.history.replaceState({ tab: tabParam || 'home' }, '', cleanUrl);
        })
        .finally(() => {
          setIsInitialPermalinkLoading(false);
        });
    }
  }, []);

  // 2. Browser history navigation (Back / Forward) popstate listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = async () => {
      const search = window.location.search;
      const parsed = parsePermalink(search);
      const params = new URLSearchParams(search);
      const tabParam = params.get('tab');

      if (tabParam === 'search' || tabParam === 'favorites' || tabParam === 'home') {
        setActiveTab(tabParam);
      }

      if (parsed && parsed.isValid) {
        setCurrentSeason(parsed.season);
        setCurrentEpisode(parsed.episode);

        const current = selectedMediaRef.current;
        if (
          current &&
          current.id === parsed.id &&
          (current.mediaType === parsed.type || current.media_type === parsed.type)
        ) {
          setShowPlayer(false);
          updateMediaMetadata(current, parsed.season, parsed.episode);
        } else {
          try {
            const details = await fetchTMDB(
              `/${parsed.type}/${parsed.id}?append_to_response=credits,videos,external_ids`
            );
            const fullItem = { ...details, mediaType: parsed.type };
            setSelectedMedia(fullItem);
            setShowPlayer(false);
            updateMediaMetadata(fullItem, parsed.season, parsed.episode);
          } catch {
            setSelectedMedia(null);
            setShowPlayer(false);
            resetMediaMetadata();
          }
        }
      } else {
        // No permalink in URL -> close any open modal/player and restore base view
        setSelectedMedia(null);
        setShowPlayer(false);
        resetMediaMetadata();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Open detail panel for movie/show with permalink pushState
  const handleOpenDetail = async (
    id: number,
    type?: 'movie' | 'tv' | string,
    initialTitle?: string,
    initialSeason = 1,
    initialEpisode = 1
  ) => {
    const resolvedType = String(type).toLowerCase() === 'tv' ? 'tv' : 'movie';

    // Update URL immediately using history.pushState before modal appears
    const preliminaryUrl = buildPermalink({
      type: resolvedType,
      id,
      title: initialTitle,
      season: resolvedType === 'tv' ? initialSeason : undefined,
      episode: resolvedType === 'tv' ? initialEpisode : undefined,
    });
    window.history.pushState(
      { type: resolvedType, id, season: initialSeason, episode: initialEpisode, tab: activeTab },
      '',
      preliminaryUrl
    );

    try {
      const details = await fetchTMDB(`/${resolvedType}/${id}?append_to_response=credits,videos,external_ids`);
      const fullItem = { ...details, mediaType: resolvedType };
      setSelectedMedia(fullItem);
      setCurrentSeason(initialSeason);
      setCurrentEpisode(initialEpisode);
      setShowPlayer(false);

      const finalUrl = buildPermalink({
        type: resolvedType,
        id,
        title: fullItem.title || fullItem.name || initialTitle,
        season: resolvedType === 'tv' ? initialSeason : undefined,
        episode: resolvedType === 'tv' ? initialEpisode : undefined,
      });
      window.history.replaceState(
        { type: resolvedType, id, season: initialSeason, episode: initialEpisode, tab: activeTab },
        '',
        finalUrl
      );
      updateMediaMetadata(fullItem, initialSeason, initialEpisode);
    } catch {
      const fallbackItem = { id, mediaType: resolvedType, title: initialTitle };
      setSelectedMedia(fallbackItem);
      setCurrentSeason(initialSeason);
      setCurrentEpisode(initialEpisode);
      setShowPlayer(false);
      updateMediaMetadata(fallbackItem, initialSeason, initialEpisode);
    }
  };

  // Directly start player for movie/show with permalink pushState
  const handleQuickPlay = async (item: any) => {
    const isTv = item.mediaType === 'tv' || item.media_type === 'tv';
    const resolvedType = isTv ? 'tv' : 'movie';
    const initialTitle = item.title || item.name;

    const permalink = buildPermalink({
      type: resolvedType,
      id: item.id,
      title: initialTitle,
      season: resolvedType === 'tv' ? 1 : undefined,
      episode: resolvedType === 'tv' ? 1 : undefined,
    });
    window.history.pushState(
      { type: resolvedType, id: item.id, season: 1, episode: 1, tab: activeTab },
      '',
      permalink
    );

    try {
      const details = await fetchTMDB(`/${resolvedType}/${item.id}?append_to_response=credits,videos,external_ids`);
      const fullItem = { ...details, mediaType: resolvedType };
      setSelectedMedia(fullItem);
      setCurrentSeason(1);
      setCurrentEpisode(1);
      setShowPlayer(true);
      updateMediaMetadata(fullItem, 1, 1);
    } catch {
      const fallbackItem = { ...item, mediaType: resolvedType };
      setSelectedMedia(fallbackItem);
      setCurrentSeason(1);
      setCurrentEpisode(1);
      setShowPlayer(true);
      updateMediaMetadata(fallbackItem, 1, 1);
    }
  };

  // Change TV season or episode using replaceState (does not flood history)
  const handleSelectEpisode = (season: number, episode: number) => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
    if (selectedMedia) {
      const isTv = selectedMedia.mediaType === 'tv' || selectedMedia.media_type === 'tv';
      if (isTv) {
        const updatedPermalink = buildPermalink({
          type: 'tv',
          id: selectedMedia.id,
          title: selectedMedia.title || selectedMedia.name,
          season,
          episode,
        });
        window.history.replaceState(
          { ...window.history.state, season, episode },
          '',
          updatedPermalink
        );
        updateMediaMetadata(selectedMedia, season, episode);
      }
    }
  };

  // Close detail modal and restore clean URL
  const handleCloseModal = () => {
    setSelectedMedia(null);
    setShowPlayer(false);
    resetMediaMetadata();

    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname || '/';
      const cleanUrl = activeTab && activeTab !== 'home'
        ? `${pathname}?tab=${activeTab}`
        : pathname;
      window.history.pushState({ tab: activeTab }, '', cleanUrl);
    }
  };

  // Close player (returns to detail view)
  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  return (
    <div className="bg-[#07080b] text-white min-h-screen flex flex-col antialiased">
      {/* Top Navbar */}
      <Header
        lang="ar"
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favoritesCount={favorites.length}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onSelectResult={(item) => {
          handleOpenDetail(item.id, item.media_type || 'movie', item.title || item.name);
          setSearchOpen(false);
          setSearchQuery('');
        }}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#13151f]/95 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-2xl border border-red-500/40 backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container with top padding to account for fixed navbar, and bottom padding for mobile bar */}
      <main className="flex-1 pt-[72px] pb-[calc(76px+env(safe-area-inset-bottom,0px))] md:pb-0">
        {/* ===================== VIEW 1: HOME ===================== */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-[380px] md:min-h-[460px] flex items-center border-b border-white/5">
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1920&auto=format&fit=crop"
                  alt="Cinema background"
                  className="w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-[#07080b]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07080b] via-[#07080b]/60 to-transparent" />
              </div>

              <div className="container mx-auto px-4 relative z-10 py-10 max-w-4xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600/15 border border-red-500/30 text-red-400 mb-4">
                  ✨ تجربة سينمائية مجانية بجودة 4K & HD
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-white mb-4">
                  شاهد عالمك السينمائي <br />
                  <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                    على منصة فلك
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed mb-6">
                  منصتك الأولى لمتابعة أحدث الأفلام والمسلسلات الحصرية مع مشغل YapGrid الذكي ودعم الترجمة العربية التلقائية بدون اشتراك.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('movies-catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-red-600/30 transition cursor-pointer active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>تصفح العروض</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('favorites')}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full transition cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>قائمة محفوظاتي ({favorites.length})</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Movies Catalog Section */}
            <section id="movies-catalog" className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <span className="w-2.5 h-5 rounded-full bg-red-600 inline-block" />
                  <span>تصفح الأفلام والعروض</span>
                </h2>
              </div>

              {/* Horizontal Scrollable Genre Chips Bar */}
              <GenreChips
                lang="ar"
                activeGenre={activeGenre}
                onSelectGenre={(genreId) => {
                  if (genreId === activeGenre) return;
                  setActiveGenre(genreId);
                }}
              />

              {/* Movies Grid */}
              {loading || isInitialPermalinkLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 mt-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-[#13151f] rounded-xl overflow-hidden aspect-[2/3] animate-pulse border border-white/5 p-3 flex flex-col justify-end"
                    >
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 mt-4">
                  {media.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={{
                        ...item,
                        mediaType: (item.mediaType || item.media_type || 'movie') as any,
                      }}
                      isFavorite={favorites.some((f) => f.id === item.id)}
                      onToggleFavorite={toggleFavorite}
                      onOpenDetail={(i) => handleOpenDetail(i.id, i.mediaType, i.title)}
                      onQuickPlay={(i) => handleQuickPlay(i)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-[#13151f] rounded-2xl border border-white/5 my-6">
                  <Film className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <h3 className="font-bold text-base text-gray-200 mb-1">لا توجد أعمال متاحة لهذا التصنيف</h3>
                  <p className="text-xs text-gray-400 mb-4">جرّب اختيار تصنيف سينمائي آخر أو تصفح الكل.</p>
                  <button
                    type="button"
                    onClick={() => setActiveGenre('')}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full transition cursor-pointer"
                  >
                    عرض جميع الأفلام
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ===================== VIEW 2: SEARCH TAB ===================== */}
        {activeTab === 'search' && (
          <section className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => handleTabChange('home')}
                aria-label="الرجوع إلى الرئيسية"
                className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black text-white">البحث الفوري الشامل</h2>
            </div>

            {/* Mobile / Full search input with auto-focus */}
            <div className="relative mb-6">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="ابحث بالاسم عن فيلم أو مسلسل..."
                className="w-full bg-[#13151f] border border-white/15 rounded-2xl pr-12 pl-4 py-3.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500 shadow-xl transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Instant Results Grid */}
            {searchLoading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">جاري البحث في قاعدة بيانات الأفلام...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <p className="text-xs text-gray-400 mb-4 font-semibold">
                  تم العثور على {searchResults.length} نتيجة:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {searchResults.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={{
                        ...item,
                        mediaType: (item.mediaType || item.media_type || 'movie') as any,
                      }}
                      isFavorite={favorites.some((f) => f.id === item.id)}
                      onToggleFavorite={toggleFavorite}
                      onOpenDetail={(i) => handleOpenDetail(i.id, i.mediaType, i.title)}
                      onQuickPlay={(i) => handleQuickPlay(i)}
                    />
                  ))}
                </div>
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="text-center py-16 text-gray-400">
                <SearchIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-bold">لا توجد نتائج مطابقة لـ &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-gray-500 mt-1">تأكد من كتابة الاسم بشكل صحيح أو جرّب كلمات أخرى.</p>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <SearchIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">اكتب حرفين أو أكثر لبدء البحث الفوري عن أي فيلم أو مسلسل.</p>
              </div>
            )}
          </section>
        )}

        {/* ===================== VIEW 3: FAVORITES TAB ===================== */}
        {activeTab === 'favorites' && (
          <section className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTabChange('home')}
                  aria-label="الرجوع إلى الرئيسية"
                  className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Bookmark className="w-6 h-6 text-red-500 fill-current" />
                  <span>قائمة محفوظاتي ({favorites.length})</span>
                </h2>
              </div>
              {favorites.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    syncFavoritesStorage([]);
                    showAppToast('تم تفريغ قائمة المحفوظات بنجاح');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ الكل</span>
                </button>
              )}
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {favorites.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={{
                      ...item,
                      mediaType: (item.mediaType || item.media_type || 'movie') as any,
                    }}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                    onOpenDetail={(i) => handleOpenDetail(i.id, i.mediaType, i.title)}
                    onQuickPlay={(i) => handleQuickPlay(i)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 bg-[#13151f] rounded-2xl border border-white/5 my-6">
                <Bookmark className="w-14 h-14 text-gray-600 mx-auto mb-3" />
                <h3 className="font-bold text-base text-gray-200 mb-1">لا توجد عناصر محفوظة حتى الآن</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5 leading-relaxed">
                  أثناء تصفحك للأفلام والمسلسلات، اضغط على أيقونة الإشارة المرجعية لحفظ أعمالك المفضلة والوصول إليها بسرعة في أي وقت.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('home')}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-lg shadow-red-600/30 transition cursor-pointer"
                >
                  استكشف أحدث الأفلام
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer with Working Links */}
      <Footer
        lang="ar"
        onTabChange={handleTabChange}
        onSelectGenre={(genreId) => {
          setActiveGenre(genreId);
          handleTabChange('home');
        }}
      />

      {/* Mobile Bottom Navigation Bar (Hidden when video player is active) */}
      <MobileNav
        lang="ar"
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favoritesCount={favorites.length}
        hidden={showPlayer}
      />

      {/* Detail Modal Component */}
      {selectedMedia && !showPlayer && (
        <DetailPanel
          media={selectedMedia}
          lang="ar"
          isFavorite={favorites.some((f) => f.id === selectedMedia.id)}
          onToggleFavorite={toggleFavorite}
          onClose={handleCloseModal}
          onWatch={() => setShowPlayer(true)}
          currentSeason={currentSeason}
          currentEpisode={currentEpisode}
          onSelectEpisode={handleSelectEpisode}
        />
      )}

      {/* Full Feature Video Player with Subtitles & Embeds */}
      {showPlayer && selectedMedia && (
        <Player
          media={selectedMedia}
          currentSeason={currentSeason}
          currentEpisode={currentEpisode}
          onClose={handleClosePlayer}
          onSelectEpisode={handleSelectEpisode}
          lang="ar"
        />
      )}
    </div>
  );
}
