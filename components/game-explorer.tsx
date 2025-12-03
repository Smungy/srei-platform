'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSearch, useGenres, useGameSearchByName } from '@/hooks/useGames';
import { useSavedGames } from '@/hooks/useSavedGames';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveGameButton } from '@/components/save-game-button';
import { ArrowLeft, RefreshCw, Loader2, Trophy, Star, Search, X, Sparkles, MessageCircle, Send, Heart } from 'lucide-react';
import Image from 'next/image';
import type { RAWGGame } from '@/lib/rawg/client';

type ViewState = 'genres' | 'results' | 'best-of-year' | 'top-50' | 'ai-recommendations';

interface GameRecommendation {
  title: string;
  genres: string[];
  reasoning: string;
  estimatedRating: number;
  image?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: GameRecommendation[];
  timestamp: Date;
}

export function GameExplorer() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('genres');
  const [selectedGame, setSelectedGame] = useState<RAWGGame | null>(null);
  const [specialGames, setSpecialGames] = useState<RAWGGame[]>([]);
  const [specialLoading, setSpecialLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para recomendaciones IA
  const [aiRecommendations, setAiRecommendations] = useState<GameRecommendation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGeneratedAt, setAiGeneratedAt] = useState<string | null>(null);
  
  // Estados para chat IA
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const { genres, loading: genresLoading } = useGenres();
  const { games, loading: gamesLoading } = useGameSearch(selectedGenres, 1);
  const { games: searchedGames, loading: searchLoading, loadingMore: searchLoadingMore, totalCount: searchTotalCount, hasMore: searchHasMore, loadMore: loadMoreSearchResults } = useGameSearchByName(searchQuery);
  const { isAuthenticated, isSaved, toggleSaveGame } = useSavedGames();

  // Estado para mostrar/ocultar resultados de búsqueda
  const showSearchResults = searchQuery.trim().length >= 2;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

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
    setSearchQuery('');
    setCurrentView('genres');
  };

  const handleNewSearch = () => {
    setSelectedGenres([]);
    setSearchQuery('');
    setCurrentView('genres');
  };

  const handleBestOfYear = async () => {
    setSpecialLoading(true);
    setCurrentView('best-of-year');
    
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(`/api/games/special?type=best-of-year&year=${currentYear}`);
      const data = await response.json();
      setSpecialGames(data.games || []);
    } catch (error) {
      console.error('Error fetching best of year:', error);
      setSpecialGames([]);
    } finally {
      setSpecialLoading(false);
    }
  };

  const handleTop50 = async () => {
    setSpecialLoading(true);
    setCurrentView('top-50');
    
    try {
      const response = await fetch('/api/games/special?type=top-50');
      const data = await response.json();
      setSpecialGames(data.games || []);
    } catch (error) {
      console.error('Error fetching top 50:', error);
      setSpecialGames([]);
    } finally {
      setSpecialLoading(false);
    }
  };

  const handleAIRecommendations = async () => {
    setCurrentView('ai-recommendations');
    
    // Si ya hay recomendaciones cargadas, no las vuelve a cargar
    if (aiRecommendations.length > 0 && !aiError) {
      return;
    }
    
    // Cargar recomendaciones previas
    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await fetch('/api/recommendations');
      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          setAiRecommendations(data.recommendations);
          setAiGeneratedAt(data.generatedAt);
        }
      }
    } catch (error) {
      console.error('Error loading previous recommendations:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIRecommendations = async () => {
    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar recomendaciones');
      }
      
      const data = await response.json();
      setAiRecommendations(data.recommendations);
      setAiGeneratedAt(new Date().toISOString());
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setAiError(error instanceof Error ? error.message : 'Error al generar recomendaciones');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    // Mensaje de bienvenida si es la primera vez
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! 🎮 Soy tu asistente de videojuegos. Puedes preguntarme cosas como:\n\n• "Recomiéndame juegos de disparos con buena historia"\n• "Quiero juegos parecidos a Dark Souls"\n• "¿Qué juegos de mundo abierto me recomiendas?"\n\n¿Qué tipo de juegos te gustaría descubrir?',
        recommendations: [],
        timestamp: new Date(),
      }]);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/recommendations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar tu mensaje');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        recommendations: data.recommendations || [],
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Hubo un error. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
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
                className="text-lg md:text-xl text-muted-foreground mb-6"
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

              {/* Barra de búsqueda */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-xl mx-auto"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar juegos por nombre..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-12 pr-12 py-6 text-lg rounded-full border-2 border-purple-500/30 focus:border-purple-500 bg-background/80 backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <p className="text-sm text-muted-foreground mt-2">Escribe al menos 2 caracteres para buscar</p>
                )}
              </motion.div>
            </div>

            {/* Resultados de búsqueda (se muestran cuando hay query) */}
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="text-center mb-4">
                  {searchLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                      <span className="ml-2 text-muted-foreground">Buscando...</span>
                    </div>
                  ) : searchedGames.length === 0 ? (
                    <p className="text-muted-foreground py-4">
                      No se encontraron juegos para &quot;{searchQuery}&quot;
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchTotalCount.toLocaleString()} resultados para &quot;{searchQuery}&quot;
                    </p>
                  )}
                </div>

                {!searchLoading && searchedGames.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchedGames.map((game) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group cursor-pointer"
                        onClick={() => setSelectedGame(game)}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                          <div className="relative h-32">
                            {game.background_image ? (
                              <Image
                                src={game.background_image}
                                alt={game.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground text-sm">Sin imagen</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            
                            {game.rating && (
                              <Badge className="absolute top-2 left-2 bg-yellow-500 text-black text-xs">
                                ⭐ {game.rating}
                              </Badge>
                            )}
                            
                            {isAuthenticated && (
                              <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                                <SaveGameButton
                                  gameData={{ ...game }}
                                  isAuthenticated={isAuthenticated}
                                  isSaved={isSaved(game.id)}
                                  onToggle={async () => { await toggleSaveGame({ ...game }); }}
                                />
                              </div>
                            )}
                            
                            <div className="absolute bottom-2 left-2 right-2">
                              <h3 className="font-semibold text-sm text-white line-clamp-2 drop-shadow">
                                {game.name}
                              </h3>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Botón Ver más y contador */}
                {!searchLoading && searchedGames.length > 0 && (
                  <div className="text-center mt-6 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {searchedGames.length} de {searchTotalCount.toLocaleString()} resultados
                    </p>
                    {searchHasMore && (
                      <Button
                        onClick={loadMoreSearchResults}
                        disabled={searchLoadingMore}
                        variant="outline"
                        className="gap-2"
                      >
                        {searchLoadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Ver más resultados
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Botones de secciones especiales */}
            {!showSearchResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleBestOfYear}
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50 hover:bg-yellow-500/20 font-semibold"
                >
                  <Trophy className="w-5 h-5" />
                  Mejores del {new Date().getFullYear()}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleTop50}
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/50 hover:bg-purple-500/20 font-semibold"
                >
                  <Star className="w-5 h-5" />
                  Top 50 de Todos los Tiempos
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleAIRecommendations}
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/50 hover:bg-indigo-500/20 font-semibold"
                >
                  <Sparkles className="w-5 h-5" />
                  Recomendaciones IA
                </Button>
              </motion.div>
            </motion.div>
            )}

            {!showSearchResults && (genresLoading ? (
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
                          <div className="relative h-40">
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
                                  className="w-7 h-7 drop-shadow-lg"
                                >
                                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22.5l-.394-1.933a2.25 2.25 0 00-1.423-1.423L12.75 18.75l1.933-.394a2.25 2.25 0 001.423-1.423l.394-1.933.394 1.933a2.25 2.25 0 001.423 1.423l1.933.394-1.933.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                              </motion.div>
                            )}
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="font-bold text-xl text-white drop-shadow-lg">
                                {genre.name}
                              </h3>
                              <p className="text-sm text-white/90 drop-shadow-md">
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
            ))}
          </motion.div>
        ) : currentView === 'results' ? (
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
                      <Card className="overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 relative">
                        {/* Imagen más grande - aspecto vertical */}
                        <div className="relative h-[280px] overflow-hidden">
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
                                ⭐ {game.rating}
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
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="font-bold text-lg text-white drop-shadow-lg line-clamp-2">
                              {game.name}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Contenido inferior más compacto */}
                        <div className="p-3 bg-gradient-to-b from-background to-muted/20">
                          {/* Información y badges */}
                          <div className="space-y-2">
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
        ) : (currentView === 'best-of-year' || currentView === 'top-50') ? (
          <motion.div
            key={`${currentView}-view`}
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
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={handleBackToGenres}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
              <div className="flex items-center gap-3">
                {currentView === 'best-of-year' ? (
                  <Badge variant="default" className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Trophy className="w-4 h-4 mr-2" />
                    Mejores del {new Date().getFullYear()}
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-lg px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500">
                    <Star className="w-4 h-4 mr-2" />
                    Top 50 de Todos los Tiempos
                  </Badge>
                )}
              </div>
            </div>

            {specialLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : specialGames.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground">
                  No se encontraron juegos
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {specialGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    variants={itemVariants}
                    layoutId={`game-${game.id}`}
                    className="group cursor-pointer"
                    onClick={() => setSelectedGame(game)}
                  >
                    <motion.div
                      whileHover={{ 
                        y: -12,
                        transition: { type: 'spring', stiffness: 400, damping: 25 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 relative">
                        {/* Ranking badge para Top 50 */}
                        {currentView === 'top-50' && (
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg px-3 py-1 shadow-lg">
                              #{index + 1}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Imagen más grande - aspecto vertical */}
                        <div className="relative h-[280px] overflow-hidden">
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
                                ⭐ {game.rating}
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
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="font-bold text-lg text-white drop-shadow-lg line-clamp-2">
                              {game.name}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Contenido inferior más compacto */}
                        <div className="p-3 bg-gradient-to-b from-background to-muted/20">
                          {/* Información y badges */}
                          <div className="space-y-2">
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
        ) : currentView === 'ai-recommendations' ? (
          <motion.div
            key="ai-recommendations-view"
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
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={handleBackToGenres}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
              <Badge variant="default" className="text-lg px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500">
                <Sparkles className="w-4 h-4 mr-2" />
                Recomendaciones IA
              </Badge>
            </div>

            {/* Dos opciones: Basado en favoritos o Chat */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Opción 1: Basado en favoritos */}
              <Card className={`p-6 cursor-pointer transition-all border-2 ${!showChat ? 'border-purple-500 bg-purple-500/5' : 'border-transparent hover:border-purple-500/50'}`} onClick={() => setShowChat(false)}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Basado en tus favoritos</h3>
                    <p className="text-sm text-muted-foreground">
                      Genera recomendaciones automáticas analizando los juegos que has guardado en tu biblioteca
                    </p>
                  </div>
                </div>
              </Card>

              {/* Opción 2: Chat personalizado */}
              <Card className={`p-6 cursor-pointer transition-all border-2 ${showChat ? 'border-green-500 bg-green-500/5' : 'border-transparent hover:border-green-500/50'}`} onClick={() => { setShowChat(true); toggleChat(); }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Chat personalizado</h3>
                    <p className="text-sm text-muted-foreground">
                      Describe qué tipo de juegos buscas y recibe recomendaciones específicas
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <AnimatePresence mode="wait">
              {!showChat ? (
                /* Vista de recomendaciones basadas en favoritos */
                <motion.div
                  key="favorites-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Botón generar */}
                  <div className="flex justify-center mb-6">
                    <Button
                      onClick={generateAIRecommendations}
                      disabled={aiLoading}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analizando tus favoritos...
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          {aiRecommendations.length > 0 ? 'Regenerar desde mis favoritos' : 'Generar desde mis favoritos'}
                        </>
                      )}
                    </Button>
                  </div>

                  {aiGeneratedAt && (
                    <p className="text-xs text-muted-foreground mb-4 text-center">
                      Última actualización: {new Date(aiGeneratedAt).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}

                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                      <p className="text-sm text-muted-foreground">
                        Analizando tus juegos guardados y generando recomendaciones...
                      </p>
                    </div>
                  ) : aiError ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{aiError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateAIRecommendations}
                          className="mt-4"
                        >
                          Intentar de nuevo
                        </Button>
                      </div>
                    </div>
                  ) : aiRecommendations.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                        <Heart className="w-8 h-8 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Aún no has generado recomendaciones
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Haz clic en el botón para obtener sugerencias basadas en los juegos que has guardado como favoritos
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                      {aiRecommendations.map((rec, index) => (
                        <motion.div
                          key={`${rec.title}-${index}`}
                          variants={itemVariants}
                        >
                          <Card className="h-full hover:shadow-lg transition-shadow border-purple-500/20 overflow-hidden">
                            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                              {rec.image ? (
                                <Image
                                  src={rec.image}
                                  alt={rec.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  className="object-cover transition-transform hover:scale-105"
                                  onError={(e) => {
                                    // Ocultar imagen rota
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Sparkles className="w-12 h-12 text-purple-400/50" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs font-semibold text-white">
                                  {rec.estimatedRating}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-lg font-bold leading-tight">
                                  {rec.title}
                                </h3>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2 mb-3">
                                {rec.genres.map(genre => (
                                  <Badge
                                    key={genre}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {genre}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {rec.reasoning}
                              </p>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* Vista de chat */
                <motion.div
                  key="chat-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-green-500/20 overflow-hidden">
                    {/* Mensajes */}
                    <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/10">
                      <AnimatePresence>
                        {chatMessages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] ${
                                msg.role === 'user'
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl rounded-tr-sm'
                                  : 'bg-muted rounded-2xl rounded-tl-sm'
                              } p-4`}
                            >
                              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                              
                              {/* Recomendaciones del asistente */}
                              {msg.recommendations && msg.recommendations.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {msg.recommendations.map((rec, idx) => (
                                    <motion.div
                                      key={`${msg.id}-rec-${idx}`}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: idx * 0.1 }}
                                    >
                                      <Card className="bg-background/80 overflow-hidden">
                                        <div className="flex gap-3">
                                          <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                                            {rec.image ? (
                                              <Image
                                                src={rec.image}
                                                alt={rec.title}
                                                fill
                                                className="object-cover"
                                                onError={(e) => {
                                                  (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                              />
                                            ) : (
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-purple-400/50" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="p-3 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                              <h4 className="font-bold text-sm">{rec.title}</h4>
                                              <div className="flex items-center gap-1 flex-shrink-0">
                                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                <span className="text-xs font-semibold">{rec.estimatedRating}</span>
                                              </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {rec.genres.slice(0, 3).map(genre => (
                                                <Badge key={genre} variant="secondary" className="text-xs py-0">
                                                  {genre}
                                                </Badge>
                                              ))}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                              {rec.reasoning}
                                            </p>
                                          </div>
                                        </div>
                                      </Card>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                              
                              <span className="text-xs opacity-60 mt-2 block">
                                {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {/* Loading indicator */}
                      {chatLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-muted rounded-2xl rounded-tl-sm p-4">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                              <span className="text-sm text-muted-foreground">Pensando...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Input */}
                    <div className="border-t border-green-500/20 p-4 bg-muted/30">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendChatMessage();
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ej: Quiero juegos de disparos con buena historia..."
                          className="flex-1 border-green-500/30 focus:border-green-500"
                          disabled={chatLoading}
                          maxLength={500}
                        />
                        <Button
                          type="submit"
                          disabled={chatLoading || !chatInput.trim()}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          {chatLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
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
                          ⭐ {selectedGame.rating} / 5
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
                      
                      {/* Botón de favoritos */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <SaveGameButton
                          gameData={selectedGame as never}
                          isAuthenticated={isAuthenticated}
                          isSaved={isSaved(selectedGame.id)}
                          onToggle={async () => {
                            await toggleSaveGame(selectedGame as never);
                          }}
                        />
                      </motion.div>
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
