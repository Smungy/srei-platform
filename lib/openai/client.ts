import OpenAI from 'openai';

// Cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GameRecommendationInput {
  savedGames: Array<{
    name: string;
    genres?: string[];
    rating?: number;
  }>;
  favoriteGenres?: string[];
  userName?: string;
}

export interface GameRecommendation {
  title: string;
  reasoning: string;
  genres: string[];
  estimatedRating: string;
}

/**
 * Genera recomendaciones de videojuegos personalizadas usando OpenAI
 * @param input - Datos del usuario (juegos guardados, géneros favoritos)
 * @returns Lista de recomendaciones con razonamiento
 */
export async function generateGameRecommendations(
  input: GameRecommendationInput
): Promise<GameRecommendation[]> {
  const { savedGames, favoriteGenres, userName } = input;

  // Construir el prompt basado en los datos del usuario
  const gamesText = savedGames
    .map(game => {
      const genresText = game.genres?.length ? ` (${game.genres.join(', ')})` : '';
      const ratingText = game.rating ? ` - Rating: ${game.rating}/5` : '';
      return `- ${game.name}${genresText}${ratingText}`;
    })
    .join('\n');

  const genresText = favoriteGenres?.length
    ? `\n\nGéneros favoritos del usuario: ${favoriteGenres.join(', ')}`
    : '';

  const userGreeting = userName ? `para ${userName}` : '';

  const prompt = `Eres un experto en videojuegos con conocimiento profundo de todos los géneros y títulos. 

Basándote en los siguientes juegos que le gustan al usuario ${userGreeting}:

${gamesText}${genresText}

Por favor, recomienda 6 videojuegos que probablemente le encantarán. Para cada juego:
1. Proporciona el título exacto del juego
2. Explica brevemente (2-3 líneas) por qué es una buena recomendación basada en sus gustos
3. Lista los géneros principales del juego
4. Da una estimación del rating promedio

Devuelve SOLO un JSON válido con este formato exacto (sin texto adicional):
[
  {
    "title": "Nombre del juego",
    "reasoning": "Razón por la que se recomienda",
    "genres": ["Género1", "Género2"],
    "estimatedRating": "4.5"
  }
]

Asegúrate de recomendar juegos variados pero alineados con los gustos del usuario. Incluye tanto clásicos como juegos más recientes.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo más económico pero efectivo
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en recomendaciones de videojuegos. Respondes SOLO con JSON válido, sin texto adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Un poco de creatividad
      max_tokens: 1500,
      response_format: { type: 'json_object' }, // Forzar respuesta JSON
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Parsear la respuesta JSON
    let recommendations: GameRecommendation[];
    
    try {
      const parsed = JSON.parse(responseText);
      // La respuesta puede venir envuelta en un objeto o directamente como array
      recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
    } catch {
      console.error('Error parsing OpenAI response:', responseText);
      throw new Error('Error al parsear las recomendaciones');
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

/**
 * Genera una explicación de por qué un juego específico es recomendado
 * @param gameName - Nombre del juego
 * @param userGames - Juegos que le gustan al usuario
 * @returns Explicación personalizada
 */
export async function explainRecommendation(
  gameName: string,
  userGames: string[]
): Promise<string> {
  const prompt = `El usuario tiene estos juegos favoritos: ${userGames.join(', ')}.

¿Por qué "${gameName}" sería una excelente recomendación para este usuario? 

Explica en 2-3 oraciones de manera conversacional y entusiasta.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto entusiasta en videojuegos que da recomendaciones personalizadas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || 'Este juego podría gustarte.';
  } catch (error) {
    console.error('Error explaining recommendation:', error);
    return 'Este juego es altamente recomendado para ti.';
  }
}

export { openai };
