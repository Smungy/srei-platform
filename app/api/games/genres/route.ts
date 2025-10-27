import { NextResponse } from 'next/server';
import { getGenres } from '@/lib/rawg/client';

export async function GET() {
  try {
    const data = await getGenres();

    return NextResponse.json({
      genres: data.results,
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}
