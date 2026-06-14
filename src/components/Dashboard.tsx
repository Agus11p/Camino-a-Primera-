import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayerProfile, ActivityLog } from '../types';
import { calculateStreak } from '../utils/streakHelper';
import { calculateBadges } from '../utils/badgeHelper';
import { LanguageCode, getTranslation } from '../lib/i18n';
import { playClickSound, playSuccessSound } from '../lib/audio';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  Plus, 
  TrendingUp, 
  Target, 
  Award,
  ChevronRight,
  User,
  Scale,
  BookOpen,
  AreaChart,
  Sliders,
  Settings,
  X
} from 'lucide-react';

interface DashboardProps {
  profile: PlayerProfile;
  logs: ActivityLog[];
  goalsGoal: number;
  assistsGoal: number;
  onEditProfile: () => void;
  onResetApp: () => void;
  onOpenRegisterModal: () => void;
  onOpenDiario?: () => void;
  onUpdateGoalsGoal: (meta: number) => void;
  onUpdateAssistsGoal: (meta: number) => void;
  onNavigateToTab: (tab: 'inicio' | 'dashboard' | 'goals' | 'history') => void;
  language?: LanguageCode;
}

export default function Dashboard({
  profile,
  logs,
  goalsGoal,
  assistsGoal,
  onEditProfile,
  onResetApp,
  onOpenRegisterModal,
  onOpenDiario,
  onUpdateGoalsGoal,
  onUpdateAssistsGoal,
  onNavigateToTab,
  language = 'ES',
}: DashboardProps) {
  // Goals Targets modal states
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showAssistsModal, setShowAssistsModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [tempGoalsTarget, setTempGoalsTarget] = useState(goalsGoal);
  const [tempAssistsTarget, setTempAssistsTarget] = useState(assistsGoal);

  const t = (key: any) => getTranslation(key, language);
  const triggerClick = () => playClickSound();

  const isArquero = profile.posicion === 'Arquero';

  // Aggregated math stats
  const totalGoles = logs.reduce((sum, log) => sum + (log.goles || 0), 0);
  const totalAsistencias = logs.reduce((sum, log) => sum + (log.asistencias || 0), 0);
  const totalAtajadas = logs.reduce((sum, log) => sum + (log.atajadas || 0), 0);
  const totalVallasInvictas = logs.reduce((sum, log) => sum + (log.vallaInvicta ? 1 : 0), 0);
  const totalPartidos = logs.filter((log) => log.tipo === 'Partido').length;
  const totalEntrenamientos = logs.filter((log) => log.tipo === 'Entrenamiento').length;
  
  const streak = calculateStreak(logs);
  const unlockedBadges = calculateBadges(logs);

  // Milestone tracking attributes
  const matches = logs.filter((log) => log.tipo === 'Partido');
  const bestGoals = matches.length > 0 ? Math.max(...matches.map(m => m.goles || 0), 0) : 0;
  const bestAssists = matches.length > 0 ? Math.max(...matches.map(m => m.asistencias || 0), 0) : 0;
  const bestSaves = matches.length > 0 ? Math.max(...matches.map(m => m.atajadas || 0), 0) : 0;
  const hasSocioIdeal = matches.some(m => (m.goles || 0) >= 1 && (m.asistencias || 0) >= 1);

  // Real-time BMI Calculation
  const alturaM = profile.altura / 100;
  const imc = parseFloat((profile.peso / (alturaM * alturaM)).toFixed(1));
  let imcStatusLabel = 'Peso Ideal';
  let imcColor = 'text-emerald-400';
  if (imc < 18.5) {
    imcStatusLabel = 'Bajo Peso';
    imcColor = 'text-amber-400';
  } else if (imc >= 25) {
    imcStatusLabel = 'Sobrepeso';
    imcColor = 'text-rose-400';
  }

  // Get active skills list
  const activeSkills = profile.habilidades && profile.habilidades.length > 0
    ? profile.habilidades
    : [profile.habilidad1, profile.habilidad2].filter(Boolean);

  // Mathematical progress calculations
  const getProgressColor = (pct: number): string => {
    if (pct < 50) {
      const ratio = pct / 50;
      const r = Math.round(90 + (245 - 90) * ratio);
      const g = Math.round(90 + (158 - 90) * ratio);
      const b = Math.round(90 + (11 - 90) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const ratio = (pct - 50) / 50;
      const r = Math.round(245 + (16 - 245) * ratio);
      const g = Math.round(158 + (185 - 158) * ratio);
      const b = Math.round(11 + (129 - 11) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const goalsPct = isArquero
    ? Math.min(100, Math.max(0, (totalAtajadas / goalsGoal) * 100))
    : Math.min(100, Math.max(0, (totalGoles / goalsGoal) * 100));

  const assistsPct = isArquero
    ? Math.min(100, Math.max(0, (totalVallasInvictas / assistsGoal) * 100))
    : Math.min(100, Math.max(0, (totalAsistencias / assistsGoal) * 100));

  const goalsColor = getProgressColor(goalsPct);
  const assistsColor = getProgressColor(assistsPct);

  // SVG parameters for rings
  const strokeDash = 251.2;
  const goalsOffset = strokeDash - (goalsPct / 100) * strokeDash;
  const assistsOffset = strokeDash - (assistsPct / 100) * strokeDash;

  // Chart preparation logic
  const totalPartidosHistorico = matches.length;
  const promedioGoles = totalPartidosHistorico > 0 ? parseFloat((totalGoles / totalPartidosHistorico).toFixed(2)) : 0;
  const promedioAsistencias = totalPartidosHistorico > 0 ? parseFloat((totalAsistencias / totalPartidosHistorico).toFixed(2)) : 0;
  const promedioAtajadas = totalPartidosHistorico > 0 ? parseFloat((totalAtajadas / totalPartidosHistorico).toFixed(2)) : 0;
  const promedioVallasPct = totalPartidosHistorico > 0 ? Math.round((totalVallasInvictas / totalPartidosHistorico) * 100) : 0;

  const last5Matches = [...matches]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
    .reverse();

  let maxSingleVal = 1;
  last5Matches.forEach((m) => {
    if (isArquero) {
      const at = m.atajadas || 0;
      if (at > maxSingleVal) maxSingleVal = at;
    } else {
      if (m.goles > maxSingleVal) maxSingleVal = m.goles;
      if (m.asistencias > maxSingleVal) maxSingleVal = m.asistencias;
    }
  });

  const width = 500;
  const height = 150;
  const paddingX = 45;
  const paddingY = 22;
  const pointsCount = last5Matches.length;

  const goalsPoints = last5Matches.map((m, i) => {
    const divisorX = pointsCount > 1 ? pointsCount - 1 : 1;
    const x = paddingX + (i / divisorX) * (width - paddingX * 2);
    const val = isArquero ? (m.atajadas || 0) : m.goles;
    const y = height - paddingY - (val / Math.max(1, maxSingleVal)) * (height - paddingY * 2);
    return { x, y, value: val, date: m.fecha };
  });

  const assistsPoints = last5Matches.map((m, i) => {
    const divisorX = pointsCount > 1 ? pointsCount - 1 : 1;
    const x = paddingX + (i / divisorX) * (width - paddingX * 2);
    const valRaw = isArquero ? (m.vallaInvicta ? 1 : 0) : m.asistencias;
    const valScaled = isArquero ? (m.vallaInvicta ? maxSingleVal : 0) : valRaw;
    const y = height - paddingY - (valScaled / Math.max(1, maxSingleVal)) * (height - paddingY * 2);
    return { x, y, value: valRaw, date: m.fecha };
  });

  const createPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  };

  const createAreaPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return '';
    const linePath = createPath(points);
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const baseY = height - paddingY;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const goalsPath = createPath(goalsPoints);
  const assistsPath = createPath(assistsPoints);
  const goalsAreaPath = createAreaPath(goalsPoints);
  const assistsAreaPath = createAreaPath(assistsPoints);

  const formatDateLabel = (isoString: string) => {
    try {
      const d = new Date(isoString + 'T12:00:00');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return isoString;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5 pb-24"
      >
        {/* COMPACT SCOUT FICHA (Top Header summary) */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-4.5 shadow-xl transition-all duration-300"
        >
          {/* Subtle glow sphere */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.04] rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Gold Rating style Badge */}
              <div className="relative shrink-0">
                <div className="w-13 h-13 sm:w-15 sm:h-15 bg-neutral-950 border-2 border-emerald-500/70 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/5 relative">
                  <span className="text-emerald-400 text-lg sm:text-xl font-black italic tracking-tighter">90+</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-neutral-950 w-5 h-5 rounded-full border border-neutral-950 flex items-center justify-center text-[9px] font-black shadow">
                  {profile.piernaHabil === 'Diestro' ? 'R' : 'L'}
                </div>
              </div>

              {/* Identity labels */}
              <div className="text-left space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                    {profile.posicion}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {profile.edad} años
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight italic">
                  {profile.nombre}
                </h2>
                <p className="text-[11px] text-neutral-400 leading-none">
                  Club: <strong className="text-emerald-400 font-bold">{profile.club}</strong>
                </p>
              </div>
            </div>

            {/* Quick action buttons block */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onEditProfile}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-750 text-white text-[11px] font-extrabold px-3 py-2 rounded-xl transition cursor-pointer border border-neutral-700 uppercase tracking-wide"
              >
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span>Editar Ficha</span>
              </button>

              {onOpenDiario && (
                <button
                  onClick={onOpenDiario}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold px-3.5 py-2 rounded-xl transition cursor-pointer uppercase tracking-wide"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Abrir Diario</span>
                </button>
              )}
            </div>
          </div>

          {/* Micro Biometrics row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-neutral-800 text-center">
            <div className="bg-neutral-950/40 p-1.5 rounded-lg border border-neutral-800">
              <span className="block text-[8px] font-bold text-neutral-500 uppercase tracking-wider">Estatura</span>
              <span className="text-[11px] font-extrabold text-white">{profile.altura} cm</span>
            </div>
            <div className="bg-neutral-950/40 p-1.5 rounded-lg border border-neutral-800">
              <span className="block text-[8px] font-bold text-neutral-500 uppercase tracking-wider">Peso</span>
              <span className="text-[11px] font-extrabold text-white">{profile.peso} kg</span>
            </div>
            <div className="bg-neutral-950/40 p-1.5 rounded-lg border border-neutral-800">
              <span className="block text-[8px] font-bold text-neutral-500 uppercase tracking-wider">Masa Corporal</span>
              <span className={`text-[11px] font-extrabold ${imcColor}`}>{imcStatusLabel} ({imc})</span>
            </div>
          </div>
        </motion.div>

        {/* 1. Streak Fire Banner */}
        <motion.div 
          variants={itemVariants}
          className="glass border-orange-500/20 p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <Flame className="w-5.5 h-5.5 fill-orange-500/20 animate-bounce" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                Racha de Constancia (Streak)
              </h3>
              <p className="text-xs text-neutral-450 font-light">
                {streak > 0 
                  ? '¡Impresionante! Continúe registrando su actividad diaria.' 
                  : 'Cárguese al juego. Registre entrenamientos para iniciar su racha.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center pr-1.5">
            <span className="text-3xl font-black text-orange-400 italic leading-none">{streak}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400/80">Días</span>
          </div>
        </motion.div>

        {/* 2. Progress Circles (Goles & Asistencias Metas) */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Goals / Atajadas Progress Ring Box */}
          <motion.div 
            onClick={() => {
              setTempGoalsTarget(goalsGoal);
              setShowGoalsModal(true);
            }}
            whileHover={{ scale: 1.015, translateY: -1 }}
            whileTap={{ scale: 0.995 }}
            className="glass glass-interactive px-3 py-4 sm:px-5 sm:py-6 flex flex-col items-center justify-between cursor-pointer relative group"
          >
            <div className="absolute top-2 right-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition text-[9px] bg-white/10 text-neutral-200 rounded px-1.5 py-0.5 border border-white/10">
              Editar Meta
            </div>
            
            <h3 className="text-[10px] sm:text-xs font-bold text-neutral-350 uppercase tracking-widest mb-3 flex items-center gap-1 sm:gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              {isArquero ? 'Meta: Atajadas' : 'Metas: Goles'}
            </h3>

            {/* SVG Progress Circle */}
            <div className="relative w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
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
                  animate={{ strokeDashoffset: goalsOffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  stroke={goalsColor}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                  {isArquero ? totalAtajadas : totalGoles}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5 sm:mt-1 font-mono">
                  {isArquero ? 'Salvadas' : 'Anotados'}
                </span>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-[11px] sm:text-xs text-neutral-350 block font-light">
                Meta: <strong className="text-white font-bold">{goalsGoal}</strong>
              </span>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.5 rounded mt-1 sm:mt-1.5 inline-block uppercase tracking-wider">
                {goalsPct.toFixed(0)}% OK
              </span>
            </div>
          </motion.div>

          {/* Assists / Vallas Invictas Progress Ring Box */}
          <motion.div 
            onClick={() => {
              setTempAssistsTarget(assistsGoal);
              setShowAssistsModal(true);
            }}
            whileHover={{ scale: 1.015, translateY: -1 }}
            whileTap={{ scale: 0.995 }}
            className="glass glass-interactive px-3 py-4 sm:px-5 sm:py-6 flex flex-col items-center justify-between cursor-pointer relative group"
          >
            <div className="absolute top-2 right-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition text-[9px] bg-white/10 text-neutral-200 rounded px-1.5 py-0.5 border border-white/10">
              Editar Meta
            </div>

            <h3 className="text-[10px] sm:text-xs font-bold text-neutral-350 uppercase tracking-widest mb-3 flex items-center gap-1 sm:gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              {isArquero ? 'Meta: Arco en Cero' : 'Metas: Asistencias'}
            </h3>

            {/* SVG Progress Circle */}
            <div className="relative w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
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
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                  stroke={assistsColor}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                  {isArquero ? totalVallasInvictas : totalAsistencias}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5 sm:mt-1 font-mono">
                  {isArquero ? 'Vallas' : 'Servidos'}
                </span>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-[11px] sm:text-xs text-neutral-350 block font-light">
                Meta: <strong className="text-white font-bold">{assistsGoal}</strong>
              </span>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.5 rounded mt-1 sm:mt-1.5 inline-block uppercase tracking-wider">
                {assistsPct.toFixed(0)}% OK
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* 3. Flat Cards: Total Games & Trainings */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3.5">
          <div className="glass p-4 flex items-center gap-3 hover:border-white/10 transition">
            <div className="p-2 bg-neutral-950 text-emerald-400 border border-neutral-850 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">
                Partidos en Lista
              </span>
              <span className="text-lg font-bold text-white">{totalPartidos}</span>
            </div>
          </div>

          <div className="glass p-4 flex items-center gap-3 hover:border-white/10 transition">
            <div className="p-2 bg-neutral-950 text-emerald-400 border border-neutral-850 rounded-lg shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">
                Entrenamientos
              </span>
              <span className="text-lg font-bold text-white">{totalEntrenamientos}</span>
            </div>
          </div>
        </motion.div>

        {/* SEGMENTO DE GRÁFICOS DUALES COMPARATIVOS EN PARALELO */}
        <motion.div variants={itemVariants} className="glass p-5 space-y-4.5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-left">
              <AreaChart className="w-4.5 h-4.5 text-emerald-400" />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                  Planilla de Gráficos de Campo
                </h3>
                <p className="text-[10px] text-neutral-450 mt-0.5 font-light font-sans">
                  Progreso por fecha y promedios reales por partido disputado.
                </p>
              </div>
            </div>

            {/* Legend indicators */}
            <div className="flex items-center gap-3.5 text-[9px] font-bold uppercase tracking-wider font-mono">
              <span className="flex items-center gap-1.5 text-neutral-350">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                {isArquero ? 'Atajadas' : 'Goles'}
              </span>
              <span className="flex items-center gap-1.5 text-neutral-350">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                {isArquero ? 'Vallas Invictas' : 'Asistencias'}
              </span>
            </div>
          </div>

          {last5Matches.length === 0 ? (
            <div className="py-10 text-center bg-white/[0.01] rounded-xl border border-dashed border-white/5">
              <p className="text-xs text-neutral-450 font-medium">
                Sin datos de partidos registrados.
              </p>
              <p className="text-[10px] text-neutral-500 mt-1 max-w-xs mx-auto font-light">
                Registre partidos en el diario para trazar sus curvas técnicas de rendimiento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1.5">
                     {/* Gráfico 1 (Izquierda): Evolución temporal en barras - Rediseño Premium de Alta Gama */}
              <div className="space-y-3.5 text-left">
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider block font-mono">
                  1. Evolución de Rendimiento (Últimos {last5Matches.length} juegos)
                </span>
                
                <div className="bg-neutral-950/60 rounded-2xl p-5 border border-white/[0.04] shadow-2xl relative">
                  <div className="flex h-36 items-end justify-between px-3 gap-3 relative">
                    {/* Horizontal dashed guidelines overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2 px-1">
                      <div className="border-b border-dashed border-white/5 w-full h-0" />
                      <div className="border-b border-dashed border-white/5 w-full h-0" />
                      <div className="border-b border-dashed border-white/5 w-full h-0" />
                      <div className="border-b border-dashed border-white/5 w-full h-0" />
                    </div>
 
                    {last5Matches.map((m) => {
                      const val1 = isArquero ? (m.atajadas || 0) : m.goles;
                      const val2 = isArquero ? (m.vallaInvicta ? 1 : 0) : m.asistencias;
                      
                      const maxVal = Math.max(1, maxSingleVal);
                      const h1Pct = Math.max(12, (val1 / maxVal) * 85);
                      const h2Pct = Math.max(12, (val2 / maxVal) * 85);
                      
                      return (
                        <div key={m.id} className="flex flex-col items-center flex-1 h-full justify-end group z-10 relative">
                          {/* Dual bar slot track wrapper */}
                          <div className="flex items-end gap-1.5 mb-2 h-24 w-full justify-center px-0.5">
                            {/* Track 1: Goles or Atajadas */}
                            <div className="w-2.5 sm:w-3.5 bg-neutral-900/80 rounded-full h-full flex flex-col justify-end border border-white/[0.03] p-0.5 relative group/bar1">
                              {val1 > 0 && (
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] sm:text-[11px] font-mono font-black text-emerald-400 z-20 pointer-events-none whitespace-nowrap">
                                  {val1}
                                </span>
                              )}
                              <div className="w-full h-full rounded-full overflow-hidden flex flex-col justify-end">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h1Pct}%` }}
                                  className="w-full rounded-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.35)] group-hover/bar1:brightness-110 transition duration-300"
                                />
                              </div>
                            </div>
 
                            {/* Track 2: Asistencias or Arco en cero */}
                            <div className="w-2.5 sm:w-3.5 bg-neutral-900/80 rounded-full h-full flex flex-col justify-end border border-white/[0.03] p-0.5 relative group/bar2">
                              {val2 > 0 && (
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] sm:text-[11px] font-mono font-black text-amber-500 z-20 pointer-events-none whitespace-nowrap">
                                  {isArquero ? "✓" : val2}
                                </span>
                              )}
                              <div className="w-full h-full rounded-full overflow-hidden flex flex-col justify-end">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h2Pct}%` }}
                                  className="w-full rounded-full bg-gradient-to-t from-amber-650 via-amber-550 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.35)] group-hover/bar2:brightness-110 transition duration-300"
                                />
                              </div>
                            </div>
                          </div>
 
                          {/* Label of date/match */}
                          <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-tight mt-1 bg-white/[0.02] border border-white/[0.04] px-1 py-0.5 rounded">
                            {formatDateLabel(m.fecha)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
 
              {/* Gráfico 2 (Derecha): Comparativa de Promedios en Barras - Rediseño Premium */}
              <div className="space-y-3.5 text-left flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider block font-mono">
                    2. Eficiencia y Promedios Reales (x Partido)
                  </span>
 
                  <div className="bg-neutral-950/60 rounded-2xl p-5 border border-white/[0.04] shadow-2xl mt-3 space-y-5 flex-1 animate-fadeIn">
                    {/* Bar 1: Goles o Atajadas por Partido */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-neutral-450 font-bold uppercase tracking-wider">
                          {isArquero ? 'Atajadas x Partido (At/PJ)' : 'Goles x Partido (G/PJ)'}
                        </span>
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 py-0.5 px-2 rounded-lg font-black text-xs">
                          {(totalPartidos > 0 
                            ? (isArquero ? totalAtajadas / totalPartidos : totalGoles / totalPartidos)
                            : 0).toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Bar filled background slider track */}
                      <div className="w-full bg-neutral-900 h-4 rounded-full overflow-hidden border border-white/[0.05] p-0.5 relative group">
                        <div 
                          className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 relative shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                          style={{ 
                            width: `${Math.min(100, Math.max(12, ((totalPartidos > 0 
                              ? (isArquero ? totalAtajadas / totalPartidos : totalGoles / totalPartidos)
                              : 0) / 2) * 100))}%` 
                          }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:10px_10px] animate-[pulse_2.5s_infinite] rounded-full" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[8px] text-neutral-500 font-mono tracking-wider font-extrabold uppercase">
                        <span>0.0 prom</span>
                        <span>1.0 destacado</span>
                        <span>2.0+ pro</span>
                      </div>
                    </div>
 
                    {/* Bar 2: Asistencias o Vallas por Partido */}
                    <div className="space-y-2 text-left">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-neutral-450 font-bold uppercase tracking-wider">
                          {isArquero ? 'Porcentaje Vallas (%)' : 'Asistencias x Partido (A/PJ)'}
                        </span>
                        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/15 py-0.5 px-2 rounded-lg font-black text-xs">
                          {isArquero 
                            ? `${(totalPartidos > 0 ? (totalVallasInvictas / totalPartidos) * 100 : 0).toFixed(0)}%` 
                            : (totalPartidos > 0 ? totalAsistencias / totalPartidos : 0).toFixed(2)}
                        </span>
                      </div>
 
                      {/* Bar filled progress slider track */}
                      <div className="w-full bg-neutral-900 h-4 rounded-full overflow-hidden border border-white/[0.05] p-0.5 relative">
                        <div 
                          className="bg-gradient-to-r from-amber-600 via-amber-550 to-yellow-400 h-full rounded-full transition-all duration-1000 relative shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                          style={{ 
                            width: `${Math.min(100, Math.max(12, isArquero 
                              ? (totalPartidos > 0 ? (totalVallasInvictas / totalPartidos) * 100 : 0)
                              : ((totalPartidos > 0 ? totalAsistencias / totalPartidos : 0) / 1.5) * 100))}%` 
                          }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:10px_10px] animate-[pulse_2.5s_infinite] rounded-full" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[8px] text-neutral-500 font-mono tracking-wider font-extrabold uppercase">
                        <span>0.0 valla</span>
                        <span>{isArquero ? '50% élite' : '0.50 destacado'}</span>
                        <span>{isArquero ? '100% perfecto' : '1.5+ pro'}</span>
                      </div>
                    </div>
                  </div>
                </div>
 
                <p className="text-[9px] text-neutral-500 italic mt-auto pt-2.5 border-t border-white/[0.03] leading-none text-right">
                  * Promedios calculados sobre {totalPartidos} partidos válidos registrados.
                </p>
              </div>

            </div>
          )}
        </motion.div>

        {/* 4. Badges Preview Carousel */}
        <motion.div variants={itemVariants} className="glass p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
              Medallas Obtenidas ({unlockedBadges.length})
            </h3>
            <button
              onClick={() => onNavigateToTab('goals')}
              className="text-[10px] font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
            >
              Requisitos
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {unlockedBadges.length === 0 ? (
            <div className="text-left py-1">
              <p className="text-xs text-neutral-450 font-light">
                No tiene medallas desbloqueadas en este ciclo todavía.
              </p>
              <p className="text-[10px] text-neutral-500 font-light mt-0.5">
                Registrar partidos logrando asistencias o anotando goles desbloqueará medallas de rendimiento.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {unlockedBadges.map((bg) => (
                <motion.div 
                  key={bg.name}
                  title={`${bg.name}: ${bg.description}`}
                  whileHover={{ scale: 1.04 }}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-400/20 hover:to-yellow-400/20 border border-amber-500/20 hover:border-amber-400/30 text-amber-305 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm cursor-help transition-all duration-200"
                >
                  <Trophy className="w-3 h-3 text-amber-500 fill-amber-500/10" />
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
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-neutral-950 font-black py-4 px-6 rounded-xl transition duration-200 shadow-xl shadow-emerald-500/15 flex items-center justify-center gap-2 group cursor-pointer text-xs uppercase tracking-wider font-sans border-none"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3]" />
            Registrar Jornada de Hoy
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 2. Modals / Bottom Sheets for Edit Goal Targets */}
      {/* Goals Target Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full sm:max-w-md glass p-6 shadow-2xl relative border border-white/10 rounded-2xl">
            <h3 className="text-base font-black text-white uppercase tracking-tight mb-1 text-left">
              {isArquero ? 'Modificar Meta de Atajadas' : 'Modificar Meta de Goles'}
            </h3>
            <p className="text-xs text-neutral-450 mb-6 font-light text-left font-sans">
              {isArquero 
                ? 'Ajuste la cantidad de atajadas clave que pretende acumular en este ciclo.' 
                : 'Ajuste la cantidad de goles de campo que pretende anotar.'}
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-350 uppercase tracking-wider">Objetivo Numérico</span>
                <span className="text-xl font-black text-emerald-400 font-mono">{tempGoalsTarget}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={tempGoalsTarget}
                onChange={(e) => setTempGoalsTarget(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGoalsModal(false)}
                className="flex-1 py-3 text-neutral-450 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/10 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onUpdateGoalsGoal(tempGoalsTarget);
                  setShowGoalsModal(false);
                }}
                className="flex-1 py-3 text-neutral-950 bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition cursor-pointer"
              >
                Guardar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assists Target Modal */}
      {showAssistsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full sm:max-w-md glass p-6 shadow-2xl relative border border-white/10 rounded-2xl">
            <h3 className="text-base font-black text-white uppercase tracking-tight mb-1 text-left">
              {isArquero ? 'Modificar Meta de Arcos en Cero' : 'Modificar Meta de Asistencias'}
            </h3>
            <p className="text-xs text-neutral-450 mb-6 font-light text-left font-sans">
              {isArquero 
                ? 'Ajuste la cantidad de vallas invictas clave a concretar en este ciclo.' 
                : 'Ajuste la cantidad de asistencias / pases gol a servir.'}
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-350 uppercase tracking-wider">Objetivo Numérico</span>
                <span className="text-xl font-black text-emerald-400 font-mono">{tempAssistsTarget}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={tempAssistsTarget}
                onChange={(e) => setTempAssistsTarget(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssistsModal(false)}
                className="flex-1 py-3 text-neutral-450 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/10 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onUpdateAssistsGoal(tempAssistsTarget);
                  setShowAssistsModal(false);
                }}
                className="flex-1 py-3 text-neutral-950 bg-emerald-500 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-400 transition cursor-pointer"
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
