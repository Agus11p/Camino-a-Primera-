import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Sparkles, 
  Chrome, 
  Loader2, 
  AlertCircle,
  Mail,
  Lock,
  UserPlus,
  LogIn
} from 'lucide-react';

interface UnrespiroAuthProps {
  onAuthSuccess: (sessionUser: any, isGuest: boolean) => void;
  onOpenInfoAndLegal?: (tab: 'about' | 'privacy' | 'contact' | 'guides') => void;
}

export default function UnrespiroAuth({ onAuthSuccess, onOpenInfoAndLegal }: UnrespiroAuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Tab control: 'google' | 'email_login' | 'email_register'
  const [authTab, setAuthTab] = useState<'google' | 'email_login' | 'email_register'>('google');
  
  // Email state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Listen for success message from popup (after OAuth callback completes)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        if (event.data.session?.user) {
          onAuthSuccess(event.data.session.user, false);
        } else if (supabase) {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              onAuthSuccess(session.user, false);
            }
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAuthSuccess]);

  // Social Auth Handler with Popup/Redirect support depending on the context
  const handleSocialLogin = async (provider: 'google') => {
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase no está completamente configurado.");
      return;
    }

    try {
      setLoading(true);
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;

      if (isIframe) {
        // En un iframe (como el previsualizador de AI Studio), debemos usar un popup para evitar bloqueos
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: true,
          }
        });
        if (error) throw error;

        if (data?.url) {
          // Safe popup generation centered coordinates
          const width = 600;
          const height = 750;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          window.open(
            data.url,
            'supabase_oauth_popup',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no`
          );
        } else {
          throw new Error('No se recibió la URL de autorización de Supabase.');
        }
      } else {
        // En celular o PC directo (fuera de iframe), usamos redirección directa para máxima compatibilidad
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: false,
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || `Error al conectar con ${provider}.`);
      setLoading(false);
    }
  };

  // Email Sign In / Sign Up handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase no está completamente configurado.");
      return;
    }

    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      if (authTab === 'email_register') {
        // Register new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;

        if (data?.session?.user) {
          onAuthSuccess(data.session.user, false);
        } else {
          setSuccess("¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.");
          setAuthTab('email_login');
        }
      } else {
        // Login existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        if (data?.session?.user) {
          onAuthSuccess(data.session.user, false);
        } else {
          throw new Error('No se pudo establecer la sesión con estas credenciales.');
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al autenticar con el servidor de base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col justify-between px-6 py-10 font-sans relative overflow-hidden">
      {/* Visual Organic Background Gradient Bloom */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top minimalistic header */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400/90 font-mono">
            Camino a Primera
          </span>
        </div>
        
        {!isSupabaseConfigured && (
          <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded-lg uppercase font-bold tracking-wider font-mono">
            FALTA SUPABASE (SandBox Activo)
          </span>
        )}
      </div>

      {/* Middle content / Form */}
      <div className="max-w-md w-full mx-auto my-auto py-8 z-10 space-y-8">
        {/* Title matches the design perfectly */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.25em] font-mono block">
            Entrenamiento & Enfoque Mental
          </span>
          <h1 className="text-[36px] sm:text-[42px] font-black text-white leading-[1.1] font-sans tracking-tight animate-fade-in">
            Comienza tu <br/>
            <span className="italic font-light text-neutral-300">Camino Diario</span>
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm font-light animate-fade-in">
            Monitorea goles, asistencias de partidos y mantén tu rendimiento guardado en la nube.
          </p>
        </div>

        {/* Error / Success Banners */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
            >
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Login Options Container */}
        <div className="bg-neutral-900/60 border border-white/5 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
          
          {/* Quick tab switchers */}
          <div className="grid grid-cols-3 gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
            <button
              type="button"
              onClick={() => { setError(null); setSuccess(null); setAuthTab('google'); }}
              className={`py-2 text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                authTab === 'google' 
                  ? 'bg-emerald-500 text-neutral-950 font-black shadow' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => { setError(null); setSuccess(null); setAuthTab('email_login'); }}
              className={`py-2 text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                authTab === 'email_login' 
                  ? 'bg-emerald-500 text-neutral-950 font-black shadow' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => { setError(null); setSuccess(null); setAuthTab('email_register'); }}
              className={`py-2 text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                authTab === 'email_register' 
                  ? 'bg-emerald-500 text-neutral-950 font-black shadow' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {authTab === 'google' ? (
              <div className="space-y-5">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xs font-black text-neutral-300 uppercase tracking-wider pl-0.5">
                    Conexión con Google
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    Inicia sesión de forma instantánea mediante nuestro flujo seguro compatible con iFrames.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-between gap-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-black py-4 px-5 rounded-xl transition duration-200 cursor-pointer uppercase text-xs tracking-wider min-h-[48px] shadow shadow-emerald-500/10 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <Chrome className="w-4 h-4" />
                    <span>Continuar con Google</span>
                  </div>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  ) : (
                    <span className="text-[9px] font-mono text-neutral-950/60 bg-neutral-950/10 px-2 py-0.5 rounded-md font-extrabold">POPUP</span>
                  )}
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xs font-black text-neutral-300 uppercase tracking-wider pl-0.5">
                    {authTab === 'email_login' ? 'Ingreso con Correo' : 'Registro de Cuenta'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    {authTab === 'email_login' 
                      ? 'Introduce tu correo y contraseña registrados para acceder a la base de datos.'
                      : 'Crea una cuenta para guardar de forma permanente todo tu progreso futbolístico.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-neutral-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-neutral-550 focus:border-emerald-500 focus:outline-none transition animate-fade-in"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="password"
                      placeholder="Contraseña (mínimo 6 carac.)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-neutral-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-neutral-550 focus:border-emerald-500 focus:outline-none transition animate-fade-in"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-black py-3.5 px-4 rounded-xl transition duration-200 cursor-pointer uppercase text-xs tracking-wider active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  ) : authTab === 'email_login' ? (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Ingresar con Correo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Registrar nueva cuenta</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Silent entry option: Sandbox play */}
        <div className="text-center">
          <button
            onClick={() => onAuthSuccess(null, true)}
            className="text-[11px] text-neutral-450 hover:text-emerald-400 font-bold uppercase tracking-wider transition underline decoration-neutral-750 hover:decoration-emerald-500 underline-offset-4 cursor-pointer"
          >
            Entrar como Invitado (Modo Sin Cuenta / Local)
          </button>
        </div>
      </div>

      {/* Bottom info banner info */}
      <div className="text-center z-10 font-mono space-y-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] text-neutral-500 font-sans font-semibold">
          <button 
            type="button"
            onClick={() => onOpenInfoAndLegal?.('about')} 
            className="hover:text-emerald-400 hover:underline transition cursor-pointer"
          >
            Acerca de
          </button>
          <span className="text-neutral-850 select-none">•</span>
          <button 
            type="button"
            onClick={() => onOpenInfoAndLegal?.('privacy')} 
            className="hover:text-emerald-400 hover:underline transition cursor-pointer"
          >
            Política de Privacidad
          </button>
          <span className="text-neutral-850 select-none">•</span>
          <button 
            type="button"
            onClick={() => onOpenInfoAndLegal?.('contact')} 
            className="hover:text-emerald-400 hover:underline transition cursor-pointer"
          >
            Contacto
          </button>
          <span className="text-neutral-850 select-none">•</span>
          <button 
            type="button"
            onClick={() => onOpenInfoAndLegal?.('guides')} 
            className="hover:text-emerald-400 hover:underline transition cursor-pointer"
          >
            Guías de Rendimiento
          </button>
        </div>
        <p className="text-[10px] text-neutral-600 flex items-center justify-center gap-1.5 uppercase font-semibold">
          <span>Camino a Primera · Base de Datos Activa</span>
        </p>
      </div>
    </div>
  );
}
