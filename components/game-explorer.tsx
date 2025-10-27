'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSearch, useGenres } from '@/hooks/useGames';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import type { RAWGGame } from '@/lib/rawg/client';

type ViewState = 'genres' | 'results';

export function GameExplorer() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('genres');
  const [selectedGame, setSelectedGame] = useState<RAWGGame | null>(null);
  
  const { genres, loading: genresLoading } = useGenres();
  const { games, loading: gamesLoading } = useGameSearch(selectedGenres, 1);

  const toggleGenre = (genreSlug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreSlug)
        ? prev.filter((g) => g !== genreSlug)
        : [...prev, genreSlug]
    );
  };

  const handleSearch = () => {
    if (selectedGenres.length > 0) {
      setCurrentView('results');
    }
  };

  const handleBackToGenres = () => {
    setCurrentView('genres');
  };

  const handleNewSearch = () => {
    setSelectedGenres([]);
    setCurrentView('genres');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      }
    },
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {currentView === 'genres' ? (
          <motion.div
            key="genres-view"
            custom={-1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <div className="text-center mb-8">
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15
                }}
              >
                Explorador de Videojuegos
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.span
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                  style={{ backgroundSize: '200% auto' }}
                >
                  Selecciona uno o más géneros para descubrir juegos increíbles
                </motion.span>
              </motion.p>
            </div>

            {genresLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
                >
                  {genres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.slug);

                    return (
                      <motion.div
                        key={genre.id}
                        variants={itemVariants}
                        whileHover={{ 
                          scale: 1.05,
                          transition: { type: 'spring', stiffness: 400, damping: 10 }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          className={`cursor-pointer overflow-hidden transition-all duration-300 ${
                            isSelected
                              ? 'ring-2 ring-primary shadow-lg'
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => toggleGenre(genre.slug)}
                        >
                          <div className="relative h-32">
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${genre.image_background})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute top-2 right-2"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="white"
                                  className="w-6 h-6 drop-shadow-lg"
                                >
                                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22.5l-.394-1.933a2.25 2.25 0 00-1.423-1.423L12.75 18.75l1.933-.394a2.25 2.25 0 001.423-1.423l.394-1.933.394 1.933a2.25 2.25 0 001.423 1.423l1.933.394-1.933.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                              </motion.div>
                            )}
                            <div className="absolute bottom-3 left-3 right-3">
                              <h3 className="font-bold text-lg text-white drop-shadow-lg">
                                {genre.name}
                              </h3>
                              <p className="text-xs text-white/90 drop-shadow-md">
                                {genre.games_count.toLocaleString()} juegos
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {selectedGenres.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 300,
                      damping: 20
                    }}
                    className="flex justify-center relative"
                  >
                    {/* Glow effect background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-50"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.5, 0.7, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Button
                        size="lg"
                        onClick={handleSearch}
                        className="relative overflow-hidden gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-xl px-10 py-7 rounded-2xl shadow-2xl border-2 border-white/20 transition-all duration-300 group"
                      >
                        {/* Animated shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: 1
                          }}
                        />
                        
                        {/* Search icon */}
                        <motion.svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                          animate={{
                            rotate: [0, 10, -10, 10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </motion.svg>
                        
                        <span className="relative z-10">
                          Buscar Juegos ({selectedGenres.length} {selectedGenres.length === 1 ? 'género' : 'géneros'})
                        </span>
                        
                        {/* Arrow with animation */}
                        <motion.svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="currentColor"
                          className="w-6 h-6"
                          animate={{ 
                            x: [0, 5, 0],
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </motion.svg>
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results-view"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackToGenres}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a géneros
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNewSearch}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Nueva búsqueda
                </Button>
              </div>
              <div className="flex gap-2">
                {selectedGenres.map((genreSlug) => {
                  const genre = genres.find((g) => g.slug === genreSlug);
                  return genre ? (
                    <Badge key={genreSlug} variant="secondary">
                      {genre.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            {gamesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : games.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground">
                  No se encontraron juegos para los géneros seleccionados
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {games.map((game) => (
                  <motion.div
                    key={game.id}
                    variants={itemVariants}
                    className="group cursor-pointer"
                    onClick={() => setSelectedGame(game)}
                    layoutId={`game-${game.id}`}
                  >
                    <motion.div
                      whileHover={{ 
                        y: -12,
                        transition: { type: 'spring', stiffness: 400, damping: 25 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 relative h-[500px]">
                        {/* Imagen más grande - aspecto vertical */}
                        <div className="relative h-[320px] overflow-hidden">
                          {game.background_image ? (
                            <motion.img
                              src={game.background_image}
                              alt={game.name}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-lg">Sin imagen</span>
                            </div>
                          )}
                          
                          {/* Gradiente inferior */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Rating badge en la esquina */}
                          {game.rating && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className="absolute top-3 left-3"
                            >
                              <Badge className="bg-yellow-500 text-black font-bold text-base px-3 py-1">
                                {game.rating}
                              </Badge>
                            </motion.div>
                          )}
                          
                          {/* Hover indicator */}
                          <motion.div
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <motion.div
                              initial={{ scale: 0, y: 20 }}
                              whileHover={{ scale: 1, y: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                              className="bg-white text-black px-6 py-3 rounded-full font-bold text-lg shadow-xl"
                            >
                              Ver detalles
                            </motion.div>
                          </motion.div>
                          
                          {/* Título sobre la imagen (en la parte inferior) */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-bold text-xl text-white drop-shadow-lg line-clamp-2">
                              {game.name}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Contenido inferior más compacto */}
                        <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-background to-muted/20">
                          {/* Información y badges */}
                          <div className="space-y-3 flex-1">
                            {/* Año y Metacritic */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {game.released && (
                                <span className="font-medium">
                                  {new Date(game.released).getFullYear()}
                                </span>
                              )}
                              {game.metacritic && (
                                <>
                                  <span>•</span>
                                  <Badge 
                                    variant={game.metacritic >= 75 ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    Meta: {game.metacritic}
                                  </Badge>
                                </>
                              )}
                            </div>
                            
                            {/* Géneros */}
                            <div className="flex flex-wrap gap-1.5">
                              {game.genres?.slice(0, 3).map((genre) => (
                                <Badge 
                                  key={genre.id} 
                                  variant="outline" 
                                  className="text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30"
                                >
                                  {genre.name}
                                </Badge>
                              ))}
                            </div>
                            
                            {/* Plataformas (iconos o nombres cortos) */}
                            {game.platforms && game.platforms.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                                <span className="line-clamp-1">
                                  {game.platforms.slice(0, 3).map((p) => p.platform.name).join(', ')}
                                  {game.platforms.length > 3 && ` +${game.platforms.length - 3}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal espectacular para detalles del juego */}
      <AnimatePresence>
        {selectedGame && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedGame(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal Content */}
              <motion.div
                layoutId={`game-${selectedGame.id}`}
                initial={{ scale: 0.8, opacity: 0, rotateX: 15 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  rotateX: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8
                  }
                }}
                exit={{ 
                  scale: 0.8, 
                  opacity: 0, 
                  rotateX: -15,
                  transition: { duration: 0.2 }
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                style={{ perspective: '1000px' }}
              >
                {/* Header con imagen */}
                <div className="relative h-80 overflow-hidden">
                  {selectedGame.background_image && (
                    <motion.img
                      src={selectedGame.background_image}
                      alt={selectedGame.name}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  
                  {/* Botón cerrar */}
                  <motion.button
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => setSelectedGame(null)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg z-10"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>

                  {/* Título sobre la imagen */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <motion.h2
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      className="text-4xl font-bold text-white drop-shadow-lg mb-2"
                    >
                      {selectedGame.name}
                    </motion.h2>
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="flex items-center gap-3 flex-wrap"
                    >
                      {selectedGame.rating && (
                        <Badge className="bg-yellow-500 text-black font-bold text-sm">
                          {selectedGame.rating} / 5
                        </Badge>
                      )}
                      {selectedGame.metacritic && (
                        <Badge 
                          className={`font-bold text-sm ${
                            selectedGame.metacritic >= 75 
                              ? 'bg-green-500' 
                              : selectedGame.metacritic >= 50 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          } text-white`}
                        >
                          Metacritic: {selectedGame.metacritic}
                        </Badge>
                      )}
                      {selectedGame.released && (
                        <Badge variant="secondary" className="text-sm">
                          {new Date(selectedGame.released).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Badge>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 space-y-6">
                  {/* Géneros */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Géneros
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.genres?.map((genre) => (
                        <motion.div
                          key={genre.id}
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge variant="outline" className="text-sm">
                            {genre.name}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Plataformas */}
                  {selectedGame.platforms && selectedGame.platforms.length > 0 && (
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    >
                      <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Plataformas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedGame.platforms.map((p, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + idx * 0.05, type: 'spring', stiffness: 400 }}
                            whileHover={{ scale: 1.1, y: -3 }}
                          >
                            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                              {p.platform.name}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Estadísticas */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {selectedGame.playtime > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20"
                      >
                        <div className="text-2xl font-bold text-purple-600">{selectedGame.playtime}h</div>
                        <div className="text-sm text-muted-foreground">Tiempo de juego</div>
                      </motion.div>
                    )}
                    {selectedGame.ratings_count > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-xl border border-blue-500/20"
                      >
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedGame.ratings_count.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Valoraciones</div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
