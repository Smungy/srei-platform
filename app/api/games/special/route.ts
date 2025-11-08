import { NextRequest, NextResponse } from 'next/server';
import { searchGames } from '@/lib/rawg/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    let data;

    if (type === 'best-of-year') {
      // Mejores del año actual - ordenados por rating y metacritic
      data = await searchGames({
        dates: `${year}-01-01,${year}-12-31`,
        ordering: '-metacritic,-rating',
        page_size: 40,
      });
    } else if (type === 'top-50') {
      // Top 50 de todos los tiempos - los mejores juegos históricos
      data = await searchGames({
        ordering: '-rating,-metacritic',
        page_size: 50,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      games: data.results,
      count: data.count,
    });
  } catch (error) {
    console.error('Error fetching special games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
