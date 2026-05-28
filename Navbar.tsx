import { Search, Tv, Heart, Home, Film, Sparkles, Dices } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  watchlistCount: number;
  serverLang: string;
  onLanguageChange: (lang: string) => void;
  onOpenRoulette: () => void;
  currentUser: { id: number; pin: string; nome_usuario: string; foto_url: string } | null;
}

export default function Navbar({ 
  currentView, 
  onNavigate, 
  watchlistCount, 
  serverLang, 
  onLanguageChange,
  onOpenRoulette,
  currentUser
}: NavbarProps) {
  
  return (
    <>
      {/* DESKTOP NAVIGATION BAR */}
      <nav id="desktop-nav" className="fixed top-0 left-0 w-full z-40 transition-all duration-300 glassmorphic px-6 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* App Brand Logo */}
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 group focus:outline-none"
          >
            <svg className="h-10 w-10 drop-shadow-[0_0_8px_rgba(255,90,0,0.5)] transition-transform duration-300 group-hover:scale-105" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 170V60C40 43.4315 53.4315 30 70 30C86.5685 30 100 43.4315 100 60V140C100 156.569 113.431 170 130 170C146.569 170 160 156.569 160 140V30H140V140C140 145.523 135.523 150 130 150C124.477 150 120 145.523 120 140V60C120 32.3858 97.6142 10 70 10C42.3858 10 20 32.3858 20 60V170H40Z" fill="#FF5A00"/>
              <path d="M120 135L160 170H185L140 131L120 135Z" fill="#FF5A00"/>
            </svg>
            <span className="text-xl font-black tracking-widest uppercase bg-gradient-to-r from-white via-neutral-200 to-brand bg-clip-text text-transparent font-display">
              META<span className="text-brand">PLAY</span>
            </span>
          </button>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-400">
            <li>
              <button 
                onClick={() => onNavigate('home')} 
                className={`transition-colors py-1 relative ${currentView === 'home' ? 'text-brand' : 'text-neutral-400 hover:text-white'}`}
              >
                Início
                {currentView === 'home' && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-brand rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('movies')} 
                className={`transition-colors py-1 relative ${currentView === 'movies' ? 'text-brand' : 'text-neutral-400 hover:text-white'}`}
              >
                Filmes
                {currentView === 'movies' && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-brand rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('tv')} 
                className={`transition-colors py-1 relative ${currentView === 'tv' ? 'text-brand' : 'text-neutral-400 hover:text-white'}`}
              >
                Séries
                {currentView === 'tv' && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-brand rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('iptv')} 
                className={`transition-colors py-1 relative flex items-center gap-1.5 ${currentView === 'iptv' ? 'text-brand' : 'text-neutral-400 hover:text-white'}`}
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                Canais ao Vivo
                {currentView === 'iptv' && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-brand rounded-full" />
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('mylist')} 
                className={`transition-colors py-1 relative flex items-center gap-2 ${currentView === 'mylist' ? 'text-brand' : 'text-neutral-400 hover:text-white'}`}
              >
                Minha Lista
                {watchlistCount > 0 && (
                  <span className="bg-brand text-white text-[10px] font-black leading-none px-1.5 py-1 rounded-full animate-pulse">
                    {watchlistCount}
                  </span>
                )}
                {currentView === 'mylist' && (
                  <span className="absolute bottom-[-11px] left-0 right-0 h-0.5 bg-brand rounded-full" />
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Two Dice Roulette Button */}
          <button 
            onClick={onOpenRoulette}
            className="p-2 border border-white/5 hover:border-brand/40 bg-white/5 text-neutral-300 hover:text-brand rounded-full transition-all duration-300 shadow-md flex items-center justify-center cursor-pointer"
            title="Sortear Filme/Série (Roleta Russa)"
          >
            <Dices className="w-4.5 h-4.5" />
          </button>

          <button 
            onClick={() => onNavigate('search')} 
            className={`p-2 border rounded-full transition-all duration-300 ${
              currentView === 'search' 
                ? 'bg-brand/20 border-brand/40 text-brand' 
                : 'bg-white/5 border-white/5 hover:bg-brand/10 hover:border-brand/30 text-neutral-300 hover:text-white'
            }`}
            title="Abrir Pesquisa"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Premium Server Languages Dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 bg-surface-card border border-white/5 rounded-xl px-2.5 py-1.5 shadow-md">
            <span className="text-[10px] text-neutral-400 font-medium hidden lg:inline">Servidor:</span>
            <select 
              value={serverLang} 
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold outline-none cursor-pointer border-none py-0.5"
            >
              <option value="pt" className="bg-surface-card text-white">🇧🇷 PT-BR (Dublado)</option>
              <option value="eng" className="bg-surface-card text-white">🇺🇸 EN-US (Legendado)</option>
              <option value="es" className="bg-surface-card text-white">🇪🇸 ES (Espanhol)</option>
              <option value="fr" className="bg-surface-card text-white">🇫🇷 FR (Francês)</option>
            </select>
          </div>

          {/* User Profile avatar */}
          <div 
            onClick={() => onNavigate('profile')}
            className={`w-8 h-8 rounded-full border-2 overflow-hidden cursor-pointer shadow-[0_0_10px_rgba(255,90,0,0.35)] hover:scale-105 transition-transform ${currentView === 'profile' ? 'border-brand scale-110' : 'border-neutral-500'}`}
            title="Abrir Meu Perfil"
          >
            {currentUser?.foto_url === 'METAPLAY_LOGO' ? (
              <div className="w-full h-full bg-gradient-to-br from-[#FF5A00] to-[#992C00] flex items-center justify-center p-1.5 relative select-none">
                <svg className="w-full h-full text-white" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 170V60C40 43.4315 53.4315 30 70 30C86.5685 30 100 43.4315 100 60V140C100 156.569 113.431 170 130 170C146.569 170 160 156.569 160 140V30H140V140C140 145.523 135.523 150 130 150C124.477 150 120 145.523 120 140V60C120 32.3858 97.6142 10 70 10C42.3858 10 20 32.3858 20 60V170H40Z" fill="currentColor"/>
                  <path d="M120 135L160 170H185L140 131L120 135Z" fill="currentColor"/>
                </svg>
              </div>
            ) : (
              <img 
                src={currentUser?.foto_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                alt={currentUser?.nome_usuario || "Avatar de Usuário"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-40 glassmorphic py-2.5 border-t border-white/5 flex justify-around items-center text-xs text-neutral-400">
        <button 
          onClick={() => onNavigate('home')} 
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'home' ? 'text-brand' : 'hover:text-white'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium font-sans">Início</span>
        </button>
        <button 
          onClick={() => onNavigate('movies')} 
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'movies' ? 'text-brand' : 'hover:text-white'}`}
        >
          <Film className="w-5 h-5" />
          <span className="text-[10px] font-medium font-sans">Filmes</span>
        </button>
        <button 
          onClick={() => onNavigate('iptv')} 
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'iptv' ? 'text-brand' : 'hover:text-white'}`}
        >
          <div className="relative">
            <Tv className="w-5 h-5" />
            <span className="absolute top-0 right-[-3px] w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </div>
          <span className="text-[10px] font-medium font-sans">Canais</span>
        </button>
        <button 
          onClick={() => onNavigate('tv')} 
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'tv' ? 'text-brand' : 'hover:text-white'}`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] font-medium font-sans">Séries</span>
        </button>
        <button 
          onClick={() => onNavigate('mylist')} 
          className={`flex flex-col items-center gap-1 transition-colors relative ${currentView === 'mylist' ? 'text-brand' : 'hover:text-white'}`}
        >
          <Heart className="w-5 h-5" />
          {watchlistCount > 0 && (
            <span className="absolute top-[-2px] right-[-5px] bg-brand text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {watchlistCount}
            </span>
          )}
          <span className="text-[10px] font-medium font-sans">Lista</span>
        </button>
        <button 
          onClick={onOpenRoulette} 
          className="flex flex-col items-center gap-1 transition-colors hover:text-[#FF5A00] text-amber-500 animate-pulse"
        >
          <Dices className="w-5 h-5 text-brand" />
          <span className="text-[10px] font-black font-sans uppercase text-brand tracking-wider">Roleta</span>
        </button>
      </div>
    </>
  );
}
