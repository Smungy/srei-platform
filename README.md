# SREI - Sistema de Recomendaciones de Entretenimiento Inteligente

Sistema inteligente de recomendaciones de entretenimiento con IA, enfocado en videojuegos.

## Stack Tecnológico

- **Framework**: Next.js 15 con App Router y Turbopack
- **Base de Datos**: Supabase (PostgreSQL + Auth + RLS)
- **Estilos**: Tailwind CSS + shadcn/ui
- **Animaciones**: Framer Motion (spring physics, stagger, transitions)
- **API de Juegos**: RAWG API
- **TypeScript**: Tipado completo en todo el proyecto

## Prerequisitos

- Node.js 18+ instalado
- pnpm instalado
- Git instalado

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd srei
```

### 2. Instalar Dependencias

```bash
pnpm install
```

Esto instalará todas las dependencias necesarias incluyendo:

- Next.js
- Supabase
- Framer Motion
- shadcn/ui
- Tailwind CSS

### 3. Configurar Variables de Entorno

**Usa las credenciales que te pasé**. Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<usa-la-url-que-te-pase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<usa-la-key-que-te-pase>

# RAWG API
RAWG_API_KEY=<usa-la-key-que-te-pase>

# OpenAI (para futuras features)
OPENAI_API_KEY=<usa-la-key-que-te-pase>
```

> **IMPORTANTE**: Nunca compartas estas keys públicamente ni las subas a Git. El archivo `.env.local` ya está en `.gitignore`.

### 4. Ejecutar el Proyecto

```bash
pnpm dev
```

El proyecto estará disponible en: **http://localhost:3000**

## � Uso de la Aplicación

### Páginas Principales:

1. **/** - Página de inicio con presentación del proyecto
2. **/games** - Explorador de videojuegos (página principal)
3. **/auth/login** - Inicio de sesión (opcional)
4. **/auth/sign-up** - Registro de usuarios (opcional)


## � Estructura del Proyecto

```
srei/
├── app/                          # App Router de Next.js
│   ├── page.tsx                 # Página principal
│   ├── layout.tsx               # Layout raíz
│   ├── globals.css              # Estilos globales
│   ├── games/                   # Sección de videojuegos
│   │   └── page.tsx            # Explorador de juegos
│   ├── auth/                    # Autenticación
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── ...
│   ├── protected/               # Área protegida
│   └── api/                     # API Routes
│       └── games/               # Endpoints de juegos
│           ├── route.ts         # GET /api/games
│           ├── genres/route.ts  # GET /api/games/genres
│           └── [id]/route.ts    # GET /api/games/:id
├── components/                   # Componentes React
│   ├── game-explorer.tsx        # Componente principal de exploración
│   ├── theme-switcher.tsx       # Selector de tema
│   ├── auth-button.tsx          # Botón de autenticación
│   └── ui/                      # Componentes de shadcn/ui
├── hooks/                        # Custom React Hooks
│   └── useGames.ts              # Hooks para fetch de datos
├── lib/                          # Librerías y utilidades
│   ├── supabase/                # Configuración de Supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── rawg/                    # Cliente de RAWG API
│   │   └── client.ts
│   └── utils.ts                 # Utilidades generales
├── supabase/                     # Configuración de base de datos
│   └── schema.sql               # Schema de PostgreSQL
├── .env.local                    # Variables de entorno (NO SUBIR A GIT)
├── .env.example                  # Ejemplo de variables de entorno
└── package.json                  # Dependencias del proyecto
```

## Base de Datos (Supabase)

El proyecto usa Supabase con las siguientes tablas:

- **profiles**: Perfiles de usuario
- **saved_games**: Juegos guardados por usuarios
- **search_history**: Historial de búsquedas
- **game_embeddings**: Embeddings de juegos para IA
- **user_game_interactions**: Interacciones usuario-juego

> La base de datos ya está configurada. No necesitas ejecutar migraciones.

## APIs Utilizadas

### RAWG API

- **Propósito**: Obtener información de videojuegos
- **Endpoints usados**:
  - `/games` - Búsqueda de juegos
  - `/genres` - Lista de géneros
  - `/games/{id}` - Detalles de un juego

### Supabase

- **Auth**: Autenticación de usuarios
- **Database**: PostgreSQL con Row Level Security
- **Storage**: (Futuro) Para imágenes de perfil

## Troubleshooting

### El proyecto no inicia

```bash
# Elimina node_modules y reinstala
rm -rf node_modules
pnpm install
```

### Error de variables de entorno

- Verifica que `.env.local` existe y tiene las 4 variables
- Reinicia el servidor después de crear/modificar `.env.local`

### Error de Supabase

- Verifica que las URLs y keys sean correctas
- Asegúrate de que no haya espacios extras en las variables

### Imágenes de juegos no cargan

- La RAWG API tiene límite de requests
- Espera unos segundos y recarga

## Scripts Disponibles

```bash
pnpm dev          # Inicia servidor de desarrollo
pnpm build        # Construye para producción
pnpm start        # Inicia servidor de producción
pnpm lint         # Ejecuta ESLint
```

## 🔄 Próximas Funcionalidades

- [ ] Sistema de favoritos funcional
- [ ] Recomendaciones con IA (OpenAI)
- [ ] Paginación de resultados
- [ ] Filtros avanzados
- [ ] Sección de películas
- [ ] Sección de libros
- [ ] Sección de música

## 🤝 Equipo

Este es el proyecto SREI desarrollado en equipo. Si tienes dudas sobre el código o necesitas ayuda, contacta a tu compañero de equipo.

## 📄 Licencia

Proyecto académico/personal - Todos los derechos reservados

---

**¡Listo para desarrollar!** 🚀 Cualquier duda, revisa este README o contacta al equipo.
