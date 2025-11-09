"use client";

import { useState, useEffect } from 'react';
import type { RAWGGame, RAWGGenre } from '@/lib/rawg/client';

// ============================================
// Hook para buscar juegos
// ============================================
export function useGameSearch(genres: string[], page: number = 1) {
  const [games, setGames] = useState<RAWGGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (genres.length === 0) {
      setGames([]);
      setLoading(false);
      return;
    }

    const fetchGames = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          genres: genres.join(','),
          page: page.toString(),
        });

        const response = await fetch(`/api/games?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await response.json();
        setGames(data.games);
        setHasMore(data.hasMore);
        setTotalCount(data.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genres.join(','), page]); // Usar join para comparar el contenido del array

  return { games, loading, error, hasMore, totalCount };
}

// ============================================
// Hook para obtener géneros
// ============================================
export function useGenres() {
  const [genres, setGenres] = useState<RAWGGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/games/genres');
        
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }

        const data = await response.json();
        setGenres(data.genres);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return { genres, loading, error };
}

// ============================================
// Hook para obtener detalles de un juego
// ============================================
export function useGameDetails(gameId: number | null) {
  const [game, setGame] = useState<Record<string, unknown> | null>(null);
  const [screenshots, setScreenshots] = useState<Record<string, unknown>[]>([]);
  const [trailers, setTrailers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setGame(null);
      return;
    }

    const fetchGameDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/games/${gameId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }

        const data = await response.json();
        setGame(data.game);
        setScreenshots(data.screenshots);
        setTrailers(data.trailers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]);

  return { game, screenshots, trailers, loading, error };
}
