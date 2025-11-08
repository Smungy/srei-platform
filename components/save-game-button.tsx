"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SaveGameButtonProps {
  gameData: {
    id: number;
    name: string;
    background_image?: string;
    rating?: number;
    genres?: Array<{ id: number; name: string }>;
    [key: string]: unknown;
  };
  isAuthenticated: boolean;
  isSaved?: boolean;
  onToggle?: (gameId: number) => Promise<void>;
}

export function SaveGameButton({
  gameData,
  isAuthenticated,
  isSaved = false,
  onToggle,
}: SaveGameButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleClick = async () => {
    // Si no está autenticado, redirigir a sign-up con mensaje amigable
    if (!isAuthenticated) {
      router.push("/auth/sign-up?message=register-to-save");
      return;
    }

    // Si está autenticado, ejecutar la función de toggle
    if (onToggle) {
      setLoading(true);
      try {
        await onToggle(gameData.id);
        setSaved(!saved);
      } catch (error) {
        console.error('Error toggling save:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="gap-2"
    >
      <Heart
        className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
      />
      {loading ? "..." : saved ? "Guardado" : "Guardar"}
    </Button>
  );
}
