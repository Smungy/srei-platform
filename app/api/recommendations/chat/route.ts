import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateChatRecommendations } from '@/lib/openai/client';
import { searchGames } from '@/lib/rawg/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Aumentar timeout a 30 segundos

/**
 * POST /api/recommendations/chat
 * Chat de recomendaciones de videojuegos con IA
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión para usar el chat.' },
        { status: 401 }
      );
    }

    // Obtener el mensaje del usuario
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'El mensaje es demasiado largo (máximo 500 caracteres)' },
        { status: 400 }
      );
    }

    // Generar respuesta con IA
    const aiResponse = await generateChatRecommendations(message);

    // Si hay recomendaciones, enriquecerlas con imágenes de RAWG
    if (aiResponse.recommendations.length > 0) {
      // Buscar imágenes en paralelo con timeout de 2 segundos
      const enrichedRecommendations = await Promise.all(
        aiResponse.recommendations.map(async (rec) => {
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
                image: game.background_image || undefined,
                gameId: game.id,
                actualRating: game.rating,
              };
            }
          } catch (error) {
            console.error(`Error/timeout searching for game "${rec.title}":`, error);
          }
          return { ...rec, image: undefined };
        })
      );

      return NextResponse.json({
        message: aiResponse.message,
        recommendations: enrichedRecommendations,
      });
    }

    return NextResponse.json({
      message: aiResponse.message,
      recommendations: [],
    });

  } catch (error) {
    console.error('Error in chat recommendations:', error);
    return NextResponse.json(
      { error: 'Error al procesar tu mensaje. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
