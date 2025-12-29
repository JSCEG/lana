import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, User as UserIcon, MapPin, Mail } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'El nombre es requerido'),
  address: z.string().min(5, 'La dirección es requerida'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      setValue('fullName', user.user_metadata.full_name || '');
      setValue('address', user.user_metadata.address || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          address: data.address,
        },
      });

      if (error) throw error;
      setSuccessMessage('Perfil actualizado correctamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el perfil';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-[--lana-text]">Mi Perfil</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Gestiona tu información personal
          </p>
        </div>
      </header>

      <div className="glass-card p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field (Read Only) */}
            <div>
              <label className="block text-sm font-medium text-[--lana-text] mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-primary pl-10 opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[--lana-text] mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  className="input-primary pl-10"
                  placeholder="Tu nombre completo"
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <p className="text-[#F472B6] text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[--lana-text] mb-1">
                Dirección
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  id="address"
                  type="text"
                  className="input-primary pl-10"
                  placeholder="Tu dirección completa"
                  {...register('address')}
                />
              </div>
              {errors.address && (
                <p className="text-[#F472B6] text-xs mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="text-red-700 bg-red-100 border border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-500/20 text-sm text-center p-2 rounded">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="text-green-700 bg-green-100 border border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-500/20 text-sm text-center p-2 rounded">
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
