import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  preferences: {
    favorite_genres?: string[];
    [key: string]: unknown;
  } | null;
  created_at: string;
  updated_at: string;
}

interface SavedGame {
  id: string;
  user_id: string;
  game_id: number;
  game_data: {
    name: string;
    background_image?: string;
    genres?: string[];
    [key: string]: unknown;
  };
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Obtener perfil del usuario si existe
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null };

  // Obtener juegos guardados
  const { data: savedGames } = await supabase
    .from('saved_games')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6) as { data: SavedGame[] | null };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-foreground mb-2">
          Dashboard Protegido
        </h1>
        <p className="text-lg text-muted-foreground">
          Bienvenido a tu área personal
        </p>
      </div>

      <div className="grid gap-6">
        {/* Perfil del Usuario */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Tu Perfil</h2>
          
          <div className="flex gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-3xl text-white shadow-lg">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Nombre
                </div>
                <div className="text-base font-medium text-foreground">
                  {profile?.full_name || user.user_metadata?.full_name || 'No especificado'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email
                </div>
                <div className="text-base font-medium text-foreground">
                  {user.email}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Miembro desde
                </div>
                <div className="text-base font-medium text-foreground">
                  {formatDate(user.created_at)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Username
                </div>
                <div className="text-base font-medium text-foreground">
                  {profile?.username || 'No configurado'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Juegos Favoritos */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Tus Juegos Favoritos
          </h2>
          
          {savedGames && savedGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedGames.map((game) => (
                <div
                  key={game.id}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div 
                    className="w-full h-36 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500"
                    style={{
                      backgroundImage: game.game_data.background_image 
                        ? `url(${game.game_data.background_image})` 
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  
                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                      {game.game_data.name}
                    </h3>
                    
                    {game.game_data.genres && game.game_data.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {game.game_data.genres.slice(0, 2).map((genre: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {game.rating && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>⭐</span>
                        <span>{game.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">Aún no has guardado ningún juego</p>
              <p className="text-sm">
                Explora juegos y guarda tus favoritos para verlos aquí
              </p>
            </div>
          )}
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-foreground mb-1">
              {savedGames?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Juegos Guardados
            </div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-foreground mb-1">
              {profile?.preferences?.favorite_genres?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Géneros Favoritos
            </div>
          </Card>

          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-foreground mb-1">
              {user.email_confirmed_at ? '✓' : '✗'}
            </div>
            <div className="text-sm text-muted-foreground">
              Email Verificado
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
