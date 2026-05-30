import React from 'react';
import { motion } from 'motion/react';
import { PlayerProfile } from '../types';
import { Trophy, ArrowRight, UserPlus, CheckCircle } from 'lucide-react';

interface SplashWelcomeProps {
  profile: PlayerProfile | null;
  onEnterDashboard: () => void;
  onStartOnboarding: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.12,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 14 }
  }
};

export default function SplashWelcome({
  profile,
  onEnterDashboard,
  onStartOnboarding,
}: SplashWelcomeProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 py-8 relative overflow-hidden"
    >
      {/* Background ambient light effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* 90+ Boot Styled Classic Logo */}
      <motion.div 
        variants={itemVariants}
        className="relative mb-6 group cursor-pointer"
        whileHover={{ scale: 1.05, rotate: -2 }}
        whileTap={{ scale: 0.96 }}
      >
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
      </motion.div>

      <motion.h1 
        variants={itemVariants} 
        className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 uppercase"
      >
        Camino a Primera
      </motion.h1>
      
      <motion.p 
        variants={itemVariants} 
        className="text-emerald-400 font-semibold tracking-widest text-xs sm:text-sm uppercase mb-8"
      >
        Tu Ficha · Tus Estadísticas · Tu Gloria
      </motion.p>

      {profile ? (
        /* Smart Login: Existing User Flow */
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-sm glass emerald-glow p-6 relative z-10 hover:border-emerald-500/20 transition-colors"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-pulse">
            <Trophy className="w-6 h-6" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">
            ¡Hola, {profile.nombre}!
          </h2>
          <p className="text-neutral-400 text-sm mb-6 font-light">
            Representando al <strong className="text-emerald-400 font-medium">{profile.club}</strong>. Listo para registrar la jornada de hoy.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnterDashboard}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 flex items-center justify-center gap-2 group cursor-pointer uppercase text-xs tracking-wider"
          >
            INGRESAR AL PANEL
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      ) : (
        /* Onboarding Flow: New User */
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-md glass emerald-glow p-6 sm:p-8 relative z-10 text-left hover:border-emerald-500/20 transition-colors"
        >
          <p className="text-neutral-300 text-sm sm:text-base mb-6 leading-relaxed font-light text-center">
            La plataforma de rendimiento y estadísticas progresiva para futbolistas amateurs y en formación. Registra tus entrenamientos, partidos, calcula tu IMC real y desbloquea medallas legendarias.
          </p>

          <div className="space-y-4 mb-8">
            <motion.div 
              variants={itemVariants}
              className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold text-xs uppercase block tracking-wider mb-0.5">Ficha Técnica Oficial</strong>
                <span className="text-xs text-neutral-400 leading-normal font-light">
                  Guarda tu masa corporal (IMC), pierna hábil y posición favorita para entrenar enfocado.
                </span>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold text-xs uppercase block tracking-wider mb-0.5">Anillos de Progreso</strong>
                <span className="text-xs text-neutral-400 leading-normal font-light">
                  Visualiza tus metas dinámicas de goles y asistencias con transiciones cromáticas en tiempo real.
                </span>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 transition"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold text-xs uppercase block tracking-wider mb-0.5">Medallero Estricto</strong>
                <span className="text-xs text-neutral-400 leading-normal font-light">
                  Desbloquea Hat-tricks, Pókers y reconocimientos de "Asistidor Estrella" en tiempo real.
                </span>
              </div>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartOnboarding}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black py-4 px-6 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 flex items-center justify-center gap-2 group cursor-pointer text-xs uppercase tracking-widest font-sans"
          >
            COMENZAR REGISTRO SIEMPRE LIBRE
            <UserPlus className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
