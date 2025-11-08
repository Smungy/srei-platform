import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SavedGame } from '@/lib/supabase/types';

export function useSavedGames() {
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [savedGameIds, setSavedGameIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar juegos guardados al montar
  useEffect(() => {
    loadSavedGames();
  }, []);

  const loadSavedGames = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data, error } = await supabase
        .from('saved_games')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const games = data as unknown as SavedGame[];
      setSavedGames(games || []);
      setSavedGameIds(new Set(games?.map(game => game.game_id) || []));
    } catch (error) {
      console.error('Error loading saved games:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSaved = (gameId: number): boolean => {
    return savedGameIds.has(gameId);
  };

  const saveGame = async (gameData: {
    id: number;
    name: string;
    background_image?: string;
    rating?: number;
    genres?: Array<{ id: number; name: string }>;
    [key: string]: unknown;
  }) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('saved_games')
        .insert({
          user_id: user.id,
          game_id: gameData.id,
          game_data: {
            name: gameData.name,
            background_image: gameData.background_image || '',
            genres: (gameData.genres || []).map(g => typeof g === 'string' ? g : g.name),
            rating: gameData.rating,
          },
        } as never)
        .select()
        .single();

      if (error) throw error;

      const savedGame = data as unknown as SavedGame;
      // Actualizar estado local
      setSavedGames(prev => [savedGame, ...prev]);
      setSavedGameIds(prev => new Set([...prev, gameData.id]));

      return { success: true, data: savedGame };
    } catch (error) {
      console.error('Error saving game:', error);
      return { success: false, error };
    }
  };

  const unsaveGame = async (gameId: number) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { error } = await supabase
        .from('saved_games')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', gameId);

      if (error) throw error;

      // Actualizar estado local
      setSavedGames(prev => prev.filter(game => game.game_id !== gameId));
      setSavedGameIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(gameId);
        return newSet;
      });

      return { success: true };
    } catch (error) {
      console.error('Error unsaving game:', error);
      return { success: false, error };
    }
  };

  const toggleSaveGame = async (gameData: {
    id: number;
    name: string;
    background_image?: string;
    rating?: number;
    genres?: Array<{ id: number; name: string }>;
    [key: string]: unknown;
  }) => {
    if (isSaved(gameData.id)) {
      return await unsaveGame(gameData.id);
    } else {
      return await saveGame(gameData);
    }
  };

  return {
    savedGames,
    savedGameIds,
    loading,
    isAuthenticated,
    isSaved,
    saveGame,
    unsaveGame,
    toggleSaveGame,
    reloadSavedGames: loadSavedGames,
  };
}
