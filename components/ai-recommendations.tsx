'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameRecommendation {
  title: string;
  reasoning: string;
  genres: string[];
  estimatedRating: string;
  image?: string | null;
  gameId?: number | null;
}

interface RecommendationsResponse {
  recommendations: GameRecommendation[];
  basedOn?: number;
  generatedAt?: string;
  message?: string;
  cached?: boolean;
}

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [loading, setLoading] = useState(true); // Cambiar a true para cargar al inicio
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  // Cargar recomendaciones anteriores al montar el componente
  useEffect(() => {
    loadPreviousRecommendations();
  }, []);

  const loadPreviousRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al cargar recomendaciones');
      }

      const data: RecommendationsResponse = await response.json();

      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        setGeneratedAt(data.generatedAt || null);
      }
    } catch (err) {
      console.error('Error loading previous recommendations:', err);
      // No mostrar error si no hay recomendaciones previas
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar recomendaciones');
      }

      const data: RecommendationsResponse = await response.json();

      if (data.message) {
        setError(data.message);
        setRecommendations([]);
      } else {
        setRecommendations(data.recommendations || []);
        setGeneratedAt(data.generatedAt || null);
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-purple-500/20">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Recomendaciones con IA
            </CardTitle>
            <CardDescription>
              Recomendaciones personalizadas basadas en tus juegos favoritos
            </CardDescription>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {recommendations.length > 0 ? 'Regenerar' : 'Generar'}
              </>
            )}
          </Button>
        </div>
        {generatedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Última actualización: {new Date(generatedAt).toLocaleString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">
                Analizando tus gustos y generando recomendaciones...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRecommendations}
                  className="mt-4"
                >
                  Intentar de nuevo
                </Button>
              </div>
            </motion.div>
          ) : recommendations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Aún no has generado recomendaciones
                </p>
                <p className="text-xs text-muted-foreground">
                  Haz clic en &ldquo;Generar&rdquo; para obtener sugerencias personalizadas
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {recommendations.map((rec, index) => (
                <motion.div
                  key={`${rec.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-purple-500/20 overflow-hidden">
                    {/* Imagen del juego */}
                    {rec.image && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={rec.image}
                          alt={rec.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-semibold text-white">
                            {rec.estimatedRating}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight">
                          {rec.title}
                        </CardTitle>
                        {!rec.image && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-semibold">
                              {rec.estimatedRating}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
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
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {rec.reasoning}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
