import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Correo inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Se ha enviado un enlace de recuperación a tu correo electrónico.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error al enviar el correo';
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
          <img src="https://cdn.sassoapps.com/lana/lanalogo.png" alt="Lana Logo" className="mx-auto h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(110,231,249,0.5)]" />
          <h2 className="mt-6 text-center text-3xl font-bold text-white font-heading tracking-wide">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Correo Electrónico
              </label>
              <input
                id="email-address"
                type="email"
                autoComplete="email"
                required
                className="input-primary"
                placeholder="Correo Electrónico"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[#F472B6] text-xs mt-1">{errors.email.message}</p>
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
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enviar Enlace'}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <Link
              to="/login"
              className="flex items-center text-sm font-medium text-[#6EE7F9] hover:text-[#A78BFA] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
