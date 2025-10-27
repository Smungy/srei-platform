// ============================================
// Database Types - Generados desde Supabase Schema
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// PROFILES
// ============================================
export interface Profile {
  id: string // UUID del usuario (auth.users.id)
  username: string | null
  full_name: string | null
  avatar_url: string | null
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  favorite_genres?: string[]
  platform?: string
  language?: string
  [key: string]: unknown
}

// ============================================
// SAVED GAMES
// ============================================
export interface SavedGame {
  id: string
  user_id: string
  game_id: number
  game_data: GameData
  rating: number | null // 1-5
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GameData {
  name: string
  background_image: string
  genres: string[]
  rating?: number
  released?: string
  platforms?: string[]
  short_screenshots?: string[]
  description?: string
  [key: string]: unknown
}

// ============================================
// SEARCH HISTORY
// ============================================
export interface SearchHistory {
  id: string
  user_id: string
  genres: string[] // Array de géneros
  results_count: number | null
  clicked_games: number[] | null // IDs de juegos clickeados
  search_metadata: SearchMetadata
  created_at: string
}

export interface SearchMetadata {
  filters?: {
    min_rating?: number
    platforms?: string[]
    year_from?: number
    year_to?: number
  }
  [key: string]: unknown
}

// ============================================
// GAME EMBEDDINGS
// ============================================
export interface GameEmbedding {
  id: string
  game_id: number
  embedding: number[] // Vector de OpenAI
  game_metadata: GameMetadata
  created_at: string
  updated_at: string
}

export interface GameMetadata {
  name: string
  genres: string[]
  description: string
  tags?: string[]
  [key: string]: unknown
}

// ============================================
// USER GAME INTERACTIONS
// ============================================
export interface UserGameInteraction {
  id: string
  user_id: string
  game_id: number
  interaction_type: InteractionType
  interaction_data: InteractionData
  created_at: string
}

export type InteractionType = 'view' | 'click' | 'save' | 'unsave' | 'rate'

export interface InteractionData {
  duration_seconds?: number
  source?: string // 'search', 'recommendations', 'favorites'
  [key: string]: unknown
}

// ============================================
// SUPABASE DATABASE INTERFACE
// ============================================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      saved_games: {
        Row: SavedGame
        Insert: Omit<SavedGame, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SavedGame, 'id' | 'user_id' | 'game_id' | 'created_at' | 'updated_at'>>
      }
      search_history: {
        Row: SearchHistory
        Insert: Omit<SearchHistory, 'id' | 'created_at'>
        Update: never // Read-only después de creación
      }
      game_embeddings: {
        Row: GameEmbedding
        Insert: Omit<GameEmbedding, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GameEmbedding, 'id' | 'game_id' | 'created_at' | 'updated_at'>>
      }
      user_game_interactions: {
        Row: UserGameInteraction
        Insert: Omit<UserGameInteraction, 'id' | 'created_at'>
        Update: never // Read-only después de creación
      }
    }
  }
}

// ============================================
// UTILITY TYPES
// ============================================

// Para insertar en la base de datos
export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertSavedGame = Database['public']['Tables']['saved_games']['Insert']
export type InsertSearchHistory = Database['public']['Tables']['search_history']['Insert']
export type InsertGameEmbedding = Database['public']['Tables']['game_embeddings']['Insert']
export type InsertUserGameInteraction = Database['public']['Tables']['user_game_interactions']['Insert']

// Para actualizar en la base de datos
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateSavedGame = Database['public']['Tables']['saved_games']['Update']
export type UpdateGameEmbedding = Database['public']['Tables']['game_embeddings']['Update']
