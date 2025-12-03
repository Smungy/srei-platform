import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AnimatedLogo } from "@/components/animated-logo";
import { GameExplorer } from "@/components/game-explorer";
import Link from "next/link";

export default async function GamesPage() {
  const supabase = await createClient();
  
  // Obtener usuario si está autenticado (pero no redirigir si no lo está)
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full flex justify-center border-b border-b-foreground/10 h-16 bg-gradient-to-b from-background/70 via-background/60 to-background/50 backdrop-blur-md">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <AnimatedLogo />
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 w-full flex flex-col gap-8 p-5 max-w-7xl mx-auto">
        <div className="w-full">
          <h1 className="text-4xl font-bold">Descubre Videojuegos</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Explora por géneros, busca tus juegos favoritos o descubre nuevos títulos con recomendaciones IA
          </p>
          
          {/* Mensaje para usuarios no registrados */}
          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-accent/50 rounded-lg border border-border">
              <p className="text-sm">
                💡 <strong>Tip:</strong> <Link href="/auth/sign-up" className="underline">Regístrate</Link> para guardar tus favoritos y recibir recomendaciones personalizadas
              </p>
            </div>
          )}
        </div>

        {/* Componente principal de exploración de juegos */}
        <GameExplorer />
      </div>
    </div>
  );
}
