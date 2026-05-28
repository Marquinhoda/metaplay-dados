export interface MediaItem {
  id: number;
  title?: string;
  name?: string; // TV shows use name instead of title
  overview: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number | null;
  media_type: 'movie' | 'tv';
  backdrop_url?: string;
  poster_url?: string;
  embed_custom_url?: string;
  castHTML?: string;
  popularity?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date?: string;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  episodes?: Episode[];
}

export interface LiveChannel {
  id: string;
  name: string;
  category: string;
  logo: string;
  canal: string;
  streamUrl?: string; // YouTube live URL or stream ID or embed link
}

export interface WatchedItem {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  poster_url?: string;
  progress: number; // percentage completed
  lastWatchedEpisode?: {
    season: number;
    episode: number;
    title: string;
  };
  updatedAt: number;
}
