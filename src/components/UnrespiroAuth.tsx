import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Chrome, 
  Apple, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface UnrespiroAuthProps {
  onAuthSuccess: (sessionUser: any, isGuest: boolean) => void;
}

export default function UnrespiroAuth({ onAuthSuccess }: UnrespiroAuthProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Send magical 6-digit OTP code or Magic link
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured) {
      // Sandbox mode mock
      setTimeout(() => {
        setLoading(false);
        setStep('code');
        setSuccessMsg('Código de verificación de prueba enviado (Ingresa cualquier 6 dígitos).');
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase!.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      setStep('code');
      setSuccessMsg('¡Enviado! Revisa tu bandeja de entrada para ver el código de acceso.');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el código de verificación.');
    } finally {
      setLoading(false);
    }
  };

  // Verify code / OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      // Sandbox mock validation
      setTimeout(() => {
        setLoading(false);
        onAuthSuccess({ email, id: 'mock-user-id' }, false);
      }, 1200);
      return;
    }

    try {
      const { data, error } = await supabase!.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      });

      if (error) throw error;
      if (data?.user) {
        onAuthSuccess(data.user, false);
      } else {
        throw new Error('No se pudo validar la sesión.');
      }
    } catch (err: any) {
      setError(err.message || 'Código inválido o expirado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
      const { error } = await supabase!.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Error al conectar con ${provider}.`);
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
            Camino Futbolista
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
        {/* Title */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.25em] font-mono block">
            Entrenamiento & Enfoque Mental
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight font-sans tracking-tight">
            Comienza tu <br/>
            <span className="italic font-light text-neutral-300">Camino Diario</span>
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm font-light">
            Monitorea goles, asistencias de partidos y mantén tu estado físico enfocado de manera simple y minimalista.
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

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Forms Container with custom layouts */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block font-mono pl-1">
                  Tu dirección de correo electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-550">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jugador@ejemplo.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-black py-3 px-5 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 uppercase text-xs tracking-wider font-sans shadow shadow-emerald-500/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando código...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar código de verificación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block font-mono pl-1">
                  Ingresa código de 6 dígitos
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-550">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-center text-lg font-black tracking-[0.4em] text-emerald-400 placeholder-neutral-700 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-2/5 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-3/5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 text-neutral-950 font-black py-3 px-5 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 uppercase text-xs tracking-wider"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirmar</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Divider line style */}
          <div className="flex items-center gap-3 my-5">
            <span className="h-px bg-white/5 flex-grow" />
            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">o continúa con</span>
            <span className="h-px bg-white/5 flex-grow" />
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-bold py-3 px-4 rounded-xl border border-white/5 transition"
            >
              <Chrome className="w-3.5 h-3.5 text-rose-400" />
              <span>Google</span>
            </button>
            <button
              onClick={() => handleSocialLogin('apple')}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-bold py-3 px-4 rounded-xl border border-white/5 transition"
            >
              <Apple className="w-3.5 h-3.5 text-neutral-200" />
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Silent entry option: Sandbox play */}
        <div className="text-center">
          <button
            onClick={() => onAuthSuccess(null, true)}
            className="text-[11px] text-neutral-500 hover:text-emerald-400 font-bold uppercase tracking-wider transition underline decoration-neutral-700 hover:decoration-emerald-500 underline-offset-4"
          >
            Entrar como Invitado (Modo Sin Cuenta / Local)
          </button>
        </div>
      </div>

      {/* Bottom info banner info */}
      <div className="text-center z-10">
        <p className="text-[10px] text-neutral-600 font-mono flex items-center justify-center gap-1.5">
          <span>Camino Futbolista App v1.2</span>
          <span>·</span>
          <span>Estilo Unrespiro Minimalismo</span>
        </p>
      </div>
    </div>
  );
}
