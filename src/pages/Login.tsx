import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.email.split('@')[0], // Default name from email
            },
          },
        });
        if (error) throw error;
        alert('Registro exitoso! Por favor verifica tu correo.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error';
      setError(message);
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
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isSignUp ? 'Empieza a controlar tus finanzas' : 'Bienvenido de nuevo'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-primary"
                placeholder="Contraseña"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[#F472B6] text-xs mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-[#6EE7F9] hover:text-[#A78BFA] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-red-300 text-sm text-center bg-red-900/20 border border-red-500/20 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : isSignUp ? (
                'Registrarse'
              ) : (
                'Ingresar'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-[#6EE7F9] hover:text-[#A78BFA] text-sm font-medium transition-colors"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
