import { useState, useEffect } from 'react';
import { ArrowLeft, Play, RefreshCw, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PurePlayerProps {
  isOpen: boolean;
  iframeUrl: string | null;
  onClose: () => void;
  title: string;
  subtitle?: string;
}

export default function PurePlayer({
  isOpen,
  iframeUrl,
  onClose,
  title,
  subtitle
}: PurePlayerProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // Update current player URL dynamically when the iframeUrl prop changes
  useEffect(() => {
    if (!isOpen) return;
    setIframeLoading(true);
    setCurrentUrl(iframeUrl || '');
  }, [isOpen, iframeUrl]);

  if (!isOpen || !currentUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col"
      >
        {/* Floating Minimalist Responsive Navigation Header with back and reload buttons */}
        <div className="bg-gradient-to-b from-black/95 to-transparent p-4 z-50 flex items-center justify-between gap-4 pointer-events-none w-full">
          
          <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick={onClose}
              className="bg-black/85 hover:bg-brand/20 border border-white/10 hover:border-brand/40 text-white rounded-full px-4 py-2.5 transition-all flex items-center gap-2 shadow-xl shadow-black/80 font-semibold text-xs"
            >
              <ArrowLeft className="w-4 h-4 text-brand" /> 
              <span>Voltar</span>
            </button>

            {/* Title / Subtitle info tag */}
            <div className="text-left max-w-xs md:max-w-md">
              <h3 className="text-white text-xs font-black tracking-wider uppercase truncate leading-none mb-1">{title}</h3>
              {subtitle && <p className="text-[10px] text-neutral-400 font-semibold truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Quick Refresh Active Player Button */}
            <button
              onClick={() => { 
                setIframeLoading(true); 
                const tmp = currentUrl; 
                setCurrentUrl(''); 
                setTimeout(() => setCurrentUrl(tmp), 150); 
              }}
              className="p-2 bg-black/80 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 rounded-xl transition-colors shadow-xl"
              title="Recarregar Player"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Player Container */}
        <div className="flex-1 w-full relative bg-black">
          
          {/* Animated Connecting Spinner Layer */}
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black px-6 text-center select-none">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 border-4 border-brand/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-5 h-5 text-brand fill-brand ml-0.5 animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-brand tracking-[0.2em] font-black uppercase mt-6 animate-pulse">
                Iniciando Reprodução...
              </p>
              <div className="mt-4 max-w-sm">
                <h3 className="text-sm font-semibold text-white truncate leading-none mb-1.5">{title}</h3>
                {subtitle && <p className="text-[11px] text-neutral-400 font-medium truncate">{subtitle}</p>}
              </div>
            </div>
          )}

          {/* Real responsive iframe player */}
          <iframe
            src={currentUrl}
            title={`METAPLAY PLAYER - ${title}`}
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full relative z-0 border-none bg-black"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          ></iframe>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
