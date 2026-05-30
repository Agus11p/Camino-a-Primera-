import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, ActivityLog } from '../types';
import { calculateStreak } from '../utils/streakHelper';
import { calculateBadges } from '../utils/badgeHelper';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  Plus, 
  TrendingUp, 
  Target, 
  Award,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  profile: PlayerProfile;
  logs: ActivityLog[];
  goalsGoal: number;
  assistsGoal: number;
  onEditProfile: () => void;
  onOpenRegisterModal: () => void;
  onUpdateGoalsGoal: (meta: number) => void;
  onUpdateAssistsGoal: (meta: number) => void;
  onNavigateToTab: (tab: 'dashboard' | 'goals' | 'charts' | 'history') => void;
}

export default function Dashboard({
  profile,
  logs,
  goalsGoal,
  assistsGoal,
  onEditProfile,
  onOpenRegisterModal,
  onUpdateGoalsGoal,
  onUpdateAssistsGoal,
  onNavigateToTab,
}: DashboardProps) {
  // Goals Targets modal states
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showAssistsModal, setShowAssistsModal] = useState(false);
  
  const [tempGoalsTarget, setTempGoalsTarget] = useState(goalsGoal);
  const [tempAssistsTarget, setTempAssistsTarget] = useState(assistsGoal);

  // Aggregated math stats
  const totalGoles = logs.reduce((sum, log) => sum + (log.goles || 0), 0);
  const totalAsistencias = logs.reduce((sum, log) => sum + (log.asistencias || 0), 0);
  const totalPartidos = logs.filter((log) => log.tipo === 'Partido').length;
  const totalEntrenamientos = logs.filter((log) => log.tipo === 'Entrenamiento').length;
  
  const streak = calculateStreak(logs);
  const unlockedBadges = calculateBadges(logs);

  // Mathematical progress colors (Gray -> Yellow/Gold -> Emerald Green)
  const getProgressColor = (pct: number): string => {
    if (pct < 50) {
      const ratio = pct / 50;
      const r = Math.round(90 + (245 - 90) * ratio); // 90 to amber
      const g = Math.round(90 + (158 - 90) * ratio);
      const b = Math.round(90 + (11 - 90) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const ratio = (pct - 50) / 50;
      const r = Math.round(245 + (16 - 245) * ratio); // amber to emerald
      const g = Math.round(158 + (185 - 158) * ratio);
      const b = Math.round(11 + (129 - 11) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const goalsPct = Math.min(100, Math.max(0, (totalGoles / goalsGoal) * 100));
  const assistsPct = Math.min(100, Math.max(0, (totalAsistencias / assistsGoal) * 100));

  const goalsColor = getProgressColor(goalsPct);
  const assistsColor = getProgressColor(assistsPct);

  // SVG parameters
  const strokeDash = 251.2; // 2 * pi * r (r=40)
  const goalsOffset = strokeDash - (goalsPct / 100) * strokeDash;
  const assistsOffset = strokeDash - (assistsPct / 100) * strokeDash;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 14 }
    }
  };

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-24"
      >
      {/* 1. Streak Fire Banner (Top highlight) */}
      <motion.div 
        variants={itemVariants}
        className="glass border-orange-500/20 p-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
            <Flame className="w-5.5 h-5.5 fill-orange-500/20 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">
              Racha de Constancia (Streak)
            </h3>
            <p className="text-xs text-neutral-400 font-light">
              {streak > 0 
                ? '¡Impresionante! Continúa registrando actividad cada día.' 
                : 'Cárgate al juego. Registra un entrenamiento o partido para iniciar racha.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center pr-1.5">
          <span className="text-3xl font-black text-orange-500 italic leading-none">{streak}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400/80">Días</span>
        </div>
      </motion.div>

      {/* 2. Progress Circles (Goles & Asistencias Metas) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Goals Progress Ring Box */}
        <motion.div 
          onClick={() => {
            setTempGoalsTarget(goalsGoal);
            setShowGoalsModal(true);
          }}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="glass glass-interactive px-3 py-4 sm:px-5 sm:py-6 flex flex-col items-center justify-between cursor-pointer relative group"
        >
          <div className="absolute top-2 right-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition text-[10px] bg-white/10 text-neutral-200 rounded px-1.5 py-0.5 border border-white/10">
            Editar Meta
          </div>
          
          <h3 className="text-[10px] sm:text-xs font-bold text-neutral-350 uppercase tracking-widest mb-3 flex items-center gap-1 sm:gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Metas: Goles
          </h3>

          {/* SVG Progress Circle */}
          <div className="relative w-22 h-22 sm:w-28 sm:h-28 flex items-center justify-center my-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Grey Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                 className="stroke-white/10 fill-none"
                strokeWidth="7"
              />
              {/* Dynamic Color Progress Overlay */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                className="fill-none"
                strokeWidth="8"
                strokeDasharray={strokeDash}
                initial={{ strokeDashoffset: strokeDash }}
                animate={{ strokeDashoffset: goalsOffset }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                stroke={goalsColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{totalGoles}</span>
              <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5 sm:mt-1 font-mono">
                Anotados
              </span>
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="text-[11px] sm:text-xs text-neutral-350 block font-light">
              Meta: <strong className="text-white font-bold">{goalsGoal}</strong>
            </span>
            <span className="text-[9px] sm:text-[11px] text-emerald-400 font-bold bg-emerald-500/20 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded mt-1 sm:mt-1.5 inline-block uppercase tracking-wider">
              {goalsPct.toFixed(0)}% OK
            </span>
          </div>
        </motion.div>

        {/* Assists Progress Ring Box */}
        <motion.div 
          onClick={() => {
            setTempAssistsTarget(assistsGoal);
            setShowAssistsModal(true);
          }}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="glass glass-interactive px-3 py-4 sm:px-5 sm:py-6 flex flex-col items-center justify-between cursor-pointer relative group"
        >
          <div className="absolute top-2 right-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition text-[10px] bg-white/10 text-neutral-200 rounded px-1.5 py-0.5 border border-white/10">
            Editar Meta
          </div>

          <h3 className="text-[10px] sm:text-xs font-bold text-neutral-350 uppercase tracking-widest mb-3 flex items-center gap-1 sm:gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Metas: Pases
          </h3>

          {/* SVG Progress Circle */}
          <div className="relative w-22 h-22 sm:w-28 sm:h-28 flex items-center justify-center my-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-white/10 fill-none"
                strokeWidth="7"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                className="fill-none"
                strokeWidth="8"
                strokeDasharray={strokeDash}
                initial={{ strokeDashoffset: strokeDash }}
                animate={{ strokeDashoffset: assistsOffset }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
                stroke={assistsColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{totalAsistencias}</span>
              <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5 sm:mt-1 font-mono">
                Servidos
              </span>
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="text-[11px] sm:text-xs text-neutral-350 block font-light">
              Meta: <strong className="text-white font-bold">{assistsGoal}</strong>
            </span>
            <span className="text-[9px] sm:text-[11px] text-emerald-400 font-bold bg-emerald-500/20 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded mt-1 sm:mt-1.5 inline-block uppercase tracking-wider">
              {assistsPct.toFixed(0)}% OK
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Flat Cards: Total Games & Trainings */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <div className="glass p-4.5 flex items-center gap-3.5 hover:border-white/10 transition">
          <div className="p-2.5 bg-white/5 text-emerald-400 border border-white/10 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
              Partidos
            </span>
            <span className="text-xl font-bold text-white">{totalPartidos}</span>
          </div>
        </div>

        <div className="glass p-4.5 flex items-center gap-3.5 hover:border-white/10 transition">
          <div className="p-2.5 bg-white/5 text-emerald-400 border border-white/10 rounded-lg shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
              Entrenamientos
            </span>
            <span className="text-xl font-bold text-white">{totalEntrenamientos}</span>
          </div>
        </div>
      </motion.div>

      {/* 4. Badges Preview Carousel */}
      <motion.div variants={itemVariants} className="glass p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400 animate-pulse" />
            Medallero ({unlockedBadges.length})
          </h3>
          <button
            onClick={() => onNavigateToTab('goals')}
            className="text-[11px] font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer uppercase"
          >
            Ver Logros
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {unlockedBadges.length === 0 ? (
          <div>
            <p className="text-xs text-neutral-400">
              No tienes medallas desbloqueadas todavía.
            </p>
            <p className="text-[10px] text-neutral-500 font-light mt-0.5">
              Registra un partido destacando en asistencias o goles para ganar tus medallas.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {unlockedBadges.map((bg) => (
              <motion.div 
                key={bg.name}
                title={`${bg.name}: ${bg.description}`}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-400/20 hover:to-yellow-400/20 border border-amber-500/20 hover:border-amber-400/30 text-amber-300 px-2.5 py-1 rounded-xl text-[10.5px] font-black uppercase tracking-wider shadow-sm cursor-help transition-all duration-200"
              >
                <Trophy className="w-3 h-3 text-amber-400 fill-amber-400/10" />
                <span>{bg.name}</span>
                {bg.count > 1 && (
                  <span className="bg-amber-400/20 text-yellow-300 px-1 rounded-md text-[9px] font-extrabold leading-none py-0.5 border border-amber-400/10">
                    x{bg.count}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 5. Primary CTA: Quick Register Activity */}
      <motion.div variants={itemVariants} className="pt-1">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenRegisterModal}
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-neutral-950 font-black py-3.5 px-6 rounded-xl transition duration-200 shadow-xl shadow-emerald-500/15 flex items-center justify-center gap-2 group cursor-pointer text-sm uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Registrar Jornada de Hoy
        </motion.button>
      </motion.div>
    </motion.div>

      {/* 2. Modals / Bottom Sheets for Edit Goal Targets */}
      {/* Goals Target Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md glass p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-1">
              Modificar Meta de Goles
            </h3>
            <p className="text-xs text-neutral-450 mb-6 font-light">
              Ajusta la cantidad de goles que pretendes alcanzar en este ciclo.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setTempGoalsTarget(Math.max(1, tempGoalsTarget - 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold border border-white/10 hover:border-white/20 flex items-center justify-center cursor-pointer text-lg"
                >
                  -
                </button>
                <span className="text-3xl font-black text-white italic">{tempGoalsTarget}</span>
                <button
                  type="button"
                  onClick={() => setTempGoalsTarget(tempGoalsTarget + 1)}
                  className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold border border-white/10 hover:border-white/20 flex items-center justify-center cursor-pointer text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowGoalsModal(false)}
                className="py-3 px-4 rounded-xl text-xs font-bold uppercase border border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateGoalsGoal(tempGoalsTarget);
                  setShowGoalsModal(false);
                }}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 uppercase cursor-pointer"
              >
                Guardar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assists Target Modal */}
      {showAssistsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md glass p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-1">
              Modificar Meta de Asistencias
            </h3>
            <p className="text-xs text-neutral-450 mb-6 font-light">
              Ajusta la cantidad de asistencias que pretendes dar en el ciclo de entrenamientos.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setTempAssistsTarget(Math.max(1, tempAssistsTarget - 1))}
                  className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold border border-white/10 hover:border-white/20 flex items-center justify-center cursor-pointer text-lg"
                >
                  -
                </button>
                <span className="text-3xl font-black text-white italic">{tempAssistsTarget}</span>
                <button
                  type="button"
                  onClick={() => setTempAssistsTarget(tempAssistsTarget + 1)}
                  className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold border border-white/10 hover:border-white/20 flex items-center justify-center cursor-pointer text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowAssistsModal(false)}
                className="py-3 px-4 rounded-xl text-xs font-bold uppercase border border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateAssistsGoal(tempAssistsTarget);
                  setShowAssistsModal(false);
                }}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 uppercase cursor-pointer"
              >
                Guardar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
