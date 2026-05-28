import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Star, RotateCcw, Sparkles, Film, ArrowRight, Volume2, VolumeX, Info
} from 'lucide-react';
import { MediaItem, WatchedItem } from '../types';
import { getMediaImageUrl } from '../api';
import { motion, AnimatePresence } from 'motion/react';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: (item: MediaItem) => void;
  onViewDetails: (item: MediaItem) => void;
  allTrending: MediaItem[];
}

export default function RouletteModal({ 
  isOpen, 
  onClose, 
  onPlay, 
  onViewDetails,
  allTrending 
}: RouletteModalProps) {
  const [spinState, setSpinState] = useState<'idle' | 'spinning' | 'finished'>('idle');
  const [candidates, setCandidates] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [winner, setWinner] = useState<MediaItem | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<string>('Pronto para rodar');

  // To make the spinner feel authentic and long, we construct a long array of items
  const [spinnerList, setSpinnerList] = useState<MediaItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Status updates during spinning
  const statusPhrases = [
    'Lendo histórico de reprodução...',
    'Cruzando preferências...',
    'Calculando afinidade estética...',
    'Alinhando ejetores de tédio...',
    'Filtrando avaliações altas...',
    'Localizando pérolas secretas...',
    'Quase lá...',
    'Sintonizando!'
  ];

  // Tick Sound utility (CRAFTSMANSHIP trigger)
  const playTick = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.07);
      
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.07);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.07);
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  // Victory Fanfare sound when winner lands
  const playVictory = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playTone(523.25, 0, 0.15); // C5
      playTone(659.25, 0.12, 0.15); // E5
      playTone(783.99, 0.24, 0.25); // G5
      playTone(1046.50, 0.4, 0.4); // C6
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  // Main generator that selects high-grade items matching history
  const buildSurpriseEngine = () => {
    try {
      // 1. Recover Continue watching as preference data
      const stored = localStorage.getItem('metaplay_continue');
      let watchedHistory: WatchedItem[] = [];
      if (stored) {
        watchedHistory = JSON.parse(stored);
      }

      // 2. Map of highly active genre occurrences
      // TMDB Standard Genres: Action: 28, Comedy: 35, Animation: 16, Drama: 18, SciFi: 878, Thriller: 53
      // Since watched history might only contain TMId and title, we'll try to analyze historical titles or fallback appropriately
      // For instance, count words, or simply use the trending/catalog cached list.
      // We will look through all available trending/catalog options in AllTrending
      let basePool = [...allTrending].filter(i => i.id !== 999999); // bypass our static placeholder
      if (basePool.length === 0) {
        // Safe fallbacks in case trending dataset is empty yet
        basePool = allTrending;
      }

      // Find favorite category from watched history if any
      let preferredGenreId: number | null = null;
      if (watchedHistory.length > 0) {
        // Count typical match in basePool
        const genreCounts: Record<number, number> = {};
        watchedHistory.forEach(w => {
          const matchItem = basePool.find(p => p.id === w.id || p.title === w.title);
          if (matchItem && matchItem.genre_ids) {
            matchItem.genre_ids.forEach(gid => {
              genreCounts[gid] = (genreCounts[gid] || 0) + 1;
            });
          }
        });

        // Resolve highest counted genre
        let maxCount = 0;
        Object.entries(genreCounts).forEach(([gid, count]) => {
          if (count > maxCount) {
            maxCount = count;
            preferredGenreId = Number(gid);
          }
        });
      }

      // 3. Filter basePool for high-scoring items (rating > 7.0 or best candidates)
      let matchedCandidates = basePool.filter(item => item.vote_average >= 7.0);

      // If a preference is available, prioritize elements belonging to that category
      if (preferredGenreId !== null) {
        const preferredId = preferredGenreId as number;
        const matchingGenrePool = matchedCandidates.filter(item => 
          item.genre_ids?.includes(preferredId)
        );
        if (matchingGenrePool.length >= 3) {
          matchedCandidates = matchingGenrePool;
        }
      }

      // Ensure we have at least 5 different elegant items from basePool to fill candidates
      if (matchedCandidates.length < 5) {
        matchedCandidates = basePool.length > 5 ? basePool : allTrending;
      }

      // Shuffle and take 6 ultimate options
      const shuffled = [...matchedCandidates].sort(() => Math.random() - 0.5);
      const chosenCandidates = shuffled.slice(0, Math.min(6, shuffled.length));
      
      setCandidates(chosenCandidates);

      // Select one ultimate winner out of the top candidates
      const chosenWinner = chosenCandidates[Math.floor(Math.random() * chosenCandidates.length)];
      setWinner(chosenWinner);

      // Create a long list for visual spinning action (38 elements)
      const listSize = 38;
      const spinList: MediaItem[] = [];

      // Create a large, shuffled pool using the entire basePool to ensure maximum variety and clear duplicate prevention
      let fillPool = [...basePool].filter(item => item.id !== chosenWinner.id).sort(() => Math.random() - 0.5);
      let poolIndex = 0;

      for (let i = 0; i < listSize; i++) {
        // Place the chosen winner exactly near the end (at index 32)
        if (i === 32) {
          spinList.push(chosenWinner);
        } else {
          if (fillPool.length === 0) {
            // Safe fallback if basePool is empty
            fillPool = [chosenWinner];
          }
          if (poolIndex >= fillPool.length) {
            fillPool = [...basePool].filter(item => item.id !== chosenWinner.id).sort(() => Math.random() - 0.5);
            poolIndex = 0;
          }

          let selected = fillPool[poolIndex];

          // Guarantee that adjacent and near-adjacent items are completely non-repeating
          let attempts = 0;
          while (
            (i > 0 && spinList[i - 1] && spinList[i - 1].id === selected.id) ||
            (i > 1 && spinList[i - 2] && spinList[i - 2].id === selected.id)
          ) {
            poolIndex++;
            if (poolIndex >= fillPool.length) {
              fillPool = [...basePool].filter(item => item.id !== chosenWinner.id).sort(() => Math.random() - 0.5);
              poolIndex = 0;
            }
            selected = fillPool[poolIndex];
            attempts++;
            if (attempts > 30) {
              break;
            }
          }

          spinList.push(selected);
          poolIndex++;
        }
      }

      setSpinnerList(spinList);
      setCurrentIndex(0);
      setSpinState('idle');
      setStatusText('Pronto para rodar');
    } catch (e) {
      console.error("Error setting up roulette context", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      buildSurpriseEngine();
    }
  }, [isOpen, allTrending]);

  // Monitor container width and listen to window resizes
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      setContainerWidth(scrollContainerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Adjust translation offset instantly based on active item index or state
  useEffect(() => {
    if (isOpen) {
      const activeCardWidth = 144; // 128px + 16px gap
      const centerOffset = containerWidth / 2 - 64;
      if (spinState === 'idle') {
        setTranslateX(centerOffset - (0 * activeCardWidth));
      } else if (spinState === 'finished') {
        setTranslateX(centerOffset - (32 * activeCardWidth));
      }
    }
  }, [isOpen, containerWidth, spinState]);

  // Synchronized Audio Sfx Ticks based on visual coordinate displacement
  useEffect(() => {
    let animId: number;
    let lastTickIndex = -1;
    
    if (spinState === 'spinning') {
      const activeCardWidth = 144;
      const centerOffset = containerWidth / 2 - 64;
      
      const monitorProgress = () => {
        if (trackRef.current) {
          const compStyle = window.getComputedStyle(trackRef.current);
          const matrix = compStyle.transform;
          if (matrix && matrix !== 'none') {
            let tx = 0;
            const values = matrix.split('(')[1].split(')')[0].split(',');
            if (values.length === 6) {
              tx = parseFloat(values[4]);
            } else if (values.length === 16) {
              tx = parseFloat(values[12]);
            }
            
            const currentIdx = Math.round((centerOffset - tx) / activeCardWidth);
            if (currentIdx !== lastTickIndex && currentIdx >= 0 && currentIdx < spinnerList.length) {
              lastTickIndex = currentIdx;
              playTick();
            }
          }
        }
        animId = requestAnimationFrame(monitorProgress);
      };
      animId = requestAnimationFrame(monitorProgress);
    }
    
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [spinState, containerWidth, spinnerList]);

  const performRouletteRoll = () => {
    if (spinState === 'spinning' || spinnerList.length === 0) return;
    setSpinState('spinning');
    setCurrentIndex(0);
    
    const activeCardWidth = 144;
    const centerOffset = containerWidth / 2 - 64;
    const targetIdx = 32;
    
    // Set target translate value which executes CPU/GPU composite transitions
    const targetTranslation = centerOffset - (targetIdx * activeCardWidth);
    setTranslateX(targetTranslation);
    
    // Periodic status phrases updates
    const phraseInterval = setInterval(() => {
      const phrase = statusPhrases[Math.floor(Math.random() * statusPhrases.length)];
      setStatusText(phrase);
    }, 800);

    // Timeout at the exact end of CSS transition (6s)
    setTimeout(() => {
      clearInterval(phraseInterval);
      setSpinState('finished');
      setCurrentIndex(32);
      setStatusText('🏆 Seleção Sintonizada com Sucesso!');
      playVictory();
    }, 6000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Absolute Backdrop Blur Overlay */}
      <div 
        onClick={() => spinState !== 'spinning' && onClose()}
        className="absolute inset-0 bg-black/92 backdrop-blur-xl z-0 transition-opacity"
      />

      <div className="relative z-10 w-full max-w-4xl bg-[#09090D] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/5 max-h-[92vh] flex flex-col">
        
        {/* Glowing Orange/Red Aesthetic Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-brand text-brand to-amber-500" />

        {/* Header HUD Row */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 animate-pulse">
              <Sparkles className="w-4 h-4 text-brand fill-brand" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-display flex items-center gap-1.5 leading-none">
                Roleta Russa <span className="text-brand">•</span> Modo Surpresa
              </h3>
              <p className="text-[10px] text-neutral-400 mt-0.5 font-semibold">Tire o tédio de escolher o prato do dia</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle button */}
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 border border-white/5 hover:border-white/10 rounded-xl text-neutral-400 hover:text-white transition-all bg-white/5 text-[10px] flex items-center gap-1"
              title="Alternar Som"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-brand" />
                  <span className="hidden sm:inline font-bold uppercase">Som Ativo</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-bold uppercase">Mudo</span>
                </>
              )}
            </button>

            {/* Escape button */}
            {spinState !== 'spinning' && (
              <button 
                onClick={onClose}
                className="p-2 border border-white/10 hover:border-brand/40 bg-white/5 text-white hover:text-brand rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
          
          {/* Status HUD indicator text */}
          <div className="text-center font-display">
            <motion.p 
              key={statusText}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs md:text-sm font-black text-brand tracking-widest uppercase leading-none"
            >
              {statusText}
            </motion.p>
          </div>

          {/* THE ROLLING WHEEL BOX */}
          <div className="relative flex flex-col items-center">
            
            {/* Top Indicator Triangle pointing down */}
            <div className="absolute top-0 z-20 -translate-y-[6px] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)]" />
            
            {/* Bottom Indicator Triangle pointing up */}
            <div className="absolute bottom-0 z-20 translate-y-[6px] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[14px] border-b-red-500 drop-shadow-[0_-2px_8px_rgba(239,68,68,0.5)]" />

            {/* Carousel track wrapper */}
            <div 
              ref={scrollContainerRef}
              className="w-full h-52 overflow-hidden relative border-y border-white/5 bg-[#040406] flex items-center no-scrollbar select-none"
            >
              <div 
                ref={trackRef}
                className="flex gap-4 py-4 w-max"
                style={{
                  transform: `translate3d(${translateX}px, 0, 0)`,
                  transition: spinState === 'spinning' ? 'transform 6s cubic-bezier(0.1, 0.85, 0.15, 1)' : 'none'
                }}
              >
                {spinnerList.map((item, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <div 
                      key={`${item.id}-${idx}`}
                      className={`relative flex-shrink-0 w-32 h-44 rounded-xl overflow-hidden transition-all duration-300 ${
                        isActive 
                          ? 'scale-110 border-2 border-red-500 ring-4 ring-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.25)] z-10' 
                          : 'opacity-45 scale-95 border border-white/5'
                      }`}
                    >
                      <img 
                        src={getMediaImageUrl(item.poster_path)} 
                        alt={item.title || item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        draggable="false"
                      />
                      {isActive && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1 px-2 text-[8px] font-black text-white text-center truncate">
                          {item.title || item.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Backdrop visual scanning horizontal line */}
            {spinState === 'spinning' && (
              <div className="absolute inset-y-0 w-0.5 bg-red-500/60 shadow-[0_0_15px_#EF4444] z-10 pointer-events-none" />
            )}
          </div>

          <div className="flex justify-center">
            {spinState === 'idle' && (
              <button
                onClick={performRouletteRoll}
                className="w-full max-w-sm py-4 bg-gradient-to-r from-red-600 via-brand to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-red-600/10 hover:shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-3.5"
              >
                <span>💥 GIRAR ROLETA SURPRESA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* INNER AREA: WINNER ANNOUNCEMENT SCREEN */}
          <AnimatePresence>
            {spinState === 'finished' && winner && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.4 }}
                className="bg-[#0D0D14] border border-white/5 rounded-2xl p-5 md:p-6 grid md:grid-cols-12 gap-6 items-start"
              >
                {/* Poster Artwork on grid */}
                <div className="md:col-span-4 relative group aspect-[2/3] w-full max-w-[200px] mx-auto md:max-w-none rounded-xl overflow-hidden bg-black/40 border border-white/5 shadow-xl">
                  <img 
                    src={getMediaImageUrl(winner.poster_path)} 
                    alt={winner.title || winner.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Rating Indicator */}
                  <div className="absolute top-3 left-3 bg-black/80 border border-white/10 backdrop-blur-md text-brand text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-brand fill-brand" />
                    <span>{winner.vote_average.toFixed(1)}</span>
                  </div>
                </div>

                {/* Info parameters */}
                <div className="md:col-span-8 flex flex-col h-full justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand/10 text-brand border border-brand/20 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Sua Jóia Rara Escolhida
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">
                        {winner.media_type === 'tv' ? '📺 Série de TV' : '🎬 Filme Premium'}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-white leading-tight font-display uppercase tracking-tight">
                      {winner.title || winner.name}
                    </h2>

                    <p className="text-neutral-300 text-xs leading-relaxed line-clamp-4">
                      {winner.overview || "Nenhum resumo técnico disponível em português para este título do acervo corporativo. Clique abaixo para assistir diretamente ou consultar a ficha."}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => onPlay(winner)}
                      className="bg-brand hover:bg-brand-hover text-white font-extrabold text-xs px-6 py-3.5 rounded-full flex items-center gap-2 shadow-lg shadow-brand/20 hover:shadow-brand/35 select-none uppercase tracking-wider transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>ASSISTIR AGORA DIRECT</span>
                    </button>

                    <button
                      onClick={() => onViewDetails(winner)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-xs px-5 py-3.5 rounded-full flex items-center gap-2 select-none uppercase tracking-wider transition-all border border-white/5"
                    >
                      <Info className="w-4 h-4" />
                      <span>Ver Ficha Técnica</span>
                    </button>

                    <button
                      onClick={buildSurpriseEngine}
                      className="p-3.5 border border-white/5 hover:border-white/15 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-all flex items-center justify-center"
                      title="Sortear mais uma vez"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
