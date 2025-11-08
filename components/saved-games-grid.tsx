'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedGame } from '@/lib/supabase/types';

interface SavedGamesGridProps {
  initialGames: SavedGame[];
  onRemove: (gameId: number) => Promise<void>;
}

export function SavedGamesGrid({ initialGames, onRemove }: SavedGamesGridProps) {
  const [games, setGames] = useState(initialGames);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRemove = async (gameId: number) => {
    setDeleting(true);
    try {
      await onRemove(gameId);
      setGames(prev => prev.filter(g => g.game_id !== gameId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error removing game:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">Aún no has guardado ningún juego</p>
        <p className="text-sm">
          Explora juegos y guarda tus favoritos para verlos aquí
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {games.map((game) => (
          <motion.div
            key={game.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
              {/* Thumbnail */}
              <div 
                className="w-full h-36 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 relative"
                style={{
                  backgroundImage: game.game_data.background_image 
                    ? `url(${game.game_data.background_image})` 
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Botón de eliminar */}
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors z-10"
                  onClick={() => setConfirmDelete(game.game_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
              
              {/* Info */}
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                  {game.game_data.name}
                </h3>
                
                {game.game_data.genres && game.game_data.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {game.game_data.genres.slice(0, 2).map((genre: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {game.rating && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>⭐</span>
                    <span>{game.rating}/5</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Modal de confirmación */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setConfirmDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-xl p-6 max-w-md w-full shadow-2xl border border-border"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      ¿Quitar de favoritos?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {games.find(g => g.game_id === confirmDelete)?.game_data.name} será eliminado de tu lista de favoritos. Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(null)}
                    disabled={deleting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemove(confirmDelete)}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? 'Eliminando...' : 'Sí, quitar'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
