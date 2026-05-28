import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Play, Info, Heart, Tv, Film, Search, Star, X, Check, CheckCircle2, AlignLeft, LogOut
} from 'lucide-react';
import { MediaItem, LiveChannel, WatchedItem } from './types';
import { 
  LIMITE_FINAL_FILME, MOVIE_GENRES, TV_GENRES
} from './data';
import { ALL_EMBED_CHANNELS } from './channelsData';
import { 
  fetchTrending, fetchMovies, fetchTVShows, searchCatalog, getPlayerUrl, getMediaImageUrl 
} from './api';
import Splash from './components/Splash';
import Navbar from './components/Navbar';
import MediaCard from './components/MediaCard';
import DetailsModal from './components/DetailsModal';
import PurePlayer from './components/PurePlayer';
import RouletteModal from './components/RouletteModal';
import PinScreen from './components/PinScreen';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://udnyykslmppylmkcyxrb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o-SjKHVdmSFNLIwwoDERoQ_4VMvMx4k';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Authentication Lock State (Supabase-driven)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; pin: string; nome_usuario: string; foto_url: string } | null>(null);

  // TikTok Republicados state
  const [republishedList, setRepublishedList] = useState<MediaItem[]>([]);

  // User details modification state
  const [editName, setEditName] = useState<string>('');

  // User search states
  const [searchUserQuery, setSearchUserQuery] = useState<string>('');
  const [searchedUser, setSearchedUser] = useState<any | null>(null);
  const [searchUserError, setSearchUserError] = useState<string | null>(null);
  const [searchUserLoading, setSearchUserLoading] = useState<boolean>(false);
  const [searchedUserRepublished, setSearchedUserRepublished] = useState<MediaItem[]>([]);

  // View Controller ('home', 'movies', 'tv', 'iptv', 'mylist', 'search', 'profile')
  const [currentView, setCurrentView] = useState<string>('home');

  // Roulette (Surprise Mode) State
  const [isRouletteOpen, setIsRouletteOpen] = useState<boolean>(false);

  // Unified Media State Caches
  const [trendingAll, setTrendingAll] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [scifiMovies, setScifiMovies] = useState<MediaItem[]>([]);
  const [animeShows, setAnimeShows] = useState<MediaItem[]>([]);

  // Category Filtering States
  const [selectedMovieGenre, setSelectedMovieGenre] = useState<number | null>(null);
  const [selectedTVGenre, setSelectedTVGenre] = useState<number | null>(null);
  
  // Custom Filtered Lists
  const [filteredMovies, setFilteredMovies] = useState<MediaItem[]>([]);
  const [filteredTV, setFilteredTV] = useState<MediaItem[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [tvLoading, setTvLoading] = useState(false);

  // Watchlist & Continued Watching Databases (LocalStorage)
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchedItem[]>([]);

  // Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IPTV Specific States
  const [iptvSearchQuery, setIptvSearchQuery] = useState<string>('');
  const [activeIptvCategory, setActiveIptvCategory] = useState<string>('all');

  // Selected Item Detail modal
  const [selectedMediaDetail, setSelectedMediaDetail] = useState<MediaItem | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'movie' | 'tv'>('movie');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Active Play Session Tracker
  const [activePlayItem, setActivePlayItem] = useState<MediaItem | null>(null);
  const [activeSeason, setActiveSeason] = useState<number | undefined>(undefined);
  const [activeEpisode, setActiveEpisode] = useState<number | undefined>(undefined);
  const [activeLiveChannel, setActiveLiveChannel] = useState<LiveChannel | null>(null);
  const [playerTitle, setPlayerTitle] = useState<string>('');
  const [playerSubtitle, setPlayerSubtitle] = useState<string>('');

  // Server Setup Configurations
  const [serverLang, setServerLang] = useState<string>('pt');

  // Floating Notification Status
  const [notification, setNotification] = useState<{ text: string; show: boolean }>({ text: '', show: false });

  // Carousel Swapping (Featured Title Index)
  const [heroIndex, setHeroIndex] = useState(0);

  // Recover user session on load
  useEffect(() => {
    const cachedUserStr = localStorage.getItem('metaplay_current_user');
    if (cachedUserStr) {
      try {
        const u = JSON.parse(cachedUserStr);
        setCurrentUser(u);
        setEditName(u.nome_usuario);
        setIsAuthorized(true);
      } catch (e) {
        console.error('Failed to parse cached user session:', e);
      }
    }
  }, []);

  // Isolate databases and lists when user session updates
  useEffect(() => {
    if (!currentUser) {
      setWatchlist([]);
      setContinueWatching([]);
      setRepublishedList([]);
      setEditName('');
      return;
    }

    setEditName(currentUser.nome_usuario);

    // Watchlist isolation
    try {
      const storedWatchlist = localStorage.getItem(`metaplay_watchlist_${currentUser.pin}`);
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      } else {
        setWatchlist([]);
      }
    } catch (e) {
      console.error(e);
      setWatchlist([]);
    }

    // Continue Watching isolation
    try {
      const storedContinue = localStorage.getItem(`metaplay_continue_${currentUser.pin}`);
      if (storedContinue) {
        setContinueWatching(JSON.parse(storedContinue));
      } else {
        setContinueWatching([]);
      }
    } catch (e) {
      console.error(e);
      setContinueWatching([]);
    }

    // TikTok Republicados isolation
    try {
      const storedRep = localStorage.getItem(`metaplay_republished_${currentUser.pin}`);
      if (storedRep) {
        setRepublishedList(JSON.parse(storedRep));
      } else {
        setRepublishedList([]);
      }
    } catch (e) {
      console.error(e);
      setRepublishedList([]);
    }
  }, [currentUser]);

  // Synchronize catalogs safely on initialization (independent of user)
  useEffect(() => {
    async function loadInitialCatalogs() {
      try {
        const trends = await fetchTrending('all');
        const sanitizedTrends = trends.filter(m => m.id !== 999999);
        setTrendingAll([LIMITE_FINAL_FILME, ...sanitizedTrends]);

        const recMovies = await fetchMovies();
        setTrendingMovies(recMovies);
        setFilteredMovies(recMovies);

        const recTV = await fetchTVShows();
        setTrendingTV(recTV);
        setFilteredTV(recTV);

        // Fetch genres sections
        const acts = await fetchMovies(28);
        setActionMovies(acts);

        const scis = await fetchMovies(878);
        setScifiMovies(scis);

        const anims = await fetchTVShows(16);
        setAnimeShows(anims);
      } catch (err) {
        console.warn('API error during initialize - using catalogs fallbacks:', err);
      }
    }

    loadInitialCatalogs();
  }, []);

  // Update localStorage watchlist isolated by user pin
  const saveWatchlist = (updated: MediaItem[]) => {
    setWatchlist(updated);
    if (currentUser) {
      localStorage.setItem(`metaplay_watchlist_${currentUser.pin}`, JSON.stringify(updated));
    } else {
      localStorage.setItem('metaplay_watchlist', JSON.stringify(updated));
    }
  };

  // Toggle Watchlist Membership
  const handleToggleWatchlist = (item: MediaItem) => {
    const isPresent = watchlist.some(w => w.id === item.id);
    let updated: MediaItem[];
    if (isPresent) {
      updated = watchlist.filter(w => w.id !== item.id);
      showNotification(`Removido da Minha Lista: ${item.title || item.name}`);
    } else {
      updated = [...watchlist, item];
      showNotification(`Adicionado à Minha Lista: ${item.title || item.name}`);
    }
    saveWatchlist(updated);
  };

  // Toggle TikTok style Republished status
  const handleToggleRepublish = (item: MediaItem) => {
    if (!currentUser) {
      showNotification('Inicie sessão para republicar títulos.');
      return;
    }
    const isPresent = republishedList.some(r => r.id === item.id);
    let updated: MediaItem[];
    if (isPresent) {
      updated = republishedList.filter(r => r.id !== item.id);
      showNotification(`Removido das suas republicações!`);
    } else {
      updated = [...republishedList, item];
      showNotification(`Título republicado com sucesso no seu perfil! 🔄`);
    }
    setRepublishedList(updated);
    localStorage.setItem(`metaplay_republished_${currentUser.pin}`, JSON.stringify(updated));
  };

  // Update name of current authorized user profile
  const handleUpdateName = async () => {
    if (!currentUser) return;
    if (!editName.trim()) {
      showNotification('Nome não pode estar em branco.');
      return;
    }

    try {
      // 1. Try to write to Supabase
      const { error } = await supabase
        .from('pins')
        .update({ nome_usuario: editName.trim() })
        .eq('pin', currentUser.pin);

      if (error) {
        console.error('Supabase update name error:', error);
      }

      // 2. Perform local cache updates
      const updated = { ...currentUser, nome_usuario: editName.trim() };
      setCurrentUser(updated);
      localStorage.setItem('metaplay_current_user', JSON.stringify(updated));

      // Backup list updates
      const backupProfilesStr = localStorage.getItem('metaplay_local_profiles');
      if (backupProfilesStr) {
        try {
          const profiles = JSON.parse(backupProfilesStr);
          const index = profiles.findIndex((p: any) => p.pin === currentUser.pin);
          if (index !== -1) {
            profiles[index].nome_usuario = editName.trim();
            localStorage.setItem('metaplay_local_profiles', JSON.stringify(profiles));
          }
        } catch (je) {
          console.error(je);
        }
      }

      showNotification('Nome de usuário atualizado com sucesso! ✨');
    } catch (e) {
      console.warn('Network issue - updated name locally only.', e);
      const updated = { ...currentUser, nome_usuario: editName.trim() };
      setCurrentUser(updated);
      localStorage.setItem('metaplay_current_user', JSON.stringify(updated));
      showNotification('Nome atualizado localmente! ✨');
    }
  };

  // Search another user profile by numerical ID
  const handleSearchUserById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUserQuery.trim()) {
      return;
    }

    setSearchUserLoading(true);
    setSearchUserError(null);
    setSearchedUser(null);
    setSearchedUserRepublished([]);

    try {
      const searchId = parseInt(searchUserQuery.trim());
      if (isNaN(searchId)) {
        throw new Error('O ID precisa ser um número inteiro válido.');
      }

      // Check Supabase pins table
      const { data, error } = await supabase
        .from('pins')
        .select('*')
        .eq('id', searchId)
        .limit(1);

      if (error) {
        console.error('Supabase user ID search error:', error);
        // Fallback to local storage
        const localProfiles = JSON.parse(localStorage.getItem('metaplay_local_profiles') || '[]');
        const foundLocal = localProfiles.find((p: any) => p.id === searchId);
        if (foundLocal) {
          setSearchedUser(foundLocal);
          const repub = JSON.parse(localStorage.getItem(`metaplay_republished_${foundLocal.pin}`) || '[]');
          setSearchedUserRepublished(repub);
          return;
        }
        throw new Error('Conexão instável e perfil não localizado em cache.');
      }

      if (data && data.length > 0) {
        const found = data[0];
        setSearchedUser(found);
        
        // Find their republished list from local storage lookup database
        const repub = JSON.parse(localStorage.getItem(`metaplay_republished_${found.pin}`) || '[]');
        setSearchedUserRepublished(repub);
      } else {
        // Fallback match check offline cache list
        const localProfiles = JSON.parse(localStorage.getItem('metaplay_local_profiles') || '[]');
        const foundLocal = localProfiles.find((p: any) => p.id === searchId);
        if (foundLocal) {
          setSearchedUser(foundLocal);
          const repub = JSON.parse(localStorage.getItem(`metaplay_republished_${foundLocal.pin}`) || '[]');
          setSearchedUserRepublished(repub);
        } else {
          setSearchUserError('Nenhum perfil localizado com esse ID da conta.');
        }
      }
    } catch (err: any) {
      setSearchUserError(err.message || 'Erro ao processar busca de usuário.');
    } finally {
      setSearchUserLoading(false);
    }
  };

  // Quick feedback popups
  const showNotification = (text: string) => {
    setNotification({ text, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Refresh category-specific pages when genre triggers update
  useEffect(() => {
    async function filterMoviesList() {
      setMoviesLoading(true);
      try {
        const results = await fetchMovies(selectedMovieGenre || undefined);
        setFilteredMovies(results);
      } catch (e) {
        console.error('Error filtering category movies', e);
      } finally {
        setMoviesLoading(false);
      }
    }
    filterMoviesList();
  }, [selectedMovieGenre]);

  useEffect(() => {
    async function filterTVList() {
      setTvLoading(true);
      try {
        const results = await fetchTVShows(selectedTVGenre || undefined);
        setFilteredTV(results);
      } catch (e) {
        console.error('Error filtering category tv shows', e);
      } finally {
        setTvLoading(false);
      }
    }
    filterTVList();
  }, [selectedTVGenre]);

  // Handle Dedicated Live Catalog Search Queries
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const list = await searchCatalog(searchQuery);
        setSearchResults(list);
      } catch (err) {
        console.error('Query search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 450); // Debounce search changes

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Optimize Search tab cache: Reset states/caches immediately when navigating away
  useEffect(() => {
    if (currentView !== 'search') {
      setSearchQuery('');
      setSearchResults([]);
      setSearchLoading(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  }, [currentView]);

  // Trigger Detail Drawers
  const openMediaDetails = (item: MediaItem) => {
    setSelectedMediaDetail(item);
    setSelectedMediaType(item.media_type);
    setIsDetailsOpen(true);
  };

  // Launch Active Video Player
  const handlePlayMedia = (item: MediaItem, season?: number, episode?: number) => {
    setActivePlayItem(item);
    setActiveSeason(season);
    setActiveEpisode(episode);
    setActiveLiveChannel(null);

    const sTitle = item.title || item.name || 'METAPLAY';
    const sSubtitle = item.media_type === 'tv' 
      ? `Temporada ${season || 1} • Episódio ${episode || 1}`
      : 'UHD Premium HDR';
    
    setPlayerTitle(sTitle);
    setPlayerSubtitle(sSubtitle);

    // Save/Update "Continuar Assistindo" drawer
    updateContinuedActivity(item, season, episode);
  };

  const handlePlayChannel = (channel: LiveChannel) => {
    setActiveLiveChannel(channel);
    setActivePlayItem(null);
    setPlayerTitle(channel.name);
    setPlayerSubtitle(`Canal de transmissão ao vivo - Categoria ${channel.category}`);
  };

  // Append new item or update percentage for active histories
  const updateContinuedActivity = (item: MediaItem, season?: number, episode?: number) => {
    const isTV = item.media_type === 'tv';
    
    const progressSimulation = Math.floor(Math.random() * 60) + 20; // Simulated active play point
    
    const activityRecord: WatchedItem = {
      id: item.id,
      media_type: item.media_type,
      title: item.title || item.name || '',
      poster_path: item.poster_path || null,
      poster_url: item.poster_url || undefined,
      progress: progressSimulation,
      lastWatchedEpisode: isTV && season && episode ? { season, episode, title: `Episódio ${episode}` } : undefined,
      updatedAt: Date.now()
    };

    setContinueWatching(prev => {
      const filtered = prev.filter(p => p.id !== item.id);
      const updated = [activityRecord, ...filtered].slice(0, 10); // Hold max 10 records
      localStorage.setItem('metaplay_continue', JSON.stringify(updated));
      return updated;
    });
  };

  // Remove individual elements from Watch Progress history
  const handleRemoveProgress = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setContinueWatching(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('metaplay_continue', JSON.stringify(updated));
      return updated;
    });
    showNotification("Removido do histórico de reprodução.");
  };

  // Format dynamic links for Iframe
  const assemblePlayerLink = (): string | null => {
    if (activeLiveChannel) {
      return activeLiveChannel.streamUrl || `https://reidoscanais.app/embed/?c=${activeLiveChannel.canal}`;
    }
    if (activePlayItem) {
      return getPlayerUrl(activePlayItem, activeSeason, activeEpisode);
    }
    return null;
  };

  // IPTV category routing
  const filteredLiveChannels = ALL_EMBED_CHANNELS.filter(ch => {
    const matchesCategory = activeIptvCategory === 'all' || ch.category === activeIptvCategory;
    const matchesSearch = ch.name.toLowerCase().includes(iptvSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Hot Carousel Titles
  const rotatingHeroToggles = trendingAll.slice(0, 4);
  const currentHero = rotatingHeroToggles[heroIndex] || LIMITE_FINAL_FILME;

  return (
    <div className="relative min-h-screen bg-[#050507] text-neutral-200">
      
      {/* 1. CINEMATIC EMBEDDED INTRO SPLASH */}
      <Splash show={showSplash} onFinish={() => setShowSplash(false)} />

      {/* 2. AMBIENT ORANGE VECTOR GLOW DECORATIONS */}
      <div className="absolute top-0 right-[-100px] w-[600px] h-[600px] bg-brand/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-[45%] left-[-150px] w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* 3. PIN LOCKER SCREEN PROTECTION */}
      {!showSplash && !isAuthorized && (
        <PinScreen onAuthorized={(user) => {
          setCurrentUser(user);
          localStorage.setItem('metaplay_current_user', JSON.stringify(user));
          setIsAuthorized(true);
        }} />
      )}

      {/* 4. MULTI-PLATFORM NAVIGATION HUD */}
      {!showSplash && isAuthorized && (
        <Navbar 
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          watchlistCount={watchlist.length}
          serverLang={serverLang}
          onLanguageChange={(lang) => {
            setServerLang(lang);
            showNotification(`Servidor alterado para: ${lang === 'pt' ? 'Português' : lang === 'eng' ? 'Inglês' : lang === 'es' ? 'Espanhol' : 'Francês'}`);
          }}
          onOpenRoulette={() => setIsRouletteOpen(true)}
          currentUser={currentUser}
        />
      )}

      {/* 5. PRIMARY OUTLET ROUTER FRAMES */}
      {!showSplash && isAuthorized && (
        <div className="pt-0 pb-24 md:pb-0">
          
          {/* VIEW: HOME (INÍCIO) */}
          {currentView === 'home' && (
            <div id="home-view" className="animate-fade-in">
              {/* HERO CAROUSEL HEADER BANNER */}
              <section className="relative w-full h-[75vh] md:h-[90vh] flex items-end overflow-hidden mb-12">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-100 ease-out"
                  style={{ 
                    backgroundImage: `url(${
                      currentHero.id === 999999 
                        ? (currentHero.backdrop_url || '') 
                        : getMediaImageUrl(currentHero.backdrop_path, 'original')
                    })` 
                  }}
                />
                
                {/* Cinema Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/25 to-black/60"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/45 to-transparent"></div>
                
                {/* Banner typography panels */}
                <div className="relative z-10 px-6 lg:px-12 pb-16 max-w-3xl">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="bg-brand text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 tracking-widest uppercase shadow-md shadow-brand/25">
                      <Sparkles className="w-3 h-3 text-white fill-white" />
                      EM DESTAQUE NO METAPLAY
                    </span>
                    <span className="bg-white/10 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                      {currentHero.media_type === 'tv' ? 'Série completa' : 'Filme Premium'}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 drop-shadow-lg text-white font-display leading-tight uppercase">
                    {currentHero.title || currentHero.name}
                  </h1>

                  <p className="text-neutral-300 text-xs md:text-sm line-clamp-3 mb-8 max-w-xl leading-relaxed">
                    {/* Render plain overview safely or strip markup */}
                    {currentHero.id === 999999 
                      ? "Uma obra-prima impecável de mistério de Arthur Costa. O resgate de pistas esquecidas desafiará a linha tênue do tempo e as leis da realidade." 
                      : currentHero.overview}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => openMediaDetails(currentHero)}
                      className="bg-brand hover:bg-brand-hover text-white font-black px-7 py-3.5 rounded-full flex items-center gap-2 shadow-xl shadow-brand/20 transition-all hover:scale-105 text-xs md:text-sm"
                    >
                      <Info className="w-4 h-4" />
                      <span>Ver Ficha Técnica</span>
                    </button>
                    
                    <button 
                      onClick={() => handleToggleWatchlist(currentHero)}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-full flex items-center gap-2 border border-white/10 transition-all text-xs md:text-sm"
                    >
                      <Heart className={`w-4 h-4 ${watchlist.some(w => w.id === currentHero.id) ? 'fill-brand text-brand' : ''}`} />
                      <span>Minha Lista</span>
                    </button>

                    <button 
                      onClick={() => setIsRouletteOpen(true)}
                      className="bg-gradient-to-r from-red-600 via-brand to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black px-6 py-3.5 rounded-full flex items-center gap-2 shadow-xl shadow-red-500/10 transition-all hover:scale-105 text-xs md:text-sm"
                    >
                      <span>🎲 Roleta Russa</span>
                    </button>
                  </div>
                </div>

                {/* Switcher Carousel Indicators */}
                {rotatingHeroToggles.length > 1 && (
                  <div className="absolute bottom-16 right-6 lg:right-12 z-20 flex items-center gap-2">
                    {rotatingHeroToggles.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'bg-brand w-8' : 'bg-white/30 hover:bg-white/60'}`}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* CAROUSELS HORIZONTAL SHELVES */}
              <main className="px-6 lg:px-12 pb-32 space-y-16 relative z-10">
                
                {/* ROLETA RUSSA PROMINENT CALL TO ACTION BANNER */}
                <div className="bg-gradient-to-r from-neutral-950 via-[#181010] to-neutral-950 border border-brand/10 hover:border-brand/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(239,68,68,0.03)] transition-all">
                  <div className="space-y-3.5">
                    <span className="bg-red-500/10 text-red-500 border border-red-500/10 text-[9px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 tracking-widest uppercase leading-none">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                      CURE O SEU DILEMA DE ESCOLHA
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight font-display leading-none">
                      🎲 Roleta Russa - Escolha por Mim
                    </h3>
                    <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                      Deixe nossa curadoria inteligente filtrar o acervo por você. Ao rodar a roleta, o script cruza as preferências do seu histórico, seleciona 3 pérolas recomendadas com excelente classificação no TMDb e inicia um sorteio visual imersivo!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsRouletteOpen(true)}
                    className="flex-shrink-0 bg-gradient-to-r from-red-600 via-brand to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs px-8 py-4 rounded-full transition-transform hover:scale-105 shadow-xl shadow-red-600/10 active:scale-95 uppercase tracking-widest"
                  >
                    Ativar Modo Surpresa
                  </button>
                </div>
                
                {/* 1. Continue Watching section (if records exist) */}
                {continueWatching.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl md:text-2xl font-black mb-5 flex items-center gap-2.5 text-white uppercase tracking-tight">
                      <span className="w-1.5 h-6 bg-brand rounded-full"></span> 
                      <span>Continuar Assistindo</span>
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {continueWatching.map((rec) => {
                        const recItem: MediaItem = {
                          id: rec.id,
                          media_type: rec.media_type,
                          title: rec.title,
                          overview: '',
                          poster_path: rec.poster_path,
                          poster_url: rec.poster_url,
                          vote_average: 10
                        };
                        
                        return (
                          <div 
                            key={rec.id}
                            onClick={() => handlePlayMedia(recItem, rec.lastWatchedEpisode?.season, rec.lastWatchedEpisode?.episode)}
                            className="bg-surface-card border border-white/5 hover:border-brand/40 rounded-xl overflow-hidden cursor-pointer relative group transition-all"
                          >
                            <div className="aspect-video w-full overflow-hidden relative bg-neutral-900">
                              <img 
                                src={rec.id === 999999 ? (rec.poster_url || undefined) : getMediaImageUrl(rec.poster_path)}
                                alt={rec.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <Play className="w-8 h-8 text-white fill-white scale-75 group-hover:scale-100 transition-transform" />
                              </div>

                              {/* Remove Progress Node Button */}
                              <button 
                                onClick={(e) => handleRemoveProgress(e, rec.id)}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-brand/35 p-1 rounded-full text-white/70 hover:text-white transition-colors"
                                title="Remover Histórico"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="p-3 space-y-1 bg-[#0b0b0e]">
                              <p className="text-xs font-bold text-white truncate">{rec.title}</p>
                              {rec.lastWatchedEpisode ? (
                                <p className="text-[10px] text-brand font-bold uppercase tracking-wider truncate">
                                  T{rec.lastWatchedEpisode.season}:EP{rec.lastWatchedEpisode.episode}
                                </p>
                              ) : (
                                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                                  Filme Premium
                                </p>
                              )}
                              
                              {/* Progress bar metrics */}
                              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden mt-2">
                                <div className="bg-brand h-full rounded-full" style={{ width: `${rec.progress}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 2. Trending recommendation movies */}
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-black flex items-center gap-2.5 text-white uppercase tracking-tight">
                    <span className="w-1.5 h-6 bg-brand rounded-full"></span> 
                    <span>Filmes Recomendados</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {trendingMovies.slice(0, 8).map(m => (
                      <MediaCard key={m.id} item={m} onClick={openMediaDetails} isFavorite={watchlist.some(w => w.id === m.id)} onToggleFavorite={(e, item) => handleToggleWatchlist(item)} />
                    ))}
                  </div>
                </div>

                {/* 3. Popular TV Shows Row */}
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-black flex items-center gap-2.5 text-white uppercase tracking-tight">
                    <span className="w-1.5 h-6 bg-brand rounded-full"></span> 
                    <span>Séries de TV Populares</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {trendingTV.slice(0, 8).map(t => (
                      <MediaCard key={t.id} item={t} onClick={openMediaDetails} isFavorite={watchlist.some(w => w.id === t.id)} onToggleFavorite={(e, item) => handleToggleWatchlist(item)} />
                    ))}
                  </div>
                </div>

                {/* 4. Action Movie list */}
                {actionMovies.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-black flex items-center gap-2.5 text-white uppercase tracking-tight">
                      <span className="w-1.5 h-6 bg-brand rounded-full"></span> 
                      <span>Sucessos de Ação</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {actionMovies.slice(0, 8).map(m => (
                        <MediaCard key={m.id} item={m} onClick={openMediaDetails} isFavorite={watchlist.some(w => w.id === m.id)} onToggleFavorite={(e, item) => handleToggleWatchlist(item)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Sci-Fi Block */}
                {scifiMovies.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-black flex items-center gap-2.5 text-white uppercase tracking-tight">
                      <span className="w-1.5 h-6 bg-brand rounded-full"></span> 
                      <span>Ficção Científica & Fantasia</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {scifiMovies.slice(0, 8).map(m => (
                        <MediaCard key={m.id} item={m} onClick={openMediaDetails} isFavorite={watchlist.some(w => w.id === m.id)} onToggleFavorite={(e, item) => handleToggleWatchlist(item)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Animes Section */}
                {animeShows.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-black flex items-center gap-2.5 text-white uppercase tracking-tight">
                      <span className="w-1.5 h-6 bg-brand rounded-full"></span> 
                      <span>Animes & Animações</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {animeShows.slice(0, 8).map(t => (
                        <MediaCard key={t.id} item={t} onClick={openMediaDetails} isFavorite={watchlist.some(w => w.id === t.id)} onToggleFavorite={(e, item) => handleToggleWatchlist(item)} />
                      ))}
                    </div>
                  </div>
                )}

              </main>
            </div>
          )}

          {/* VIEW: DISCOVER MOVIES */}
          {currentView === 'movies' && (
            <div id="movies-view" className="pt-28 px-6 lg:px-12 pb-32 animate-fade-in space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-display mb-3">
                  Filmes Premium
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                  Explore o melhor do cinema mundial com a mais alta qualidade de transmissão, áudio digital imersivo e servidores otimizados.
                </p>
              </div>

              {/* Genre Filters Row */}
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                <button
                  onClick={() => setSelectedMovieGenre(null)}
                  className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex-shrink-0 ${
                    selectedMovieGenre === null 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Tudo
                </button>
                {MOVIE_GENRES.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedMovieGenre(genre.id)}
                    className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex-shrink-0 ${
                      selectedMovieGenre === genre.id 
                        ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                        : 'bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>

              {/* Grid listings */}
              {moviesLoading ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-brand/25 border-t-brand rounded-full animate-spin"></div>
                  <p className="text-xs text-brand font-bold uppercase tracking-widest mt-4">Consultando Acervo...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-5">
                  {/* Append custom film first if matching genre or looking at everything */}
                  {(selectedMovieGenre === null || LIMITE_FINAL_FILME.genres?.some(g => g.id === selectedMovieGenre) || selectedMovieGenre === 9648) && (
                    <MediaCard item={LIMITE_FINAL_FILME} onClick={openMediaDetails} isFavorite={watchlist.some(w => w.id === LIMITE_FINAL_FILME.id)} onToggleFavorite={(e, item) => handleToggleWatchlist(item)} />
                  )}
                  {filteredMovies.map(movie => (
                    <MediaCard key={movie.id} item={movie} onClick={openMediaDetails} isFavorite={watchlist.some(w => w.id === movie.id)} onToggleFavorite={(e, item) => handleToggleWatchlist(item)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: DISCOVER TV SHOWS */}
          {currentView === 'tv' && (
            <div id="tv-view" className="pt-28 px-6 lg:px-12 pb-32 animate-fade-in space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-display mb-3">
                  Séries Completas
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                  Acompanhe maratonas emocionantes com indexadores automáticos por temporadas, carregamento instantâneo e resolução Ultra HD.
                </p>
              </div>

              {/* Genre Filters Row */}
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                <button
                  onClick={() => setSelectedTVGenre(null)}
                  className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex-shrink-0 ${
                    selectedTVGenre === null 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Tudo
                </button>
                {TV_GENRES.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedTVGenre(genre.id)}
                    className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex-shrink-0 ${
                      selectedTVGenre === genre.id 
                        ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                        : 'bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>

              {/* Grid listings */}
              {tvLoading ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-brand/25 border-t-brand rounded-full animate-spin"></div>
                  <p className="text-xs text-brand font-bold uppercase tracking-widest mt-4">Indexando Episódios...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-5">
                  {filteredTV.map(show => (
                    <MediaCard key={show.id} item={show} onClick={openMediaDetails} isFavorite={watchlist.some(w => w.id === show.id)} onToggleFavorite={(e, item) => handleToggleWatchlist(item)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: LIVE CHANNELS (IPTV) */}
          {currentView === 'iptv' && (
            <div id="iptv-view" className="pt-28 px-6 lg:px-12 pb-32 animate-fade-in space-y-8 min-h-screen">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-display mb-2 flex items-center gap-3">
                    <span className="relative flex h-3.5 w-3.5 mt-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                    </span>
                    <span>Canais ao Vivo</span>
                  </h2>
                  <p className="text-neutral-400 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                    Transmissões em tempo real sem interrupções. Curta canais abertos, jornalismo, esportes em HD e programação infantil.
                  </p>
                </div>

                {/* IPTV search bar */}
                <div className="relative w-full md:max-w-xs">
                  <input
                    type="text"
                    value={iptvSearchQuery}
                    onChange={(e) => setIptvSearchQuery(e.target.value)}
                    placeholder="Buscar canais por nome..."
                    className="w-full bg-[#0F0F14] border border-white/10 hover:border-white/20 focus:border-brand focus:ring-1 focus:ring-brand/40 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none transition-all text-white placeholder-neutral-500 shadow-md"
                  />
                  <Search className="w-4.5 h-4.5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  {iptvSearchQuery && (
                    <button onClick={() => setIptvSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* IPTV categories bar */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
                <button
                  onClick={() => setActiveIptvCategory('all')}
                  className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all flex-shrink-0 ${
                    activeIptvCategory === 'all' 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  📺 Programação Completa
                </button>
                {['Esportes', 'Filmes e Séries', 'Canais Abertos', 'Reality Show', 'Notícias', 'Infantil'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveIptvCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all flex-shrink-0 ${
                      activeIptvCategory === cat
                        ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                        : 'bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat === 'Esportes' ? '⚽ Esportes' : cat === 'Filmes e Séries' ? '🎬 Filmes e Séries' : cat === 'Reality Show' ? '👁️ Reality Show' : cat === 'Notícias' ? '📰 Notícias' : cat === 'Infantil' ? '🎈 Infantil' : '📺 ' + cat}
                  </button>
                ))}
              </div>

              {/* IPTV grid categorized */}
              {filteredLiveChannels.length > 0 ? (
                <div className="space-y-10">
                  {/* If filter category is 'all', group by categories professionally */}
                  {activeIptvCategory === 'all' ? (
                    ['Esportes', 'Filmes e Séries', 'Reality Show', 'Canais Abertos', 'Variedades', 'Notícias', 'Infantil'].map((category) => {
                      const categoryChannels = filteredLiveChannels.filter(c => c.category === category);
                      if (categoryChannels.length === 0) return null;
                      return (
                        <div key={category} className="space-y-4">
                          <h3 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-brand pl-3 flex items-center gap-2">
                            <span>
                              {category === 'Esportes' ? '⚽' : category === 'Filmes e Séries' ? '🎬' : category === 'Reality Show' ? '👁️' : category === 'Canais Abertos' ? '📺' : category === 'Variedades' ? '🎭' : category === 'Notícias' ? '📰' : '🎈'}
                            </span>
                            <span>{category}</span>
                            <span className="text-xs text-neutral-500 font-mono">({categoryChannels.length})</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {categoryChannels.map((channel) => (
                              <motion.div
                                key={channel.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => handlePlayChannel(channel)}
                                className="group cursor-pointer select-none rounded-xl bg-[#09090D] hover:bg-[#12121A] border border-white/5 hover:border-brand/40 p-4 flex items-center justify-between text-left transition-all duration-300 relative overflow-hidden shadow-md hover:scale-[1.02]"
                              >
                                {/* Left Side: Broadcast Info and Name */}
                                <div className="flex items-center gap-3 min-w-0 z-10">
                                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 border border-brand/20 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                                    <Tv className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-black text-white group-hover:text-brand transition-colors block truncate pr-1 pb-0.5">
                                      {channel.name}
                                    </h4>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/10 leading-none">
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                      {channel.category}
                                    </span>
                                  </div>
                                </div>

                                {/* Right Side: Active Play Icon */}
                                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-brand group-hover:text-white flex items-center justify-center text-neutral-400 transition-all flex-shrink-0 border border-white/5 group-hover:border-transparent z-10">
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                </div>

                                {/* Accent glow bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300 pointer-events-none" />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredLiveChannels.map((channel) => (
                        <motion.div
                          key={channel.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handlePlayChannel(channel)}
                          className="group cursor-pointer select-none rounded-xl bg-[#09090D] hover:bg-[#12121A] border border-white/5 hover:border-brand/40 p-4 flex items-center justify-between text-left transition-all duration-300 relative overflow-hidden shadow-md hover:scale-[1.02]"
                        >
                          {/* Left Side: Broadcast Info and Name */}
                          <div className="flex items-center gap-3 min-w-0 z-10">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 border border-brand/20 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                              <Tv className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-white group-hover:text-brand transition-colors block truncate pr-1 pb-0.5">
                                {channel.name}
                              </h4>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/10 leading-none">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                {channel.category}
                              </span>
                            </div>
                          </div>

                          {/* Right Side: Active Play Icon */}
                          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-brand group-hover:text-white flex items-center justify-center text-neutral-400 transition-all flex-shrink-0 border border-white/5 group-hover:border-transparent z-10">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>

                          {/* Accent glow bar */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300 pointer-events-none" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-neutral-500 text-sm">Nenhum canal ao vivo encontrado na categoria "{activeIptvCategory}".</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW: WATCHLIST (MINHA LISTA) */}
          {currentView === 'mylist' && (
            <div id="mylist-view" className="pt-28 px-6 lg:px-12 pb-32 animate-fade-in space-y-8 min-h-screen">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-display mb-3 flex items-center gap-3">
                  <Heart className="w-9 h-9 text-brand fill-brand" />
                  <span>Meus Favoritos</span>
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                  Gerencie rapidamente as produções cinematográficas e episódios de séries de TV que estão agendados no seu radar de streaming.
                </p>
              </div>

              {watchlist.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
                  <AnimatePresence mode="popLayout">
                    {watchlist.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -15 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MediaCard 
                          item={item} 
                          onClick={openMediaDetails} 
                          isFavorite={true} 
                          onToggleFavorite={(e, item) => handleToggleWatchlist(item)} 
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-400 select-none">
                  <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/25 flex items-center justify-center mb-5 animate-pulse">
                    <Heart className="w-8 h-8 text-brand" />
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight mb-1">Sua lista está vazia</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed">
                    Pesquise ou explore as recomendações de capas e toque no ícone de coração para guardar aqui para suas noites de cinema.
                  </p>
                  <button 
                    onClick={() => setCurrentView('home')}
                    className="bg-brand hover:bg-brand-hover text-white font-heavy text-xs px-6 py-3 rounded-full shadow-lg shadow-brand/20 transition-transform hover:scale-105 uppercase tracking-widest font-extrabold"
                  >
                    Explorar Títulos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: DEDICATED GLOBAL SEARCH */}
          {currentView === 'search' && (
            <div id="search-view" className="pt-28 px-6 lg:px-12 pb-32 animate-fade-in min-h-screen space-y-12">
              {/* Search HUD box */}
              <div className="max-w-xl mx-auto space-y-4">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase text-center font-display leading-none mb-1">
                  Pesquisar Catálogo
                </h2>
                <p className="text-xs text-neutral-400 text-center font-semibold mb-6">
                  Busque em tempo real por títulos, séries de TV, animes e produções originais.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Comece a digitar o nome de um título..."
                    autoFocus
                    className="w-full bg-[#0F0F14] border border-white/10 hover:border-white/20 focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-2xl py-4.5 pl-12 pr-6 text-sm font-bold outline-none transition-all duration-300 shadow-2xl text-white placeholder-neutral-500"
                  />
                  <Search className="w-5 h-5 text-neutral-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Recommended Genres Filters during empty query search */}
              {searchQuery.trim() === '' && (
                <div className="max-w-3xl mx-auto space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest leading-none">Gêneros e Categorias recomendadas</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentView('movies');
                          setSelectedMovieGenre(28);
                        }} 
                        className="p-4 bg-[#0F0F14] hover:bg-brand/10 hover:border-brand/40 border border-white/5 rounded-xl text-left text-xs font-black uppercase tracking-wider transition-all"
                      >
                        💥 Ação
                      </button>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentView('movies');
                          setSelectedMovieGenre(35);
                        }} 
                        className="p-4 bg-[#0F0F14] hover:bg-brand/10 hover:border-brand/40 border border-white/5 rounded-xl text-left text-xs font-black uppercase tracking-wider transition-all"
                      >
                        😂 Comédia
                      </button>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentView('movies');
                          setSelectedMovieGenre(27);
                        }} 
                        className="p-4 bg-[#0F0F14] hover:bg-brand/10 hover:border-brand/40 border border-white/5 rounded-xl text-left text-xs font-black uppercase tracking-wider transition-all"
                      >
                        💀 Terror
                      </button>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentView('movies');
                          setSelectedMovieGenre(10749);
                        }} 
                        className="p-4 bg-[#0F0F14] hover:bg-brand/10 hover:border-brand/40 border border-white/5 rounded-xl text-left text-xs font-black uppercase tracking-wider transition-all"
                      >
                        ❤️ Romance
                      </button>
                    </div>
                  </div>

                  {/* Fast shortcut keywords searches */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest leading-none">Buscas Populares</h3>
                    <div className="flex flex-wrap gap-2.5">
                      <button 
                        onClick={() => setSearchQuery('Limite Final')} 
                        className="bg-brand/10 hover:bg-brand/20 px-4.5 py-2 rounded-full text-xs font-extrabold text-brand transition-all border border-brand/20 uppercase tracking-wider"
                      >
                        🔥 Limite Final (Exclusivo)
                      </button>
                      {['Avatar', 'Breaking Bad', 'Wandinha', 'Duna', 'Interestelar', 'Batman'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-xs font-extrabold text-neutral-300 transition-all border border-white/5"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Rendering query search results in real time */}
              {searchQuery.trim() !== '' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-white/5 pb-2 uppercase tracking-wide">
                    <Play className="text-brand w-4 h-4" />
                    <span>Resultados para "{searchQuery}"</span>
                  </h3>

                  {searchLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                      <p className="text-xs text-neutral-400 font-bold mt-4 tracking-widest uppercase">Pesquisando no Acervo...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
                      {searchResults.map(item => (
                        <MediaCard key={item.id} item={item} onClick={openMediaDetails} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center text-neutral-500 text-sm">
                      Nenhum filme ou série de TV correspondente aos termos de busca foi localizado.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: PROFILE (PERFIL) */}
          {currentView === 'profile' && currentUser && (
            <div id="profile-view" className="pt-28 px-6 lg:px-12 pb-32 animate-fade-in min-h-screen space-y-12">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Profile Card Summary Left column */}
                <div className="lg:col-span-4 bg-[#0B0B0E] border border-white/5 rounded-3xl p-6 space-y-8 relative overflow-hidden group shadow-2xl animate-fade-in">
                  {/* Subtle decorations */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* User profile picture circular avatar */}
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-brand/40 shadow-xl relative bg-neutral-900">
                        {currentUser.foto_url === 'METAPLAY_LOGO' ? (
                          <div className="w-full h-full bg-gradient-to-br from-[#FF5A00] to-[#992C00] flex items-center justify-center p-4 select-none">
                            <svg className="w-full h-full text-white" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M40 170V60C40 43.4315 53.4315 30 70 30C86.5685 30 100 43.4315 100 60V140C100 156.569 113.431 170 130 170C146.569 170 160 156.569 160 140V30H140V140C140 145.523 135.523 150 130 150C124.477 150 120 145.523 120 140V60C120 32.3858 97.6142 10 70 10C42.3858 10 20 32.3858 20 60V170H40Z" fill="currentColor"/>
                              <path d="M120 135L160 170H185L140 131L120 135Z" fill="currentColor"/>
                            </svg>
                          </div>
                        ) : currentUser.foto_url ? (
                          <img 
                            src={currentUser.foto_url} 
                            alt={currentUser.nome_usuario} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand/20 text-brand font-black text-2xl uppercase">
                            {currentUser.nome_usuario.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      {(currentUser.pin === '090320' || currentUser.pin === '041214') && (
                        <span className="absolute -bottom-1 -right-1 bg-[#0095F6] text-white p-1 rounded-full shadow-lg border-2 border-[#0B0B0E] flex items-center justify-center" title="Perfil Verificado Oficial">
                          <svg className="w-3 h-3 text-white fill-none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <h2 className="text-xl font-black text-white font-display tracking-tight uppercase leading-none flex items-center gap-1.5">
                          {currentUser.nome_usuario}
                          {(currentUser.pin === '090320' || currentUser.pin === '041214') && (
                            <span className="bg-[#0095F6] text-white p-0.5 rounded-full shadow-lg flex items-center justify-center w-4 h-4" title="Perfil Verificado">
                              <svg className="w-2.5 h-2.5 text-white fill-none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          )}
                        </h2>
                      </div>
                      
                      <p className="text-[10px] text-neutral-500 font-mono">ID DA CONTA: #{currentUser.id}</p>
                    </div>
                  </div>

                  {/* High Contrast TikTok/Bento Stats row */}
                  <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-white/5">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-2xl font-black text-white font-display leading-none">{continueWatching.length}</p>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">Assistidos</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-2xl font-black text-brand font-display leading-none">{republishedList.length}</p>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">Republicações</p>
                    </div>
                  </div>

                  {/* Inline Profile Modifier */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block">Trocar Nome de Usuário</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Novo nome..."
                        className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30 text-white placeholder-neutral-500"
                      />
                      <button 
                        onClick={handleUpdateName}
                        className="bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>

                  {/* Logout/Account Switch Action */}
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        setCurrentUser(null);
                        localStorage.removeItem('metaplay_current_user');
                        setIsAuthorized(false);
                        setCurrentView('home');
                        showNotification('Sessão encerrada com sucesso.');
                      }}
                      className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/10 rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Alternar Perfil / Sair</span>
                    </button>
                  </div>

                </div>

                {/* Right Column details (Republicações & Search user fields) */}
                <div className="lg:col-span-8 space-y-12">
                  
                  {/* SEARCH USERS SECTION */}
                  <div className="bg-[#0B0B0E] border border-white/5 p-6 rounded-3xl space-y-6">
                    <div>
                      <h3 className="text-md font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Search className="w-4 h-4 text-brand" />
                        <span>Buscar Amigos por ID</span>
                      </h3>
                      <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                        Pesquise outros inscritos pelo ID exclusivo da conta deles para inspecionar o avatar, o nome e as capas de filmes que eles republicaram no perfil deles!
                      </p>
                    </div>

                    <form onSubmit={handleSearchUserById} className="flex gap-2.5 max-w-md">
                      <input 
                        type="text"
                        value={searchUserQuery}
                        onChange={(e) => setSearchUserQuery(e.target.value)}
                        placeholder="Digite o ID numérico da conta..."
                        className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-xs font-bold focus:border-brand focus:outline-none text-white placeholder-neutral-500"
                      />
                      <button 
                        type="submit"
                        disabled={searchUserLoading}
                        className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-heavy text-xs px-6 py-3 rounded-2xl transition-colors uppercase tracking-widest font-black"
                      >
                        {searchUserLoading ? 'Buscando...' : 'Buscar'}
                      </button>
                    </form>

                    {searchUserError && (
                      <p className="text-xs text-red-500 font-bold">{searchUserError}</p>
                    )}

                    {/* Searched Friend result display box */}
                    {searchedUser && (
                      <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-[#0095F6]/30 bg-neutral-900 relative">
                              {searchedUser?.foto_url === 'METAPLAY_LOGO' ? (
                                <div className="w-full h-full bg-gradient-to-br from-[#FF5A00] to-[#992C00] flex items-center justify-center p-2.5 select-none">
                                  <svg className="w-full h-full text-white" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M40 170V60C40 43.4315 53.4315 30 70 30C86.5685 30 100 43.4315 100 60V140C100 156.569 113.431 170 130 170C146.569 170 160 156.569 160 140V30H140V140C140 145.523 135.523 150 130 150C124.477 150 120 145.523 120 140V60C120 32.3858 97.6142 10 70 10C42.3858 10 20 32.3858 20 60V170H40Z" fill="currentColor"/>
                                    <path d="M120 135L160 170H185L140 131L120 135Z" fill="currentColor"/>
                                  </svg>
                                </div>
                              ) : searchedUser.foto_url ? (
                                <img 
                                  src={searchedUser.foto_url} 
                                  alt={searchedUser.nome_usuario} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-brand/10 text-brand font-bold text-lg">
                                  {searchedUser.nome_usuario?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                            {(searchedUser.pin === '090320' || searchedUser.pin === '041214') && (
                              <span className="absolute -bottom-1 -right-1 bg-[#0095F6] text-white p-0.5 rounded-full shadow-lg border-2 border-[#121214] flex items-center justify-center" title="Verificado">
                                <svg className="w-2.5 h-2.5 text-white fill-none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                                {searchedUser.nome_usuario}
                                {(searchedUser.pin === '090320' || searchedUser.pin === '041214') && (
                                  <span className="bg-[#0095F6] text-white p-0.5 rounded-full shadow-lg flex items-center justify-center w-3.5 h-3.5 animate-fade-in" title="Verificado">
                                    <svg className="w-2 h-2 text-white fill-none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </span>
                                )}
                              </h4>
                            </div>
                            <p className="text-[10px] text-neutral-500 font-mono">CONTA ID: #{searchedUser.id}</p>
                          </div>
                        </div>

                        {/* Friend's Republicações covers list */}
                        <div className="space-y-3.5 pt-4 border-t border-white/5">
                          <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <span>🔄 Indicações Republicadas por {searchedUser.nome_usuario}</span>
                          </h5>
                          
                          {searchedUserRepublished.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
                              {searchedUserRepublished.map((m) => (
                                <div 
                                  key={m.id}
                                  onClick={() => openMediaDetails(m)}
                                  className="aspect-[2/3] rounded-xl overflow-hidden border border-white/5 hover:border-brand/40 cursor-pointer relative group transition-all"
                                >
                                  <img 
                                    src={m.id === 999999 ? (m.poster_url || undefined) : getMediaImageUrl(m.poster_path)}
                                    alt={m.title || m.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2.5 transition-opacity">
                                    <p className="text-[10px] font-black text-white truncate">{m.title || m.name}</p>
                                    <span className="text-[8px] text-brand uppercase font-extrabold tracking-wider mt-0.5 inline-flex items-center gap-0.5">
                                      <Play className="w-2.5 h-2.5 fill-brand text-brand" />
                                      Assistir
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500 italic">Este usuário ainda não republicou nenhuma indicação no perfil.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTIVE USER'S OWN REPUBLICAÇÕES (TIKTOK STYLE GALLERY) */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-brand rounded-full"></span>
                        <span>Minhas Republicações (TikTok Style)</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Estes são os títulos que você gostou e republicou. Elas estarão visíveis para toda a rede quando buscarem pelo ID da sua conta!
                      </p>
                    </div>

                    {republishedList.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                        {republishedList.map((m) => (
                          <div 
                            key={m.id}
                            onClick={() => openMediaDetails(m)}
                            className="aspect-[2/3] bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 hover:border-brand/40 cursor-pointer relative group transition-all duration-300 hover:-translate-y-1"
                          >
                            <img 
                              src={m.id === 999999 ? (m.poster_url || undefined) : getMediaImageUrl(m.poster_path)}
                              alt={m.title || m.name}
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 transition-opacity duration-300">
                              <p className="text-xs font-black text-white leading-tight truncate">{m.title || m.name}</p>
                              <span className="text-[9px] text-brand uppercase font-extrabold tracking-widest mt-1.5 flex items-center gap-1">
                                <Play className="w-2.5 h-2.5 fill-brand text-brand" />
                                Reproduzir
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-white/10 rounded-2xl py-12 flex flex-col items-center justify-center text-center text-neutral-500">
                        <svg className="w-10 h-10 text-neutral-600 mb-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 01-2.8-.7l-1.46 1.46A7.93 7.93 0 0012 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46A7.93 7.93 0 0012 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
                        </svg>
                        <p className="text-xs font-bold text-white">Nenhum título republicado ainda</p>
                        <p className="text-[10px] text-neutral-500 max-w-xs mt-1 leading-relaxed">
                          Toque em qualquer filme ou série de TV do portal e clique no botão "Republicar no Perfil" para divulgá-lo aqui!
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* 5. MULTI-MEDIA DETAILS MODAL HUD (SINOPSE, EPISODES, ELENCO) */}
      <DetailsModal 
        itemId={selectedMediaDetail ? selectedMediaDetail.id : null}
        itemType={selectedMediaType}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onPlay={(item, season, episode) => {
          setIsDetailsOpen(false);
          handlePlayMedia(item, season, episode);
        }}
        isInWatchlist={selectedMediaDetail ? watchlist.some(w => w.id === selectedMediaDetail.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
        isRepublished={selectedMediaDetail ? republishedList.some(r => r.id === selectedMediaDetail.id) : false}
        onToggleRepublish={handleToggleRepublish}
      />

      {/* 6. IMMERSIVE DISTRACTION-FREE IFRAME VIDEO PLAYER OVERLAY */}
      <PurePlayer 
        isOpen={activePlayItem !== null || activeLiveChannel !== null}
        iframeUrl={assemblePlayerLink()}
        onClose={() => {
          setActivePlayItem(null);
          setActiveLiveChannel(null);
        }}
        title={playerTitle}
        subtitle={playerSubtitle}
      />

      {/* 8. ROLETA RUSSA SURPRISE SELECTION OVERLAY */}
      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        onPlay={(item) => {
          setIsRouletteOpen(false);
          handlePlayMedia(item);
        }}
        onViewDetails={(item) => {
          setIsRouletteOpen(false);
          openMediaDetails(item);
        }}
        allTrending={trendingAll}
      />

      {/* 7. QUICK INTEGRATED FLOATING PERSISTENT NOTIFICATIONS SYSTEM */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-6 right-6 z-50 glassmorphic py-3.5 px-6 rounded-2xl border border-brand/40 shadow-2xl shadow-brand/10 text-white"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand" />
              <span className="text-xs md:text-sm font-black tracking-wide leading-none select-none">
                {notification.text}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
