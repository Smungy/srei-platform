"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Button onClick={logout} size="sm" variant="ghost">
      <LogOut className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Cerrar Sesión</span>
    </Button>
  );
}
