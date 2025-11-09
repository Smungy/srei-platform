-- Tabla para almacenar logs de recomendaciones generadas
-- Esta tabla es OPCIONAL pero útil para evitar regenerar constantemente

CREATE TABLE IF NOT EXISTS recommendation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendations JSONB NOT NULL,
  based_on_games INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_user_id 
ON recommendation_logs(user_id);

-- Índice para ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_created_at 
ON recommendation_logs(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE recommendation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver sus propios logs
CREATE POLICY "Users can view their own recommendation logs"
ON recommendation_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Los usuarios solo pueden insertar sus propios logs
CREATE POLICY "Users can insert their own recommendation logs"
ON recommendation_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden eliminar sus propios logs
CREATE POLICY "Users can delete their own recommendation logs"
ON recommendation_logs FOR DELETE
USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE recommendation_logs IS 'Almacena el historial de recomendaciones de IA generadas para cada usuario';
COMMENT ON COLUMN recommendation_logs.user_id IS 'ID del usuario que recibió las recomendaciones';
COMMENT ON COLUMN recommendation_logs.recommendations IS 'Array de recomendaciones en formato JSON';
COMMENT ON COLUMN recommendation_logs.based_on_games IS 'IDs de los juegos en los que se basaron las recomendaciones';
