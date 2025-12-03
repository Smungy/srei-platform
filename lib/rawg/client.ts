// ============================================
// RAWG API Client
// https://api.rawg.io/docs/
// ============================================

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

if (!RAWG_API_KEY) {
  console.warn('⚠️ RAWG_API_KEY not found in environment variables');
}

// ============================================
// Types
// ============================================

export interface RAWGGame {
  id: number;
  name: string;
  slug: string;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  released: string;
  metacritic: number | null;
  playtime: number;
  genres: Array<{ id: number; name: string; slug: string }>;
  platforms: Array<{
    platform: { id: number; name: string; slug: string };
    released_at: string;
    requirements_en: {
      minimum: string;
      recommended: string;
    } | null;
  }>;
  short_screenshots: Array<{
    id: number;
    image: string;
  }>;
  tags: Array<{ id: number; name: string; slug: string }>;
}

export interface RAWGGameDetails extends RAWGGame {
  description: string;
  description_raw: string;
  website: string;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  reviews_text_count: number;
  ratings: Array<{
    id: number;
    title: string;
    count: number;
    percent: number;
  }>;
  developers: Array<{ id: number; name: string; slug: string }>;
  publishers: Array<{ id: number; name: string; slug: string }>;
  esrb_rating: {
    id: number;
    name: string;
    slug: string;
  } | null;
  clip: {
    clip: string;
    clips: Record<string, string>;
    video: string;
    preview: string;
  } | null;
}

export interface RAWGSearchParams {
  genres?: string; // IDs separados por coma, ej: "4,51"
  page?: number;
  page_size?: number; // Max 40
  search?: string;
  search_precise?: boolean; // Búsqueda más precisa
  search_exact?: boolean; // Búsqueda exacta
  ordering?: string; // -rating, -released, -added, etc.
  platforms?: string; // IDs separados por coma
  dates?: string; // Formato: YYYY-MM-DD,YYYY-MM-DD
}

export interface RAWGGenre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Búsqueda de juegos con filtros
 */
export async function searchGames(
  params: RAWGSearchParams = {}
): Promise<{ results: RAWGGame[]; count: number; next: string | null }> {
  const searchParams = new URLSearchParams({
    key: RAWG_API_KEY!,
    page_size: params.page_size?.toString() || '20',
    ...(params.genres && { genres: params.genres }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.search && { search: params.search }),
    ...(params.search_precise && { search_precise: 'true' }),
    ...(params.search_exact && { search_exact: 'true' }),
    ...(params.ordering && { ordering: params.ordering }),
    ...(params.platforms && { platforms: params.platforms }),
    ...(params.dates && { dates: params.dates }),
  });

  const response = await fetch(`${RAWG_BASE_URL}/games?${searchParams}`);

  if (!response.ok) {
    throw new Error(`RAWG API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtener detalles completos de un juego
 */
export async function getGameDetails(gameId: number): Promise<RAWGGameDetails> {
  const response = await fetch(
    `${RAWG_BASE_URL}/games/${gameId}?key=${RAWG_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`RAWG API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtener lista de todos los géneros disponibles
 */
export async function getGenres(): Promise<{ results: RAWGGenre[] }> {
  const response = await fetch(
    `${RAWG_BASE_URL}/genres?key=${RAWG_API_KEY}&page_size=40`
  );

  if (!response.ok) {
    throw new Error(`RAWG API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtener screenshots de un juego
 */
export async function getGameScreenshots(
  gameId: number
): Promise<{ results: Array<{ id: number; image: string }> }> {
  const response = await fetch(
    `${RAWG_BASE_URL}/games/${gameId}/screenshots?key=${RAWG_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`RAWG API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtener trailers/videos de un juego
 */
export async function getGameTrailers(
  gameId: number
): Promise<{
  results: Array<{
    id: number;
    name: string;
    preview: string;
    data: { 480: string; max: string };
  }>;
}> {
  const response = await fetch(
    `${RAWG_BASE_URL}/games/${gameId}/movies?key=${RAWG_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`RAWG API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtener juegos similares
 */
export async function getSimilarGames(
  gameId: number
): Promise<{ results: RAWGGame[] }> {
  const response = await fetch(
    `${RAWG_BASE_URL}/games/${gameId}/game-series?key=${RAWG_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`RAWG API Error: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Utility Functions
// ============================================

/**
 * Formatea los géneros para la API de RAWG
 * @param genres Array de slugs de géneros, ej: ["action", "adventure"]
 * @returns String de IDs separados por coma
 */
export function formatGenresForAPI(genreSlugs: string[]): string {
  // Mapeo de slugs a IDs de RAWG
  const genreMap: Record<string, number> = {
    action: 4,
    indie: 51,
    adventure: 3,
    rpg: 5,
    strategy: 10,
    shooter: 2,
    casual: 40,
    simulation: 14,
    puzzle: 7,
    arcade: 11,
    platformer: 83,
    racing: 1,
    'massively-multiplayer': 59,
    sports: 15,
    fighting: 6,
    family: 19,
    'board-games': 28,
    educational: 34,
    card: 17,
  };

  return genreSlugs
    .map((slug) => genreMap[slug])
    .filter(Boolean)
    .join(',');
}
