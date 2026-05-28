import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Sparkles, ShieldCheck } from 'lucide-react';

interface SplashProps {
  show: boolean;
  onFinish: () => void;
}

export default function Splash({ show, onFinish }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (show) {
      // Simulate loading progress from 0 to 100 over 2.4s
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      const timer = setTimeout(() => {
        onFinish();
      }, 2500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [show, onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 bg-[#050507] z-[100] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Ambient Cosmic Background Glow Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.12)_0%,transparent_60%)] pointer-events-none" />
          
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/5 rounded-full filter blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#EF4444]/3 rounded-full filter blur-[120px] animate-pulse pointer-events-none" />

          <div className="flex flex-col items-center relative z-10 px-6 text-center max-w-md">
            {/* Elegant Custom Motion Logo - Pulses with glowing orange shadow */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: -20 }}
              animate={{ 
                scale: [0.7, 1.04, 1], 
                opacity: 1, 
                y: 0,
                filter: [
                  "drop-shadow(0 0 0px rgba(255, 90, 0, 0))",
                  "drop-shadow(0 0 35px rgba(255, 90, 0, 0.45))",
                  "drop-shadow(0 0 15px rgba(255, 90, 0, 0.25))"
                ]
              }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="mb-8 relative"
            >
              {/* Spinning subtle ambient accent ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-0 -m-4 border border-dashed border-brand/20 rounded-full pointer-events-none"
              />

              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand to-[#E04F00] flex items-center justify-center shadow-2xl relative overflow-hidden">
                <Film className="w-11 h-11 text-white stroke-[2.5]" />
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent to-white/20 skew-x-12"
                />
              </div>
            </motion.div>

            {/* Custom Brand Title Lettering with Staggered Entrance */}
            <div className="overflow-hidden mb-1">
              <motion.h1 
                initial={{ letterSpacing: "0.15em", opacity: 0, y: 15 }}
                animate={{ letterSpacing: "0.3em", opacity: 1, y: 0 }}
                transition={{ duration: 1.3, delay: 0.2, ease: 'easeOut' }}
                className="text-4xl font-extrabold text-white tracking-widest uppercase"
              >
                META<span className="text-brand text-glow text-shadow-glow">PLAY</span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xs text-neutral-400 font-extrabold tracking-widest uppercase flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
              Premium Streaming Experience
            </motion.p>

            {/* Glowing Active Loading Bar Setup */}
            <div className="w-48 h-1 bg-white/5 rounded-full mt-10 overflow-hidden relative border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-brand to-[#E04F00] rounded-full shadow-[0_0_10px_#FF5A00]"
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>

            {/* Loading text indicator */}
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] font-mono tracking-widest text-brand/80 mt-3 block"
            >
              INICIANDO PORTAL SEGURO {progress}%
            </motion.span>
          </div>

          {/* Secure certification seal in footer */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center text-[10px] text-neutral-500 font-mono tracking-widest items-center gap-1.5 z-10 pointer-events-none select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            CONEXÃO CRIPTOGRAFADA • TMDb E REIDOSCANAIS
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
