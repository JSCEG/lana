import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { session } = useAuth(); // We need to be signed in to update the password
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // If there is no session, it might be that the token hasn't been processed yet 
    // or the link is invalid. Supabase usually handles the hash processing automatically.
    // However, if we land here without a session after a short delay, we should redirect.
    // For now, we'll let the user try to submit. If they aren't logged in, the update will fail.
  }, [session]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Contraseña actualizada exitosamente. Redirigiendo...',
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error al actualizar la contraseña';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-card">
        <div className="text-center">
          <img src="https://cdn.sassoapps.com/lana/l_lana.png" alt="Lana Logo" className="mx-auto h-24 w-24 object-contain drop-shadow-[0_0_10px_rgba(110,231,249,0.5)]" />
          <h2 className="mt-6 text-center text-3xl font-bold font-heading tracking-wide">
            Establecer Nueva Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Ingresa tu nueva contraseña a continuación.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">
                Nueva Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                className="input-primary"
                placeholder="Nueva Contraseña"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[#F472B6] text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="input-primary"
                placeholder="Confirmar Contraseña"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-[#F472B6] text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {message && (
            <div
              className={`text-sm text-center p-2 rounded border ${message.type === 'success'
                ? 'bg-green-900/20 text-green-300 border-green-500/20'
                : 'bg-red-900/20 text-red-300 border-red-500/20'
                }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
