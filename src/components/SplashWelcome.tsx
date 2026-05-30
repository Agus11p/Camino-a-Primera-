import React from 'react';
import { PlayerProfile } from '../types';
import { Trophy, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';

interface SplashWelcomeProps {
  profile: PlayerProfile | null;
  onEnterDashboard: () => void;
  onStartOnboarding: () => void;
}

export default function SplashWelcome({
  profile,
  onEnterDashboard,
  onStartOnboarding,
}: SplashWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6 py-12 relative overflow-hidden">
      {/* Background ambient light effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* 90+ Boot Styled Classic Logo */}
      <div className="relative mb-8 group transition-transform duration-300 hover:scale-105">
        <div className="w-28 h-28 rounded-full bg-black border-4 border-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span 
            translate="no"
            className="notranslate text-white text-4xl font-extrabold italic tracking-tighter" 
            style={{ fontFamily: '"Arial Black", "Impact", sans-serif' }}
          >
            90+
          </span>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider shadow">
          AMATEUR
        </div>
      </div>

      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
        CAMINO A PRIMERA
      </h1>
      <p className="text-emerald-400 font-semibold tracking-wide text-sm uppercase mb-8">
        Tu Ficha · Tus Estadísticas · Tu Gloria
      </p>

      {profile ? (
        /* Smart Login: Existing User Flow */
        <div className="w-full max-w-sm glass emerald-glow p-6 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
            <Trophy className="w-6 h-6" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">
            ¡Hola, {profile.nombre}!
          </h2>
          <p className="text-neutral-400 text-sm mb-6 font-light">
            Representando al <strong className="text-emerald-400 font-medium">{profile.club}</strong>. Listo para registrar la jornada de hoy.
          </p>

          <button
            onClick={onEnterDashboard}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 flex items-center justify-center gap-2 group cursor-pointer"
          >
            INGRESAR AL PANEL
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      ) : (
        /* Onboarding Flow: New User */
        <div className="w-full max-w-md glass emerald-glow p-8 relative z-10">
          <p className="text-neutral-300 text-base mb-6 leading-relaxed font-light">
            La plataforma de rendimiento y estadísticas progresiva para futbolistas amateurs y en formación. Registra tus entrenamientos, partidos, calcula tu IMC real y desbloquea medallas legendarias.
          </p>

          <div className="space-y-3.5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-400">
                <strong className="text-white font-medium">Ficha Técnica Oficial:</strong> Guarda tu masa corporal (IMC), pierna hábil y posición favorita.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-400">
                <strong className="text-white font-medium">Anillos de Progreso:</strong> Visualiza tus metas dinámicas de goles y asistencias con transiciones cromáticas en tiempo real.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-400">
                <strong className="text-white font-medium">Medallero Estricto:</strong> Desbloquea Hat-tricks, Pókers y reconocimientos como "Asistidor Estrella".
              </p>
            </div>
          </div>

          <button
            onClick={onStartOnboarding}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black py-4 px-6 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 flex items-center justify-center gap-2 group cursor-pointer"
          >
            COMENZAR REGISTRO
            <UserPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  );
}
