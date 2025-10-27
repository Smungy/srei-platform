"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SaveGameButtonProps {
  isAuthenticated: boolean;
  gameId?: number; // Marked optional since it's not currently used
  isSaved?: boolean;
  onSave?: () => Promise<void>;
}

export function SaveGameButton({
  isAuthenticated,
  isSaved = false,
  onSave,
}: SaveGameButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    // Si no está autenticado, redirigir a sign-up con mensaje amigable
    if (!isAuthenticated) {
      router.push("/auth/sign-up?message=register-to-save");
      return;
    }

    // Si está autenticado, ejecutar la función de guardar
    if (onSave) {
      setLoading(true);
      try {
        await onSave();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="gap-2"
    >
      <Heart
        className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
      />
      {loading ? "..." : isSaved ? "Guardado" : "Guardar"}
    </Button>
  );
}
