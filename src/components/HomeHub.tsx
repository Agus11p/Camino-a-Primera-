import React from 'react';
import { motion } from 'motion/react';
import { PlayerProfile, ActivityLog } from '../types';
import { calculateStreak } from '../utils/streakHelper';
import { LanguageCode, getTranslation } from '../lib/i18n';
import { playClickSound } from '../lib/audio';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  Target, 
  ChevronRight, 
  Plus, 
  Activity, 
  TrendingUp, 
  Clock, 
  Heart,
  User,
  ArrowUpRight
} from 'lucide-react';

interface HomeHubProps {
  profile: PlayerProfile;
  logs: ActivityLog[];
  onNavigateToTab: (tab: 'dashboard' | 'goals' | 'config' | 'inicio') => void;
  onOpenRegisterModal: () => void;
  onOpenDiario?: () => void;
  language: LanguageCode;
}

export default function HomeHub({
  profile,
  logs,
  onNavigateToTab,
  onOpenRegisterModal,
  onOpenDiario,
  language
}: HomeHubProps) {
  const streak = calculateStreak(logs);
  
  // Real activity aggregates
  const totalLogs = logs.length;
  const matchesCount = logs.filter(l => l.tipo === 'Partido').length;
  const trainingsCount = logs.filter(l => l.tipo === 'Entrenamiento').length;
  
  const totalGoles = logs.reduce((sum, l) => sum + (l.goles || 0), 0);
  const totalAsistencias = logs.reduce((sum, l) => sum + (l.asistencias || 0), 0);
  const totalAtajadas = logs.reduce((sum, l) => sum + (l.atajadas || 0), 0);

  const t = (key: any) => getTranslation(key, language);
  const triggerClick = () => playClickSound();

  // Safely get the 3 most recent logs
  const lastLogs = logs.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 text-left pb-16"
    >
      
      {/* Elegant Header Greeting */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">
            {language === 'EN' ? 'Professional Athlete Dashboard' : language === 'PT' ? 'Futebolista Painel de Desempenho' : 'Panel de Desempeño Profesional'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
            {language === 'EN' ? 'Hello' : language === 'PT' ? 'Olá' : 'Hola'}, {profile.nombre} 👋
          </h2>
          <p className="text-xs text-neutral-440 mt-1 font-sans">
            {language === 'EN' ? 'Track your physical and tactical path at ' : language === 'PT' ? 'Monitore sua preparação técnica no ' : 'Rastrea tu preparación técnica y física en el '} 
            <span className="text-white font-semibold">{profile.club}</span>.
          </p>
        </div>

        {/* Quick action: new entry button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            triggerClick();
            onOpenRegisterModal();
          }}
          className="sm:self-center flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
        >
          <Plus className="w-4 h-4 text-neutral-950 stroke-[3]" />
          {t('hub_log_activity')}
        </motion.button>
      </motion.div>

      {/* Main Grid: Essential Overview & Active Streak */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Streak & Active Period card */}
        <motion.div 
          variants={itemVariants} 
          className="md:col-span-4 bg-gradient-to-br from-neutral-900 to-black border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden min-h-[180px] transition-all duration-300"
        >
          <div className="space-y-1.5 relative z-10">
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 font-mono block">
              {language === 'EN' ? 'Activity Streak' : language === 'PT' ? 'Sequência Ativa' : 'Racha de actividad'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono leading-none">{streak}</span>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                {t('hub_days_streak')}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              {language === 'EN' 
                ? 'Log training or matches daily to build your streak and unlock new technical milestones.' 
                : language === 'PT' 
                ? 'Registre treinos ou partidas todos os dias para acumular consistência.' 
                : 'Registra entrenamientos o partidos diariamente para acumular tu constancia y desbloquear insignias.'}
            </p>
          </div>
          
          <div className="pt-4 border-t border-white/[0.04] flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider font-extrabold text-amber-500 relative z-10 select-none">
            <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500/10 animate-pulse shrink-0" />
            <span>{language === 'EN' ? 'Focus of constant competition' : language === 'PT' ? 'Foco competitivo constante' : 'Foco de competición constante'}</span>
          </div>

          {/* Decorative faint glow */}
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </motion.div>

        {/* Dynamic Aggregates based on player's declared position */}
        <motion.div 
          variants={itemVariants} 
          className="md:col-span-8 bg-neutral-900 border border-white/[0.04] hover:border-emerald-500/15 rounded-2xl p-5 flex flex-col justify-between min-h-[180px] transition-all duration-300"
        >
          <div className="space-y-1 pb-3 border-b border-white/[0.03]">
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 font-mono block">
              {language === 'EN' ? 'Statistics Summary' : language === 'PT' ? 'Métricas de Performance Real' : 'Resumen de Estadísticas Reales'}
            </span>
            <div className="text-xs font-bold text-white uppercase font-sans">
              {language === 'EN' ? 'Aggregated Tracker' : language === 'PT' ? 'Totais Acumulados' : 'Métricas Acumuladas'} — {profile.posicion}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-550 font-mono uppercase block">
                {language === 'EN' ? 'Matches' : language === 'PT' ? 'Partidas' : 'Partidos'}
              </span>
              <span className="text-xl font-black text-white font-mono">{matchesCount}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-550 font-mono uppercase block">
                {language === 'EN' ? 'Trainings' : language === 'PT' ? 'Treinos' : 'Entrenos'}
              </span>
              <span className="text-xl font-black text-white font-mono">{trainingsCount}</span>
            </div>

            {profile.posicion === 'Arquero' ? (
              <>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-neutral-550 font-mono uppercase block">
                    {language === 'EN' ? 'Saves' : language === 'PT' ? 'Defesas' : 'Atajadas'}
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{totalAtajadas}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-neutral-550 font-mono uppercase block">
                    {language === 'EN' ? 'Clean Sheets' : language === 'PT' ? 'Sem sofrer gols' : 'Valla Invicta'}
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {logs.filter(l => l.vallaInvicta).length}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-neutral-550 font-mono uppercase block">
                    {language === 'EN' ? 'Goals' : language === 'PT' ? 'Gols' : 'Goles'}
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{totalGoles}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-neutral-550 font-mono uppercase block">
                    {language === 'EN' ? 'Assists' : language === 'PT' ? 'Assistências' : 'Asistencias'}
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{totalAsistencias}</span>
                </div>
              </>
            )}
          </div>

          <div className="pt-2.5 border-t border-white/[0.03] flex justify-between items-center text-[10px] text-neutral-500 font-mono">
            <span>{language === 'EN' ? 'Live database counts' : language === 'PT' ? 'Atualização de métricas locais' : 'Última actualización de métricas en vivo'}</span>
            <button
              onClick={() => {
                triggerClick();
                onNavigateToTab('dashboard');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-black uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
            >
              {t('hub_go_all_stats')} <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

      </div>

      {/* Recents Entries Panel: Real Diary Insights */}
      <motion.div variants={itemVariants} className="bg-neutral-900 border border-white/[0.04] hover:border-emerald-500/10 rounded-2xl p-5 space-y-4 transition-all duration-300">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
              {t('hub_recent_activity')}
            </h3>
          </div>
          {onOpenDiario && lastLogs.length > 0 && (
            <button
              onClick={() => {
                triggerClick();
                onOpenDiario();
              }}
              className="text-[10px] font-black uppercase text-neutral-400 hover:text-white transition cursor-pointer font-mono"
            >
              {language === 'EN' ? 'View All' : language === 'PT' ? 'Ver Todos' : 'Ver Todas'} ({totalLogs})
            </button>
          )}
        </div>

        {lastLogs.length === 0 ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-xs text-neutral-450 leading-relaxed max-w-sm mx-auto">
              {t('hub_empty_logs')} {t('hub_empty_logs_sub')}
            </p>
            <button
              onClick={() => {
                triggerClick();
                onOpenRegisterModal();
              }}
              className="py-2 px-4 bg-neutral-850 hover:bg-neutral-800 border border-white/5 text-[10px] text-white uppercase font-black tracking-wider transition rounded-xl cursor-pointer"
            >
              {language === 'EN' ? 'Log First Day' : language === 'PT' ? 'Criar Primeiro Log' : 'Crear tu Primer Registro'}
            </button>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-my-4 divide-y divide-white/[0.03]">
              {lastLogs.map((log) => (
                <li key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono uppercase tracking-wider border ${
                        log.tipo === 'Partido' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/15'
                      }`}>
                        {log.tipo === 'Partido' ? t('log_match') : t('log_training')}
                      </span>
                      <span className="text-xs text-neutral-300 font-mono">
                        {new Date(log.fecha).toLocaleDateString(language === 'EN' ? 'en-US' : language === 'PT' ? 'pt-BR' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {log.reflexion ? (
                      <p className="text-[11px] text-neutral-400 font-sans italic leading-relaxed max-w-xl line-clamp-1">
                        "{log.reflexion}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-neutral-500 font-sans italic">
                        {language === 'EN' ? 'No reflections written' : language === 'PT' ? 'Sem comentários' : 'Sin reflexiones escritas en esta jornada.'}
                      </p>
                    )}
                  </div>

                  {/* Highlights */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto font-mono text-xs text-neutral-400">
                    {profile.posicion === 'Arquero' ? (
                      <>
                        {log.atajadas > 0 && (
                          <span>🥅 <b>{log.atajadas}</b> {language === 'EN' ? 'Saves' : language === 'PT' ? 'Defesas' : 'Atajadas'}</span>
                        )}
                        {log.vallaInvicta && (
                          <span className="text-emerald-400 font-bold">🛡️ {language === 'EN' ? 'Clean Sheet' : language === 'PT' ? 'Arco Inviolado' : 'Arco Limpio'}</span>
                        )}
                      </>
                    ) : (
                      <>
                        {log.goles > 0 && (
                          <span>⚽ <b>{log.goles}</b> {language === 'EN' ? 'Goals' : language === 'PT' ? 'Gols' : 'Goles'}</span>
                        )}
                        {log.asistencias > 0 && (
                          <span>👟 <b>{log.asistencias}</b> {language === 'EN' ? 'Assists' : language === 'PT' ? 'Assistências' : 'Asistencias'}</span>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Modern Quick Direct Shortcuts */}
      <div className="space-y-3.5">
        <motion.h4 variants={itemVariants} className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono select-none">
          {t('hub_shortcuts_title')}
        </motion.h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Dashboard Stats */}
          <motion.button
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              triggerClick();
              onNavigateToTab('dashboard');
            }}
            className="p-5 bg-neutral-900 hover:bg-neutral-850 hover:border-emerald-500/25 border border-white/5 rounded-2xl text-left space-y-1 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="p-1 px-2.5 bg-neutral-850 border border-white/10 text-neutral-300 group-hover:text-emerald-400 transition text-[10px] font-mono font-black uppercase">
                {language === 'EN' ? 'Statistics' : language === 'PT' ? 'Metodologia' : 'Metodología'}
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-xs font-black text-white uppercase tracking-tight pt-2">
              {language === 'EN' ? 'Metrics & Performance' : language === 'PT' ? 'Métricas & Histórico' : 'Métricas e Historial'}
            </div>
            <p className="text-[10px] text-neutral-450 leading-relaxed font-sans">
              {language === 'EN' 
                ? 'Visualize analytical charts, season tally, and weekly workload averages.' 
                : language === 'PT' 
                ? 'Visualize gráficos analíticos e estatísticas gerais da temporada.' 
                : 'Visualiza tus gráficos analíticos, evolución acumulativa y promedio de desempeño deportivo.'}
            </p>
          </motion.button>

          {/* Goals management */}
          <motion.button
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              triggerClick();
              onNavigateToTab('goals');
            }}
            className="p-5 bg-neutral-900 hover:bg-neutral-850 hover:border-emerald-500/25 border border-white/5 rounded-2xl text-left space-y-1 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="p-1 px-2.5 bg-neutral-850 border border-white/10 text-neutral-300 group-hover:text-emerald-400 transition text-[10px] font-mono font-black uppercase">
                {language === 'EN' ? 'Planning' : language === 'PT' ? 'Planejamento' : 'Planificación'}
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-xs font-black text-white uppercase tracking-tight pt-2">
              {language === 'EN' ? 'Season Objectives' : language === 'PT' ? 'Metas Definidas' : 'Metas de la Temporada'}
            </div>
            <p className="text-[10px] text-neutral-450 leading-relaxed font-sans">
              {language === 'EN' 
                ? 'Add, remove or clear physical, technical core objectives and workout tasks.' 
                : language === 'PT' 
                ? 'Gerencie seus alvos diários e conquistas técnicas a curto prazo.' 
                : 'Registra, edita o tacha los objetivos técnicos, tácticos y de fuerza muscular para el próximo ciclo de competencia.'}
            </p>
          </motion.button>

        </div>
      </div>

    </motion.div>
  );
}
