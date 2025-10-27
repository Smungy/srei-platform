import { SignUpForm } from "@/components/sign-up-form";

export default function Page({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const showSaveMessage = searchParams.message === "register-to-save";

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-4">
        {showSaveMessage && (
          <div className="p-4 bg-accent rounded-lg border border-border">
            <p className="text-sm text-center">
              🎮 <strong>¡Regístrate para guardar tus juegos favoritos!</strong>
              <br />
              <span className="text-muted-foreground text-xs">
                También obtendrás recomendaciones personalizadas
              </span>
            </p>
          </div>
        )}
        <SignUpForm />
      </div>
    </div>
  );
}
