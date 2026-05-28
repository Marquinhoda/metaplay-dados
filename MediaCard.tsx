import React from 'react';
import { Star, Play, Heart } from 'lucide-react';
import { MediaItem } from '../types';
import { getMediaImageUrl } from '../api';
import { motion } from 'motion/react';

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  key?: any;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, item: MediaItem) => void;
}

export default function MediaCard({ item, onClick, isFavorite = false, onToggleFavorite }: MediaCardProps) {
  const isExclusive = item.id === 999999;
  const title = item.title || item.name || 'Título sem Nome';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const year = item.release_date
    ? item.release_date.split('-')[0]
    : item.first_air_date
    ? item.first_air_date.split('-')[0]
    : 'N/A';

  // Extract poster path
  const posterUrl = isExclusive 
    ? (item.poster_url || undefined) 
    : getMediaImageUrl(item.poster_path);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4 }}
      onClick={() => onClick(item)}
      className="group relative cursor-pointer select-none rounded-xl overflow-hidden bg-surface-card border border-white/5 hover:border-brand/40 shadow-lg hover:shadow-brand/10 transition-all duration-300"
    >
      {/* Poster Aspect Ratio Frame */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface">
        <img
          src={posterUrl}
          alt={`Capa de ${title}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Floating Quick-Add Heart Button (Shows up on Desktop Hover + Instant touch response for swipe mobile) */}
        {onToggleFavorite && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e, item);
            }}
            className={`absolute top-2.5 right-2.5 z-30 p-2 rounded-full border backdrop-blur-md transition-all duration-300 shadow-xl ${
              isFavorite 
                ? 'bg-[#EF4444]/25 border-red-500/40 text-red-500' 
                : 'bg-black/75 border-white/10 text-neutral-400 opacity-100 md:opacity-0 group-hover:opacity-100 hover:text-red-500'
            }`}
            title={isFavorite ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
          >
            <Heart 
              className={`w-3.5 h-3.5 transition-all ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-300 hover:text-red-500'
              }`} 
            />
          </motion.button>
        )}

        {/* Exclusive Glowing Tag */}
        {isExclusive && (
          <div className="absolute top-2 left-2 z-10 bg-brand text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md shadow-lg shadow-brand/40 border border-brand/50">
            Exclusivo
          </div>
        )}

        {/* Hover overlay with play button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          {/* Action icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-brand rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-brand/40">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>

          {/* Metadata at footer of draft */}
          <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-between text-[11px] font-bold text-white">
              <span className="flex items-center gap-0.5 text-yellow-500">
                <Star className="w-3 w-3 fill-yellow-500 text-yellow-500" />
                {rating}
              </span>
              <span className="text-neutral-300">{year}</span>
            </div>
            <p className="text-xs font-bold text-white truncate leading-tight">{title}</p>
            <p className="text-[10px] text-brand uppercase tracking-wider font-extrabold">
              {item.media_type === 'tv' ? 'Série' : 'Filme'}
            </p>
          </div>
        </div>
      </div>

      {/* Visible metadata details on standard listing mobile layouts (always visible underneath card if needed, or keeping overlay) */}
      <div className="p-3 md:hidden">
        <p className="text-xs font-bold text-white truncate leading-none mb-1">{title}</p>
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold">
          <span className="flex items-center gap-0.5 text-yellow-500">
            <Star className="w-2.5 h-2.5 fill-yellow-500" /> {rating}
          </span>
          <span>{year}</span>
        </div>
      </div>
    </motion.div>
  );
}
