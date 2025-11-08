import { NextRequest, NextResponse } from 'next/server';
import { searchGames, formatGenresForAPI } from '@/lib/rawg/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const genres = searchParams.get('genres')?.split(',') || [];
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || undefined;

    // Buscar juegos en RAWG API
    const genresFormatted = genres.length > 0 ? formatGenresForAPI(genres) : undefined;
    
    const data = await searchGames({
      genres: genresFormatted,
      page,
      page_size: 40,
      search,
      ordering: '-rating', // Ordenar por rating descendente
    });

    // Si el usuario está autenticado, guardar en historial
    // TODO: Implementar después de arreglar tipos de Supabase
    /*
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getClaims();
    
    if (userData?.claims && genres.length > 0) {
      // Guardar búsqueda en historial
      try {
        supabase.from('search_history').insert({
          user_id: userData.claims.sub as string,
          genres,
          results_count: data.count,
          search_metadata: {
            page,
            has_search_term: !!search,
          },
        });
      } catch {
        // Silent fail
      }
    }
    */

    return NextResponse.json({
      games: data.results,
      count: data.count,
      hasMore: !!data.next,
      page,
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
