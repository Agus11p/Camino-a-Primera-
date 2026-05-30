import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Sparkles, 
  Chrome, 
  Apple, 
  Loader2, 
  AlertCircle
} from 'lucide-react';

interface UnrespiroAuthProps {
  onAuthSuccess: (sessionUser: any, isGuest: boolean) => void;
}

export default function UnrespiroAuth({ onAuthSuccess }: UnrespiroAuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAppleComingSoon, setShowAppleComingSoon] = useState(false);

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

  // Social Auth Handler
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    
    if (!isSupabaseConfigured) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onAuthSuccess({ email: `atleta.${provider}@example.com`, id: `mock-${provider}-id` }, false);
      }, 1000);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase!.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        }
      });
      if (error) throw error;

      if (data?.url) {
        // Center-aligned popup window
        const width = 600;
        const height = 750;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          data.url,
          'supabase_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no`
        );
      }
    } catch (err: any) {
      setError(err.message || `Error al conectar con ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070908] text-neutral-200 flex flex-col justify-between px-6 py-10 font-sans relative overflow-hidden">
      {/* Visual Organic Background Gradient Bloom */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] bg-emerald-950/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-amber-950/15 rounded-full blur-[120px] pointer-events-none" />

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
      <div className="max-w-md w-full mx-auto my-auto py-8 z-10 space-y-10">
        {/* Title matches the design perfectly */}
        <div className="space-y-4 text-center sm:text-left">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.25em] font-mono block">
            Entrenamiento & Enfoque Mental
          </span>
          <h1 className="text-[40px] sm:text-[48px] font-black text-white leading-[1.1] font-sans tracking-tight">
            Comienza tu <br/>
            <span className="italic font-light text-neutral-300">Camino Diario</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-450 leading-relaxed max-w-sm font-light">
            Monitorea goles, asistencias de partidos y mantén tu estado físico enfocado de manera simple y minimalista.
          </p>
        </div>

        {/* Error Banners */}
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
        </AnimatePresence>

        {/* Clean Login Options Container */}
        <div className="bg-[#111312]/80 border border-white/5 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.12em] block font-mono pl-1">
              Iniciar sesión
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Ingresa de forma instantánea mediante tu cuenta preferida.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-between gap-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-black py-4.5 px-5 rounded-xl transition duration-200 cursor-pointer uppercase text-xs tracking-wider font-sans shadow shadow-emerald-500/10"
            >
              <div className="flex items-center gap-3">
                <Chrome className="w-4 h-4" />
                <span>Continuar con Google</span>
              </div>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
              ) : (
                <span className="text-[9px] font-mono text-neutral-900/60 bg-neutral-950/10 px-2 py-0.5 rounded-md font-bold">ACTIVO</span>
              )}
            </button>

            <button
              onClick={() => setShowAppleComingSoon(true)}
              className="w-full flex items-center justify-between gap-4 bg-[#171918] hover:bg-white/5 text-neutral-200 font-bold py-4.5 px-5 rounded-xl border border-white/5 transition duration-200 text-xs uppercase tracking-wider"
              type="button"
            >
              <div className="flex items-center gap-3">
                <Apple className="w-4 h-4 text-neutral-300" />
                <span>Continuar con Manzana</span>
              </div>
              <span className="text-[9px] font-mono text-neutral-450 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">PRÓXIMAMENTE</span>
            </button>
          </div>
        </div>

        {/* Silent entry option: Sandbox play */}
        <div className="text-center">
          <button
            onClick={() => onAuthSuccess(null, true)}
            className="text-[11px] text-neutral-450 hover:text-emerald-400 font-bold uppercase tracking-wider transition underline decoration-neutral-750 hover:decoration-emerald-500 underline-offset-4"
          >
            Entrar como Invitado (Modo Sin Cuenta / Local)
          </button>
        </div>
      </div>

      {/* Bottom info banner info */}
      <div className="text-center z-10">
        <p className="text-[10px] text-neutral-600 font-mono flex items-center justify-center gap-1.5">
          <span>Aplicación Camino Futbolista v1.2</span>
        </p>
      </div>

      {/* Apple Coming Soon Overlay */}
      <AnimatePresence>
        {showAppleComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0f1110] border border-white/10 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">Iniciar sesión con Apple</h3>
                <p className="text-xs text-neutral-450 leading-relaxed">
                  Esta característica estará disponible <strong>próximamente</strong> para que puedas ingresar con tu Apple ID de forma rápida y segura.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAppleComingSoon(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

