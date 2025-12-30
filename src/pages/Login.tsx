import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Correo inválido').refine((val) => {
    const domain = val.split('@')[1];
    if (!domain) return true;
    const commonTypos = {
      'hotmial.com': 'hotmail.com',
      'gamil.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'outlok.com': 'outlook.com',
      'hotmal.com': 'hotmail.com',
      'gmial.com': 'gmail.com'
    };
    return !Object.keys(commonTypos).includes(domain);
  }, {
    message: 'Parece que hay un error en el dominio del correo (ej: hotmial -> hotmail)'
  }),
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        const { data: authData, error } = await supabase.auth.signUp({
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

        // Si hay sesión, el usuario se auto-confirmó (login automático)
        if (authData.session) {
          navigate('/');
        } else {
          // Si no hay sesión, requiere verificación manual (fallback)
          setShowSuccessModal(true);
        }
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
      let message = err instanceof Error ? err.message : 'Ocurrió un error';

      // Traducir errores comunes
      if (message.includes('User already registered') || message.includes('already registered')) {
        message = 'Este correo ya está registrado. Por favor inicia sesión.';
      } else if (message.includes('Invalid login credentials')) {
        message = 'Credenciales inválidas. Verifica tu correo y contraseña.';
      }

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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10 text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Registro Exitoso!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Hemos enviado un enlace de confirmación a tu correo electrónico. Por favor verifícalo para iniciar sesión.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setIsSignUp(false);
              }}
              className="w-full py-2 px-4 btn-primary rounded-lg text-white font-medium shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              Entendido, ir a Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
