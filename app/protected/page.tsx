import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Dashboard Protegido</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido a tu área personal
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Tu Perfil</h2>
        <div className="border rounded-lg p-4">
          <pre className="text-xs font-mono overflow-auto">
            {JSON.stringify(data.claims, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
