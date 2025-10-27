import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full flex justify-center border-b border-b-foreground/10 h-16 bg-gradient-to-b from-background/70 via-background/60 to-background/50 backdrop-blur-md">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>SREI</Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-5">
        <div className="text-center max-w-3xl space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Sistema de Recomendaciones de Entretenimiento Inteligente
          </h1>
          <p className="text-xl text-muted-foreground">
            Descubre videojuegos personalizados con el poder de la IA
          </p>
        </div>

        {/* Categories (placeholder for now) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mt-8">
          <Link 
            href="/games" 
            className="p-8 border rounded-lg hover:border-foreground/50 transition-colors text-center"
          >
            <h3 className="text-2xl font-semibold">🎮 Videojuegos</h3>
            <p className="text-sm text-muted-foreground mt-2">Encuentra tu próximo juego favorito</p>
          </Link>
          
          <div className="p-8 border rounded-lg opacity-50 text-center">
            <h3 className="text-2xl font-semibold">🎬 Películas</h3>
            <p className="text-sm text-muted-foreground mt-2">Próximamente</p>
          </div>
          
          <div className="p-8 border rounded-lg opacity-50 text-center">
            <h3 className="text-2xl font-semibold">📚 Libros</h3>
            <p className="text-sm text-muted-foreground mt-2">Próximamente</p>
          </div>
          
          <div className="p-8 border rounded-lg opacity-50 text-center">
            <h3 className="text-2xl font-semibold">🎵 Música</h3>
            <p className="text-sm text-muted-foreground mt-2">Próximamente</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8">
        <p className="text-muted-foreground">© 2025 SREI - Todos los derechos reservados</p>
      </footer>
    </main>
  );
}
