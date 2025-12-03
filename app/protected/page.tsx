import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { SavedGamesGrid } from "@/components/saved-games-grid";
import { EditProfileForm } from "@/components/edit-profile-form";

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

  // Función para eliminar un juego de favoritos
  const handleRemoveGame = async (gameId: number) => {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase
      .from('saved_games')
      .delete()
      .eq('user_id', user.id)
      .eq('game_id', gameId);
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
          
          <EditProfileForm
            userId={user.id}
            initialFullName={profile?.full_name || user.user_metadata?.full_name || null}
            initialUsername={profile?.username || user.user_metadata?.username || null}
          />

          {/* Info adicional */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email
                </div>
                <div className="text-base font-medium text-foreground flex items-center gap-2">
                  {user.email}
                  {user.email_confirmed_at && (
                    <span className="text-green-500" title="Email verificado">
                      ✓
                    </span>
                  )}
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
            </div>
          </div>
        </Card>

        {/* Juegos Favoritos */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Tus Juegos Favoritos
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">
                {savedGames?.length || 0}
              </span>
              <span className="text-sm text-muted-foreground">
                {savedGames?.length === 1 ? 'juego' : 'juegos'}
              </span>
            </div>
          </div>
          
          <SavedGamesGrid 
            initialGames={(savedGames || []) as never} 
            onRemove={handleRemoveGame}
          />
        </Card>
      </div>
    </div>
  );
}
