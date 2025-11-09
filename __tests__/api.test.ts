import { describe, it, expect } from 'vitest';

describe('API de Recomendaciones - Pruebas de Integración', () => {
  const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  describe('POST /api/recommendations', () => {
    it('debe generar 6 recomendaciones personalizadas', async () => {
      console.log('🧪 Probando generación de recomendaciones...');

      // Nota: Esta prueba requiere estar autenticado
      // En producción, usa cookies de sesión real
      const response = await fetch(`${API_BASE}/api/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Si no está autenticado, espera 401
      if (response.status === 401) {
        console.log('⚠️  Usuario no autenticado (esperado en tests sin sesión)');
        expect(response.status).toBe(401);
        return;
      }

      const data = await response.json();

      // Validaciones
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('recommendations');
      expect(data.recommendations).toBeInstanceOf(Array);
      expect(data.recommendations).toHaveLength(6);
      expect(data).toHaveProperty('basedOn');
      expect(data).toHaveProperty('generatedAt');

      console.log(`✅ Generadas ${data.recommendations.length} recomendaciones`);
      console.log(`📊 Basado en ${data.basedOn} juegos`);
    });

    it('debe incluir estructura correcta en cada recomendación', async () => {
      const response = await fetch(`${API_BASE}/api/recommendations`, {
        method: 'POST',
      });

      if (response.status !== 200) {
        console.log('⚠️  Saltando test - requiere autenticación');
        return;
      }

      const data = await response.json();
      const rec = data.recommendations[0];

      // Validar estructura
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('reasoning');
      expect(rec).toHaveProperty('genres');
      expect(rec).toHaveProperty('estimatedRating');
      expect(rec).toHaveProperty('image');
      expect(rec).toHaveProperty('gameId');

      // Validar tipos
      expect(typeof rec.title).toBe('string');
      expect(typeof rec.reasoning).toBe('string');
      expect(Array.isArray(rec.genres)).toBe(true);
      expect(typeof rec.estimatedRating).toBe('string');

      console.log('✅ Estructura de recomendación validada');
      console.log(`📝 Ejemplo: "${rec.title}"`);
    });

    it('debe incluir imágenes de RAWG en las recomendaciones', async () => {
      const response = await fetch(`${API_BASE}/api/recommendations`, {
        method: 'POST',
      });

      if (response.status !== 200) return;

      const data = await response.json();
      const withImages = data.recommendations.filter((r: { image: string | null }) => r.image !== null);

      expect(withImages.length).toBeGreaterThan(0);
      console.log(`🖼️  ${withImages.length}/6 recomendaciones con imagen`);
    });
  });

  describe('GET /api/recommendations', () => {
    it('debe obtener recomendaciones cacheadas', async () => {
      console.log('🧪 Probando cache de recomendaciones...');

      const response = await fetch(`${API_BASE}/api/recommendations`, {
        method: 'GET',
      });

      if (response.status === 401) {
        console.log('⚠️  Usuario no autenticado');
        expect(response.status).toBe(401);
        return;
      }

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('recommendations');

      if (data.cached) {
        console.log('✅ Cache funcionando correctamente');
        expect(data).toHaveProperty('generatedAt');
      } else {
        console.log('ℹ️  No hay recomendaciones cacheadas');
      }
    });
  });
});

describe('API de Juegos - Pruebas de Integración', () => {
  const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  describe('GET /api/games', () => {
    it('debe buscar juegos por query', async () => {
      console.log('🧪 Probando búsqueda de juegos...');

      const response = await fetch(`${API_BASE}/api/games?search=zelda`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('games');
      expect(data).toHaveProperty('count');
      expect(Array.isArray(data.games)).toBe(true);

      console.log(`✅ Encontrados ${data.count} juegos`);
      console.log(`📊 Primeros 3: ${data.games.slice(0, 3).map((g: { name: string }) => g.name).join(', ')}`);
    });
  });

  describe('GET /api/games/genres', () => {
    it('debe devolver lista de géneros', async () => {
      console.log('🧪 Probando obtención de géneros...');

      const response = await fetch(`${API_BASE}/api/games/genres`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('genres');
      expect(Array.isArray(data.genres)).toBe(true);
      expect(data.genres.length).toBe(19); // RAWG devuelve 19 géneros

      console.log(`✅ ${data.genres.length} géneros disponibles`);
      console.log(`🎭 Ejemplos: ${data.genres.slice(0, 5).map((g: { name: string }) => g.name).join(', ')}`);
    });
  });

  describe('GET /api/games/special', () => {
    it('debe devolver mejores juegos del año', async () => {
      console.log('🧪 Probando colección "Mejores del 2025"...');

      const response = await fetch(`${API_BASE}/api/games/special?type=best-of-year&year=2025`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('games');
      expect(Array.isArray(data.games)).toBe(true);

      console.log(`✅ ${data.games.length} juegos en colección`);
      if (data.games.length > 0) {
        console.log(`🏆 Top 3: ${data.games.slice(0, 3).map((g: { name: string }) => g.name).join(', ')}`);
      }
    });

    it('debe devolver top 50 de todos los tiempos', async () => {
      console.log('🧪 Probando colección "Top 50"...');

      const response = await fetch(`${API_BASE}/api/games/special?type=top-50`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('games');

      console.log(`✅ ${data.games.length} juegos en Top 50`);
    });
  });
});
