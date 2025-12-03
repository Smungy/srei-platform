import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateGameRecommendations } from '@/lib/openai/client';
import { searchGames } from '@/lib/rawg/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Aumentar timeout a 30 segundos

/**
 * POST /api/recommendations
 * Genera recomendaciones personalizadas de videojuegos usando IA
 */
export async function POST() {
  try {
    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener juegos guardados del usuario
    const { data: savedGames, error: gamesError } = await supabase
      .from('saved_games')
      .select('game_id, game_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (gamesError) {
      console.error('Error fetching saved games:', gamesError);
      return NextResponse.json(
        { error: 'Error al obtener juegos guardados' },
        { status: 500 }
      );
    }

    // Si no tiene juegos guardados, devolver recomendaciones generales
    if (!savedGames || savedGames.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'Guarda algunos juegos primero para recibir recomendaciones personalizadas',
      });
    }

    // Obtener perfil del usuario para géneros favoritos
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, preferences')
      .eq('id', user.id)
      .single();

    // Preparar datos para OpenAI con tipos explícitos
    interface SavedGameData {
      game_id: number;
      game_data: {
        name: string;
        genres?: string[];
        rating?: number;
      };
    }

    const typedSavedGames = savedGames as unknown as SavedGameData[];
    const gamesForAI = typedSavedGames.map(sg => ({
      name: sg.game_data.name,
      genres: sg.game_data.genres || [],
      rating: sg.game_data.rating,
    }));

    interface ProfileData {
      username?: string;
      preferences?: {
        favorite_genres?: string[];
      };
    }

    const typedProfile = profile as unknown as ProfileData | null;
    const favoriteGenres = typedProfile?.preferences?.favorite_genres;
    const userName = typedProfile?.username;

    // Generar recomendaciones con IA
    const recommendations = await generateGameRecommendations({
      savedGames: gamesForAI,
      favoriteGenres,
      userName,
    });

    // Enriquecer todas las recomendaciones con imágenes de RAWG en paralelo
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          // Promise.race para timeout de 2 segundos
          const searchPromise = searchGames({
            search: rec.title,
            page_size: 1,
          });
          
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          );

          const searchResult = await Promise.race([searchPromise, timeoutPromise]);

          if (searchResult && searchResult.results && searchResult.results.length > 0) {
            const game = searchResult.results[0];
            return {
              ...rec,
              image: game.background_image,
              gameId: game.id,
            };
          }
        } catch (error) {
          console.error(`Error/timeout fetching image for ${rec.title}:`, error);
        }
        
        // Si no se encuentra o timeout, devolver sin imagen
        return {
          ...rec,
          image: null,
          gameId: null,
        };
      })
    );

    // Guardar el log de recomendaciones (opcional - ignorar errores)
    try {
      await supabase.from('recommendation_logs').insert({
        user_id: user.id,
        recommendations: enrichedRecommendations as never,
        based_on_games: typedSavedGames.map(sg => sg.game_id) as never,
        created_at: new Date().toISOString(),
      } as never);
    } catch (logError) {
      // No fallar si no existe la tabla de logs
      console.warn('Could not save recommendation log:', logError);
    }

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      basedOn: gamesForAI.length,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in recommendations API:', error);
    
    // Error específico de OpenAI
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Error de configuración de OpenAI. Verifica tu API key.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error al generar recomendaciones', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recommendations
 * Obtiene las últimas recomendaciones generadas para el usuario
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Intentar obtener recomendaciones previas (opcional - puede no existir la tabla)
    try {
      const { data: lastRecommendation, error } = await supabase
        .from('recommendation_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && lastRecommendation) {
        interface RecommendationLog {
          recommendations: unknown;
          created_at: string;
        }
        const typedLog = lastRecommendation as unknown as RecommendationLog;
        
        return NextResponse.json({
          recommendations: typedLog.recommendations,
          generatedAt: typedLog.created_at,
          cached: true,
        });
      }
    } catch (error) {
      // Tabla no existe o error al buscar - ignorar
      console.warn('No cached recommendations found:', error);
    }

    return NextResponse.json({
      recommendations: [],
      message: 'No hay recomendaciones previas. Genera nuevas.',
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Error al obtener recomendaciones' },
      { status: 500 }
    );
  }
}
