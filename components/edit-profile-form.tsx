'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X, Loader2 } from 'lucide-react';

interface EditProfileFormProps {
  userId: string;
  initialFullName: string | null;
  initialUsername: string | null;
}

export function EditProfileForm({ userId, initialFullName, initialUsername }: EditProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(initialFullName || '');
  const [username, setUsername] = useState(initialUsername || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Validar username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (username && !usernameRegex.test(username.trim())) {
      setError("El username debe tener entre 3-20 caracteres (letras, números y _)");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const cleanUsername = username.trim().toLowerCase();

      // Verificar si el username ya existe (si cambió)
      if (cleanUsername && cleanUsername !== initialUsername) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .neq('id', userId)
          .single();

        if (existingUser) {
          setError("Este username ya está en uso. Elige otro.");
          setIsLoading(false);
          return;
        }
      }

      // Actualizar perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          username: cleanUsername || null,
          updated_at: new Date().toISOString(),
        } as never);

      if (profileError) {
        throw profileError;
      }

      // También actualizar los metadatos del usuario
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          username: cleanUsername,
        }
      });

      if (userError) {
        console.error('Error updating user metadata:', userError);
      }

      setSuccess(true);
      setIsEditing(false);
      
      // Recargar la página para mostrar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(initialFullName || '');
    setUsername(initialUsername || '');
    setError(null);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex gap-6 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-3xl text-white shadow-lg">
            {fullName ? fullName.charAt(0).toUpperCase() : '?'}
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Nombre
              </div>
              <div className="text-base font-medium text-foreground">
                {fullName || 'No especificado'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Username
              </div>
              <div className="text-base font-medium text-foreground">
                {username ? `@${username}` : 'No configurado'}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar perfil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-6 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-3xl text-white shadow-lg">
            {fullName ? fullName.charAt(0).toUpperCase() : '?'}
          </div>
        </div>

        {/* Formulario de Edición */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName" className="text-sm font-semibold">
                Nombre completo
              </Label>
              <Input
                id="edit-fullName"
                type="text"
                placeholder="Tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-sm font-semibold">
                Username
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="edit-username"
                  type="text"
                  placeholder="tu_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="bg-muted/50 pl-8"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tu apodo único (3-20 caracteres, letras, números y _)
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-600">¡Perfil actualizado correctamente!</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
