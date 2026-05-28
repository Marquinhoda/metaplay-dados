import { useState, useEffect } from 'react';
import { 
  X, Heart, Play, Clock, Star, Layers, ChevronDown, AlignLeft, Users, Calendar, ArrowLeft
} from 'lucide-react';
import { MediaItem, CastMember, Episode } from '../types';
import { 
  fetchDetails, fetchCredits, fetchSeasonDetails, getMediaImageUrl, getPlayerUrl 
} from '../api';
import { motion, AnimatePresence } from 'motion/react';

interface DetailsModalProps {
  itemId: number | null;
  itemType: 'movie' | 'tv';
  isOpen: boolean;
  onClose: () => void;
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  isRepublished?: boolean;
  onToggleRepublish?: (item: MediaItem) => void;
}

export default function DetailsModal({
  itemId,
  itemType,
  isOpen,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
  isRepublished,
  onToggleRepublish
}: DetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<MediaItem | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  
  // Series Specific States
  const [seasonsCount, setSeasonsCount] = useState<number>(0);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Load details & cast
  useEffect(() => {
    if (!isOpen || !itemId) return;

    async function loadData() {
      setLoading(true);
      try {
        const detailData = await fetchDetails(itemId!, itemType);
        setDetails(detailData);

        // Fetch cast
        if (itemId !== 999999) {
          const castData = await fetchCredits(itemId!, itemType);
          setCast(castData);
          
          // Season setup for TV shows
          if (itemType === 'tv') {
            const numSeasons = (detailData as any).number_of_seasons || 1;
            setSeasonsCount(numSeasons);
            setSelectedSeason(1);
            loadEpisodes(itemId!, 1);
          }
        } else {
          setCast([]);
        }
      } catch (err) {
        console.error('Error loading modal info:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, itemId, itemType]);

  // Handle season selector changes
  async function loadEpisodes(seriesId: number, seasonNum: number) {
    setEpisodesLoading(true);
    try {
      const epData = await fetchSeasonDetails(seriesId, seasonNum);
      setEpisodes(epData);
    } catch (e) {
      console.error('Failed to load season episodes:', e);
    } finally {
      setEpisodesLoading(false);
    }
  }

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    if (itemId) {
      loadEpisodes(itemId, seasonNum);
    }
  };

  if (!isOpen) return null;

  const isExclusive = itemId === 999999;
  const title = details?.title || details?.name || 'Carregando...';
  const rating = details?.vote_average ? details.vote_average.toFixed(1) : '9.0';
  const year = details?.release_date
    ? details.release_date.split('-')[0]
    : details?.first_air_date
    ? details.first_air_date.split('-')[0]
    : 'N/A';
    
  // Format runtime nicely
  const duration = details?.runtime 
    ? `${details.runtime} min` 
    : itemType === 'tv' 
    ? 'Série Completa' 
    : 'Curta-Metragem';

  const backdropUrl = isExclusive 
    ? (details?.backdrop_url || undefined) 
    : getMediaImageUrl(details?.backdrop_path, 'original');
    
  const posterUrl = isExclusive 
    ? (details?.poster_url || undefined) 
    : getMediaImageUrl(details?.poster_path);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#050507]/95 backdrop-blur-2xl overflow-y-auto"
      >
        <div className="relative w-full min-h-screen flex flex-col pt-24 pb-16 px-4 md:px-12 max-w-5xl mx-auto">
          
          {/* Top Sticky Header */}
          <div className="absolute top-6 left-4 right-4 z-50 flex items-center justify-between">
            <button 
              onClick={onClose} 
              className="bg-black/80 hover:bg-brand/20 border border-white/10 hover:border-brand/40 text-white rounded-full px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-brand" /> 
              <span>Voltar ao METAPLAY</span>
            </button>
            
            {details && (
              <button 
                onClick={() => onToggleWatchlist(details)}
                className={`p-2.5 rounded-full border transition-all ${
                  isInWatchlist 
                    ? 'bg-brand/20 border-brand/50 text-brand' 
                    : 'bg-black/80 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWatchlist ? 'fill-brand' : ''}`} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <div className="relative w-12 h-12">
                <div className="w-12 h-12 border-4 border-brand/20 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-xs text-neutral-400 font-bold tracking-widest uppercase mt-4">Sincronizando Metadados...</p>
            </div>
          ) : (
            details && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-4"
              >
                {/* Lateral Poster Cover */}
                <div className="md:col-span-4 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative group">
                  <img 
                    src={posterUrl} 
                    alt="Capa Detalhada" 
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                    <button 
                      onClick={() => onPlay(details)}
                      className="bg-brand text-white rounded-full p-5 hover:scale-110 transition-transform shadow-xl shadow-brand/35"
                    >
                      <Play className="w-8 h-8 fill-white ml-1 text-white" />
                    </button>
                  </div>
                </div>

                {/* Media Details Content Column */}
                <div className="md:col-span-8 space-y-6">
                  {/* Metadata labels */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded text-xs border border-emerald-400/20">
                      <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                      {rating} ★
                    </span>
                    <span className="text-neutral-300 text-xs bg-white/5 px-2.5 py-1 rounded flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {year}
                    </span>
                    <span className="text-neutral-300 text-xs bg-white/5 px-2.5 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {duration}
                    </span>
                    <span className="text-brand text-[10px] font-extrabold uppercase tracking-widest bg-brand/10 border border-brand/25 px-2.5 py-1 rounded">
                      {isExclusive ? 'Exclusivo' : itemType === 'tv' ? 'Série' : 'Filme'}
                    </span>
                  </div>

                  {/* Media Name */}
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase font-display">
                    {title}
                  </h1>

                  {/* Genres display */}
                  {details.genres && details.genres.length > 0 && (
                    <p className="text-xs text-brand font-bold uppercase tracking-widest">
                      {details.genres.map(g => g.name).join('  •  ')}
                    </p>
                  )}

                   {/* Primary Play and Republicar Buttons Row */}
                  <div className="flex flex-wrap items-center gap-3.5">
                    <button 
                      onClick={() => onPlay(details)}
                      className="bg-brand hover:bg-brand-hover text-white font-black px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl shadow-brand/25 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-white text-white" />
                      <span>ASSISTIR AGORA (PLAY DIRETO)</span>
                    </button>

                    {onToggleRepublish && (
                      <button 
                        onClick={() => onToggleRepublish(details)}
                        title="Republicar no meu Perfil (TikTok Style)"
                        type="button"
                        className={`font-black px-6 py-4 rounded-full flex items-center gap-2 border transition-all hover:scale-105 active:scale-95 select-none ${
                          isRepublished 
                            ? 'bg-red-600/20 border-red-500/50 text-red-500 shadow-lg shadow-red-500/10' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-[#0f0f12]'
                        }`}
                      >
                        <svg className={`w-4.5 h-4.5 ${isRepublished ? 'fill-red-500 animate-pulse' : 'text-neutral-400'}`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 01-2.8-.7l-1.46 1.46A7.93 7.93 0 0012 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46A7.93 7.93 0 0012 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
                        </svg>
                        <span className="text-xs">{isRepublished ? 'Republicado (No Perfil)' : 'Republicar no Perfil'}</span>
                      </button>
                    )}
                  </div>

                  {/* Overview Panel */}
                  <div className="border-t border-white/5 pt-6 space-y-3">
                    <h3 className="text-sm font-extrabold text-neutral-300 flex items-center gap-2 uppercase tracking-wider">
                      <AlignLeft className="text-brand w-4 h-4" />
                      <span>Sinopse Oficial</span>
                    </h3>
                    
                    {isExclusive ? (
                      <div 
                        className="text-sm text-neutral-300 leading-relaxed space-y-3"
                        dangerouslySetInnerHTML={{ __html: details.overview }}
                      />
                    ) : (
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {details.overview || 'Nenhuma sinopse oficial em português disponível para este título no momento.'}
                      </p>
                    )}
                  </div>

                  {/* Series Episodes & Seasons list (Only for TV Shows) */}
                  {itemType === 'tv' && seasonsCount > 0 && (
                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <h3 className="text-sm font-extrabold text-neutral-300 flex items-center gap-2 uppercase tracking-wider">
                        <Layers className="text-brand w-4 h-4" />
                        <span>Escolher Episódio</span>
                      </h3>

                      {/* Dropdown Season Selector */}
                      <div className="relative max-w-xs">
                        <select 
                          value={selectedSeason}
                          onChange={(e) => handleSeasonChange(Number(e.target.value))}
                          className="w-full bg-surface-card border border-white/5 hover:border-white/20 text-white rounded-xl py-3 pl-4 pr-10 text-xs font-bold outline-none cursor-pointer appearance-none transition-all shadow-md"
                        >
                          {Array.from({ length: seasonsCount }, (_, i) => (
                            <option key={i+1} value={i+1}>Temporada {i+1}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>

                      {/* Episodes horizontal/vertical row list */}
                      {episodesLoading ? (
                        <div className="py-6 flex items-center gap-2 text-xs text-neutral-500 font-semibold">
                          <span className="w-4 h-4 border-2 border-brand/30 border-t-brand animate-spin rounded-full"></span>
                          <span>Carregando episódios...</span>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scroll grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {episodes.map((ep) => (
                            <div 
                              key={ep.id}
                              onClick={() => onPlay(details, selectedSeason, ep.episode_number)}
                              className="group/ep bg-surface-card hover:bg-[#15151e] border border-white/5 hover:border-brand/30 p-3 rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-between"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-brand block mb-1">
                                  EP. {ep.episode_number}
                                </span>
                                <div className="p-1 px-2 text-[9px] bg-brand/10 text-brand font-black rounded uppercase flex items-center gap-0.5 opacity-0 group-hover/ep:opacity-100 transition-opacity">
                                  <Play className="w-2.5 h-2.5 fill-brand text-brand" /> PRO PLAY
                                </div>
                              </div>
                              <h4 className="text-xs font-bold text-white group-hover/ep:text-brand truncate transition-colors">
                                {ep.name || 'Episódio Sem Título'}
                              </h4>
                              <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-normal group-hover/ep:text-neutral-300">
                                {ep.overview || 'Nenhuma descrição disponível para este episódio.'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cast List (Or HTML for Limite Final) */}
                  <div className="border-t border-white/5 pt-6 space-y-3">
                    <h3 className="text-sm font-extrabold text-neutral-300 flex items-center gap-2 uppercase tracking-wider">
                      <Users className="text-brand w-4 h-4" />
                      <span>Elenco e Ficha Técnica</span>
                    </h3>
                    
                    {isExclusive && details.castHTML ? (
                      <div 
                        className="text-xs text-neutral-400 leading-relaxed custom-cast-block"
                        dangerouslySetInnerHTML={{ __html: details.castHTML }}
                      />
                    ) : cast.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {cast.map(actor => (
                          <div key={actor.id} className="bg-surface-card border border-white/5 p-2 rounded-lg flex items-center gap-2.5">
                            {actor.profile_path ? (
                              <img 
                                src={getMediaImageUrl(actor.profile_path)} 
                                alt={actor.name} 
                                className="w-8 h-8 rounded-full object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-[10px] font-bold text-brand">
                                {actor.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-neutral-200 truncate leading-none mb-0.5">{actor.name}</p>
                              <p className="text-[10px] text-neutral-400 truncate leading-none">{actor.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500 italic">Informações de elenco não disponíveis.</p>
                    )}
                  </div>

                </div>
              </motion.div>
            )
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
