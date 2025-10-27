-- ============================================
-- SREI - Database Schema
-- Sistema de Recomendaciones de Entretenimiento Inteligente
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- Extiende la tabla de usuarios de Supabase Auth
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. SAVED_GAMES TABLE
-- Almacena los juegos guardados/favoritos de cada usuario
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_id INTEGER NOT NULL, -- ID del juego en RAWG API
  game_data JSONB NOT NULL, -- Datos completos del juego (nombre, imagen, etc.)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Rating del usuario (1-5)
  notes TEXT, -- Notas personales del usuario
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id) -- Un usuario no puede guardar el mismo juego dos veces
);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_saved_games_user_id ON public.saved_games(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_games_game_id ON public.saved_games(game_id);

-- RLS para saved_games
ALTER TABLE public.saved_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved games"
  ON public.saved_games
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved games"
  ON public.saved_games
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved games"
  ON public.saved_games
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved games"
  ON public.saved_games
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. SEARCH_HISTORY TABLE
-- Historial de búsquedas para mejorar las recomendaciones
-- ============================================
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  genres TEXT[] NOT NULL, -- Array de géneros seleccionados
  results_count INTEGER, -- Cantidad de resultados obtenidos
  clicked_games INTEGER[], -- IDs de juegos en los que hizo click
  search_metadata JSONB DEFAULT '{}', -- Metadata adicional (filtros, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para análisis de patrones
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_genres ON public.search_history USING GIN(genres);

-- RLS para search_history
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search history"
  ON public.search_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
  ON public.search_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. GAME_EMBEDDINGS TABLE
-- Almacena embeddings de juegos para recomendaciones con IA
-- ============================================
CREATE TABLE IF NOT EXISTS public.game_embeddings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id INTEGER UNIQUE NOT NULL, -- ID del juego en RAWG API
  embedding vector(1536), -- Vector de OpenAI (text-embedding-3-small tiene 1536 dimensiones)
  game_metadata JSONB NOT NULL, -- Metadata del juego (nombre, géneros, descripción, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para búsquedas de similitud (requiere extensión pgvector)
CREATE INDEX IF NOT EXISTS idx_game_embeddings_game_id ON public.game_embeddings(game_id);
-- CREATE INDEX IF NOT EXISTS idx_game_embeddings_vector ON public.game_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Esta tabla es pública para lectura (los embeddings son para todos)
ALTER TABLE public.game_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game embeddings"
  ON public.game_embeddings
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 5. USER_GAME_INTERACTIONS TABLE
-- Registra interacciones del usuario con juegos (clicks, tiempo de visualización, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_game_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_id INTEGER NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'click', 'save', 'unsave', 'rate'
  interaction_data JSONB DEFAULT '{}', -- Datos adicionales de la interacción
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para análisis de comportamiento
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_game_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_game_id ON public.user_game_interactions(game_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_game_interactions(interaction_type);

-- RLS para user_game_interactions
ALTER TABLE public.user_game_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions"
  ON public.user_game_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
  ON public.user_game_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_games_updated_at
  BEFORE UPDATE ON public.saved_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_embeddings_updated_at
  BEFORE UPDATE ON public.game_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Función para crear perfil automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- NOTA: Para habilitar pgvector (embeddings)
-- Ejecuta esto en tu proyecto de Supabase:
-- 1. Ve a Database > Extensions
-- 2. Busca "vector" y habilítala
-- 3. O ejecuta: CREATE EXTENSION IF NOT EXISTS vector;
-- ============================================
