import { useState, useEffect } from 'react';
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
  fullName: z.string().optional(),
  address: z.string().optional(),
});

const signUpSchema = loginSchema.extend({
  fullName: z.string().min(2, 'El nombre es requerido'),
  address: z.string().min(5, 'La dirección es requerida'),
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
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : loginSchema),
  });

  // Reset form when switching modes
  useEffect(() => {
    reset();
    setError(null);
  }, [isSignUp, reset]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) return null;

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!data.fullName || !data.address) {
          throw new Error('Faltan datos requeridos');
        }
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              address: data.address,
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
        if (error) {
          // Handle specific auth errors if needed, but generic throw is fine for now
          throw error;
        }
        // Force session refresh or check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          // If login appeared successful but no session, it might be an edge case
          // Retry fetching session or just proceed, auth listener in context should pick it up
        }
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
          <img src="https://cdn.sassoapps.com/lana/l_lana.png" alt="Lana Logo" className="mx-auto h-24 w-24 object-contain drop-shadow-[0_0_10px_rgba(110,231,249,0.5)]" />
          <h2 className="mt-6 text-center text-3xl font-bold font-heading tracking-wide">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Empieza a controlar tus finanzas' : 'Bienvenido de nuevo'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="fullName" className="sr-only">
                    Nombre Completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    className="input-primary"
                    placeholder="Nombre Completo"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-[#F472B6] text-xs mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="address" className="sr-only">
                    Dirección
                  </label>
                  <input
                    id="address"
                    type="text"
                    autoComplete="street-address"
                    required
                    className="input-primary"
                    placeholder="Dirección"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-[#F472B6] text-xs mt-1">{errors.address.message}</p>
                  )}
                </div>
              </>
            )}
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
            <div className="text-red-700 bg-red-100 border border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-500/20 text-sm text-center p-2 rounded">
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
