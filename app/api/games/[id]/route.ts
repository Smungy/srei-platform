import { NextRequest, NextResponse } from 'next/server';
import { getGameDetails, getGameScreenshots, getGameTrailers } from '@/lib/rawg/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = parseInt(params.id);

    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    // Obtener detalles del juego
    const [gameDetails, screenshots, trailers] = await Promise.all([
      getGameDetails(gameId),
      getGameScreenshots(gameId),
      getGameTrailers(gameId),
    ]);

    return NextResponse.json({
      game: gameDetails,
      screenshots: screenshots.results,
      trailers: trailers.results,
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}
