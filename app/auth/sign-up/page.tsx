import { SignUpForm } from "@/components/sign-up-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const showSaveMessage = params.message === "register-to-save";

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-[400px] space-y-4">
        {showSaveMessage && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-center">
              <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                💡 Regístrate para guardar tus juegos favoritos!
              </span>
              <br />
              <span className="text-yellow-700 dark:text-yellow-300 text-xs">
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
