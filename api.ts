import { MediaItem, CastMember, Season, Episode } from './types';
import { BACKUP_MOVIES, BACKUP_TV_SHOWS, LIMITE_FINAL_FILME } from './data';

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MGQxNTRjMDk4MDk4M2FjZDRkNDRkZGE0MTQ2N2M3NiIsIm5iZiI6MTc3OTc0Nzk1My42OTQwMDAyLCJzdWIiOiI2YTE0Y2M3MWFmN2M1NzU3ZjUxMGM2MDgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.QpPh9d6ftDuMefDj1zUxMbMW3PL_-wniqjxdcp7R4Vs';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

interface FetchOptions {
  headers: {
    accept: string;
    Authorization: string;
  };
}

const getFetchOptions = (): FetchOptions => ({
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
});

// Helper to convert TMDB paths to full URLs or apply elegant placeholders
export function getMediaImageUrl(path: string | null | undefined, size: 'w500' | 'original' = 'w500'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=80';
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Fetch trending content
export async function fetchTrending(type: 'all' | 'movie' | 'tv' = 'all'): Promise<MediaItem[]> {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/${type}/week?language=pt-BR`, getFetchOptions());
    if (!res.ok) throw new Error('Failed to fetch trending from TMDB');
    const data = await res.json();
    
    const items = (data.results || []) as MediaItem[];
    // Normalize and add media_type since tmdb sometimes leaves it out
    return items.map(item => ({
      ...item,
      media_type: item.media_type || (type === 'all' ? 'movie' : type)
    }));
  } catch (error) {
    console.warn('Falling back to static data for trending:', error);
    // Mix backup datasets together
    const mixed = [
      LIMITE_FINAL_FILME,
      ...BACKUP_MOVIES,
      ...BACKUP_TV_SHOWS
    ];
    return mixed;
  }
}

// Fetch movies (Popular or Filtered)
export async function fetchMovies(genreId?: number): Promise<MediaItem[]> {
  try {
    let url = `${TMDB_BASE_URL}/movie/popular?language=pt-BR&page=1`;
    if (genreId) {
      url = `${TMDB_BASE_URL}/discover/movie?language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}&page=1`;
    }
    
    const res = await fetch(url, getFetchOptions());
    if (!res.ok) throw new Error('Failed to fetch movies');
    const data = await res.json();
    
    return (data.results || []).map((m: any) => ({
      ...m,
      media_type: 'movie' as const
    }));
  } catch (error) {
    console.warn('Falling back to static movies:', error);
    if (genreId) {
      return BACKUP_MOVIES.filter(m => m.genre_ids?.includes(genreId));
    }
    return BACKUP_MOVIES;
  }
}

// Fetch TV Shows (Popular or Filtered)
export async function fetchTVShows(genreId?: number): Promise<MediaItem[]> {
  try {
    let url = `${TMDB_BASE_URL}/tv/popular?language=pt-BR&page=1`;
    if (genreId) {
      url = `${TMDB_BASE_URL}/discover/tv?language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}&page=1`;
    }
    
    const res = await fetch(url, getFetchOptions());
    if (!res.ok) throw new Error('Failed to fetch TV shows');
    const data = await res.json();
    
    return (data.results || []).map((t: any) => ({
      ...t,
      media_type: 'tv' as const
    }));
  } catch (error) {
    console.warn('Falling back to static TV shows:', error);
    if (genreId) {
      return BACKUP_TV_SHOWS.filter(t => t.genre_ids?.includes(genreId));
    }
    return BACKUP_TV_SHOWS;
  }
}

// Search TMDB for movies/tv shows
export async function searchCatalog(query: string): Promise<MediaItem[]> {
  if (!query || query.trim() === '') return [];
  
  // Custom check for "Limite Final" search query
  const qLower = query.toLowerCase();
  const matchedExclusives: MediaItem[] = [];
  if (LIMITE_FINAL_FILME.title.toLowerCase().includes(qLower)) {
    matchedExclusives.push(LIMITE_FINAL_FILME);
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&language=pt-BR&page=1`, getFetchOptions());
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    
    const results = (data.results || [])
      .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
      .map((r: any) => ({ ...r, media_type: r.media_type as 'movie' | 'tv' }));
      
    return [...matchedExclusives, ...results];
  } catch (error) {
    console.warn('Local search fallback across mock database:', error);
    const combinedMock = [LIMITE_FINAL_FILME, ...BACKUP_MOVIES, ...BACKUP_TV_SHOWS];
    const filtered = combinedMock.filter(item => 
      (item.title || item.name || '').toLowerCase().includes(qLower) ||
      item.overview.toLowerCase().includes(qLower)
    );
    return filtered;
  }
}

// Fetch credits (cast) for a specific media item
export async function fetchCredits(id: number, type: 'movie' | 'tv'): Promise<CastMember[]> {
  if (id === 999999) return []; // Custom handling for local item
  
  try {
    const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}/credits?language=pt-BR`, getFetchOptions());
    if (!res.ok) throw new Error('Failed to fetch credits');
    const data = await res.json();
    return (data.cast || []).slice(0, 10) as CastMember[];
  } catch (error) {
    console.warn('Fallback cast credits returned empty');
    return [];
  }
}

// Fetch single media details (with genres, runtimes etc.)
export async function fetchDetails(id: number, type: 'movie' | 'tv'): Promise<MediaItem> {
  if (id === 999999) return LIMITE_FINAL_FILME;
  
  try {
    const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}?language=pt-BR`, getFetchOptions());
    if (!res.ok) throw new Error('Failed to fetch details');
    const data = await res.json();
    return {
      ...data,
      media_type: type
    } as MediaItem;
  } catch (error) {
    console.warn('Details lookup fell back to database matches');
    const sourceArr = type === 'movie' ? BACKUP_MOVIES : BACKUP_TV_SHOWS;
    const found = sourceArr.find(item => item.id === id);
    if (found) return found;
    
    throw error;
  }
}

// Fetch TV seasons data with episodes
export async function fetchSeasonDetails(seriesId: number, seasonNumber: number): Promise<Episode[]> {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${seriesId}/season/${seasonNumber}?language=pt-BR`, getFetchOptions());
    if (!res.ok) throw new Error(`Failed to fetch season ${seasonNumber} details`);
    const data = await res.json();
    return (data.episodes || []) as Episode[];
  } catch (error) {
    console.warn(`Fallback episodes list created for season ${seasonNumber}`);
    // Generate mock episodes so series can still be watched with selectors!
    return Array.from({ length: 12 }, (_, i) => ({
      id: 100000 + seriesId + seasonNumber * 100 + i,
      name: `Episódio ${i + 1} - Aventura e Revelação`,
      overview: 'Os mistérios se aprofundam e nossa equipe se prepara para lutar pelo futuro. Cada escolha traz novas consequências inimagináveis.',
      episode_number: i + 1,
      season_number: seasonNumber,
      still_path: null
    }));
  }
}

// Generate the EMBED code for player.
// Standard clean embed sites are highly functional:
// Movie: https://embed.su/embed/movie/${id}
// Series: https://embed.su/embed/tv/${id}/${season}/${episode}
export function getPlayerUrl(item: MediaItem, season?: number, episode?: number): string {
  if (item.id === 999999) {
    return item.embed_custom_url || "https://jumpshare.com/embed/BCM15Iu2xk4LQMPL18r3";
  }
  
  if (item.media_type === 'tv') {
    const s = season ?? 1;
    const ep = episode ?? 1;
    return `https://myembed.biz/serie/${item.id}/${s}/${ep}`;
  }
  
  return `https://myembed.biz/filme/${item.id}`;
}
