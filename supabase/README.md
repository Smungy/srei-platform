# Configuración de Base de Datos - Supabase

## 📋 Schema Overview

La base de datos consta de 5 tablas principales:

### 1. **profiles**

- Extiende la información de usuarios de Supabase Auth
- Almacena preferencias y datos adicionales del usuario

### 2. **saved_games**

- Juegos guardados/favoritos de cada usuario
- Incluye rating (1-5) y notas personales

### 3. **search_history**

- Historial de búsquedas del usuario
- Usado para análisis de patrones y mejora de recomendaciones

### 4. **game_embeddings**

- Vectores de embeddings de juegos (para IA)
- Requiere extensión `pgvector`

### 5. **user_game_interactions**

- Registra todas las interacciones (clicks, views, etc.)
- Para análisis de comportamiento y personalización

---

## 🚀 Pasos para Aplicar el Schema

### Opción 1: Dashboard de Supabase (Recomendado para MVP)

1. **Ve a tu proyecto en Supabase**: https://app.supabase.com
2. **Navega a SQL Editor** (icono de database en la barra lateral)
3. **Habilita la extensión vector**:

   - Ve a `Database` > `Extensions`
   - Busca **"vector"**
   - Click en **Enable**

4. **Ejecuta el schema**:

   - Abre una nueva query en SQL Editor
   - Copia todo el contenido de `supabase/schema.sql`
   - Click en **Run** (o Ctrl/Cmd + Enter)

5. **Verifica las tablas**:
   - Ve a `Database` > `Tables`
   - Deberías ver: `profiles`, `saved_games`, `search_history`, `game_embeddings`, `user_game_interactions`

### Opción 2: CLI de Supabase (Para Desarrollo Local)

```bash
# 1. Instala Supabase CLI
npm install -g supabase

# 2. Inicia sesión
supabase login

# 3. Vincula tu proyecto
supabase link --project-ref tu-project-ref

# 4. Aplica las migraciones
supabase db push

# 5. Para desarrollo local
supabase start
supabase db reset
```

---

## 🔐 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que aseguran:

- ✅ Los usuarios solo pueden ver y modificar sus propios datos
- ✅ Los embeddings de juegos son visibles para todos (lectura)
- ✅ Prevención de acceso no autorizado

---

## 🧪 Verificar la Instalación

### Test Query 1: Ver tu perfil

```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

### Test Query 2: Insertar un juego de prueba

```sql
INSERT INTO saved_games (user_id, game_id, game_data)
VALUES (
  auth.uid(),
  3498,
  '{"name": "Grand Theft Auto V", "background_image": "https://example.com/gta5.jpg"}'
);
```

### Test Query 3: Ver historial de búsquedas

```sql
SELECT * FROM search_history WHERE user_id = auth.uid();
```

---

## 📊 Tipos de Datos Importantes

### JSONB Fields

**profiles.preferences** (ejemplo):

```json
{
  "favorite_genres": ["action", "adventure", "rpg"],
  "platform": "pc",
  "language": "es"
}
```

**saved_games.game_data** (ejemplo):

```json
{
  "name": "The Witcher 3",
  "background_image": "https://...",
  "genres": ["rpg", "action"],
  "rating": 4.5,
  "released": "2015-05-19"
}
```

**search_history.search_metadata** (ejemplo):

```json
{
  "filters": {
    "min_rating": 4.0,
    "platforms": ["pc", "playstation"]
  }
}
```

---

## 🔄 Siguiente Paso

Una vez aplicado el schema:

1. **Verifica** que todas las tablas se crearon correctamente
2. **Prueba** crear un usuario nuevo y verifica que se cree su perfil automáticamente
3. **Listo** para crear las APIs y componentes de Next.js

---

## 💡 Notas Importantes

- **pgvector**: Necesario para embeddings de IA. Si no lo habilitas ahora, puedes hacerlo después.
- **Trigger automático**: Cuando un usuario se registra, se crea automáticamente su perfil.
- **Indexes**: Ya incluidos para optimizar consultas frecuentes.

---

## 🐛 Troubleshooting

**Error: "extension vector does not exist"**

- Solución: Habilita la extensión `vector` en Database > Extensions

**Error: "permission denied for table"**

- Solución: Verifica que RLS esté habilitado y las policies creadas

**Perfil no se crea automáticamente**

- Solución: Verifica que el trigger `on_auth_user_created` exista
