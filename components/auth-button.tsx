import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { User } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {user.email}
      </span>
      <Button asChild size="sm" variant="outline">
        <Link href="/protected" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Perfil</span>
        </Link>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Iniciar Sesión</Link>
      </Button>
    </div>
  );
}
