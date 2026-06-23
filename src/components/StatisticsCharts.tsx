import React, { useState } from 'react';
import { ActivityLog, PlayerProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Info,
  Trophy
} from 'lucide-react';

interface StatisticsChartsProps {
  logs: ActivityLog[];
  profile?: PlayerProfile | null;
}

export default function StatisticsCharts({ logs, profile }: StatisticsChartsProps) {
  const [activeTab, setActiveTab] = useState<'tecnico' | 'fisico'>('tecnico');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const matches = logs.filter((log) => log.tipo === 'Partido');
  const isArquero = profile?.posicion === 'Arquero';

  // 1. Calculate historical metrics
  const totalPartidos = matches.length;
  const totalGoles = matches.reduce((sum, m) => sum + m.goles, 0);
  const totalAsistencias = matches.reduce((sum, m) => sum + m.asistencias, 0);
  const totalAtajadas = matches.reduce((sum, m) => sum + (m.atajadas || 0), 0);
  const totalVallasInvictas = matches.reduce((sum, m) => sum + (m.vallaInvicta ? 1 : 0), 0);

  const promedioGoles = totalPartidos > 0 ? parseFloat((totalGoles / totalPartidos).toFixed(2)) : 0;
  const promedioAsistencias = totalPartidos > 0 ? parseFloat((totalAsistencias / totalPartidos).toFixed(2)) : 0;
  const promedioAtajadas = totalPartidos > 0 ? parseFloat((totalAtajadas / totalPartidos).toFixed(2)) : 0;
  
  // Percentage of clean sheets over total matches
  const promedioVallasPct = totalPartidos > 0 
    ? Math.round((totalVallasInvictas / totalPartidos) * 100) 
    : 0;

  // Calculate physical smartwatch averages
  const matchesWithSmartwatch = matches.filter(m => m.smartwatchKm !== undefined || m.smartwatchBpm !== undefined);
  const smartwatchCount = matchesWithSmartwatch.length;
  const totalBpm = matchesWithSmartwatch.reduce((sum, m) => sum + (m.smartwatchBpm || 0), 0);
  const totalKm = matchesWithSmartwatch.reduce((sum, m) => sum + (m.smartwatchKm || 0), 0);

  const promedioBpm = smartwatchCount > 0 ? Math.round(totalBpm / smartwatchCount) : 0;
  const promedioKm = smartwatchCount > 0 ? parseFloat((totalKm / smartwatchCount).toFixed(2)) : 0;

  // 2. Fetch last 5 matches (oldest to newest for rendering chronologically left-to-right)
  const last5Matches = [...matches]
    .sort((a, b) => b.timestamp - a.timestamp) // newest first
    .slice(0, 5)
    .reverse(); // back to chronological order (oldest to newest)

  const pointsCount = last5Matches.length;

  // Find max values in last 5 matches to scale the SVG charts dynamically
  let maxTecnicoVal = 1;
  let maxKmVal = 1;
  let maxBpmVal = 1;

  last5Matches.forEach((m) => {
    // Technical max
    if (isArquero) {
      const at = m.atajadas || 0;
      if (at > maxTecnicoVal) maxTecnicoVal = at;
    } else {
      if (m.goles > maxTecnicoVal) maxTecnicoVal = m.goles;
      if (m.asistencias > maxTecnicoVal) maxTecnicoVal = m.asistencias;
    }

    // Physical maxes
    if (m.smartwatchKm && m.smartwatchKm > maxKmVal) maxKmVal = m.smartwatchKm;
    if (m.smartwatchBpm && m.smartwatchBpm > maxBpmVal) maxBpmVal = m.smartwatchBpm;
  });

  // Scale bounds helper to avoid dividing-by-zero or tiny increments
  maxTecnicoVal = Math.max(1, maxTecnicoVal);
  maxKmVal = Math.max(2, maxKmVal);
  maxBpmVal = Math.max(100, maxBpmVal);

  // SVG Coordinates calculations
  const width = 500;
  const height = 190;
  const paddingX = 50;
  const paddingY = 30;

  // Metric 1: Goals / Saves coordinates
  const goalsPoints = last5Matches.map((m, i) => {
    const divisorX = pointsCount > 1 ? pointsCount - 1 : 1;
    const x = paddingX + (i / divisorX) * (width - paddingX * 2);
    const val = isArquero ? (m.atajadas || 0) : m.goles;
    const y = height - paddingY - (val / maxTecnicoVal) * (height - paddingY * 2);
    return { x, y, value: val, date: m.fecha };
  });

  // Metric 2: Assists / Clean sheets coordinates
  const assistsPoints = last5Matches.map((m, i) => {
    const divisorX = pointsCount > 1 ? pointsCount - 1 : 1;
    const x = paddingX + (i / divisorX) * (width - paddingX * 2);
    const valRaw = isArquero ? (m.vallaInvicta ? 1 : 0) : m.asistencias;
    // Scale clean sheet visual line to be either full peak or base
    const valScaled = isArquero ? (m.vallaInvicta ? maxTecnicoVal : 0) : valRaw;
    const y = height - paddingY - (valScaled / maxTecnicoVal) * (height - paddingY * 2);
    return { x, y, value: valRaw, date: m.fecha };
  });

  // Metric 3: Kilometers coordinates
  const kmPoints = last5Matches.map((m, i) => {
    const divisorX = pointsCount > 1 ? pointsCount - 1 : 1;
    const x = paddingX + (i / divisorX) * (width - paddingX * 2);
    const val = m.smartwatchKm || 0;
    const y = height - paddingY - (val / maxKmVal) * (height - paddingY * 2);
    return { x, y, value: val, date: m.fecha };
  });

  // Metric 4: Health Heart BPM coordinates
  const bpmPoints = last5Matches.map((m, i) => {
    const divisorX = pointsCount > 1 ? pointsCount - 1 : 1;
    const x = paddingX + (i / divisorX) * (width - paddingX * 2);
    const val = m.smartwatchBpm || 0;
    // Normalize BPM (range 60 bpm to maxBpmVal) for better spatial resolution
    const minBpmRange = 60;
    const valNormalized = Math.max(0, val - minBpmRange);
    const maxBpmRange = Math.max(1, maxBpmVal - minBpmRange);
    const y = height - paddingY - (valNormalized / maxBpmRange) * (height - paddingY * 2);
    return { x, y, value: val, date: m.fecha };
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

  // Paths calculations
  const goalsPath = createPath(goalsPoints);
  const assistsPath = createPath(assistsPoints);
  const goalsAreaPath = createAreaPath(goalsPoints);
  const assistsAreaPath = createAreaPath(assistsPoints);

  const kmPath = createPath(kmPoints);
  const bpmPath = createPath(bpmPoints);
  const kmAreaPath = createAreaPath(kmPoints);
  const bpmAreaPath = createAreaPath(bpmPoints);

  // Simple date formatter (e.g. "29 May")
  const formatDateLabel = (isoString: string) => {
    try {
      const d = new Date(isoString + 'T12:00:00');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return isoString;
    }
  };

  const activeHoveredMatch = hoveredIndex !== null ? last5Matches[hoveredIndex] : null;

  return (
    <div className="space-y-5 pb-24" id="stats-charts-section">
      {/* 1. Header with dynamic switcher tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/40 p-1.5 rounded-2xl border border-neutral-850 backdrop-blur-md">
        <div className="flex p-1 gap-1">
          <button
            onClick={() => setActiveTab('tecnico')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'tecnico' 
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/15' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${activeTab === 'tecnico' ? 'fill-neutral-950' : ''}`} />
            <span>Rendimiento Técnico</span>
          </button>
          <button
            onClick={() => setActiveTab('fisico')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'fisico' 
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/15' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Métricas Físicas</span>
          </button>
        </div>

        <div className="px-3 py-1.5 sm:py-0 flex items-center gap-2 text-right">
          <span className="text-[10px] sm:text-xs font-mono font-medium text-neutral-500">
            Muestra histórica sobre {totalPartidos} {totalPartidos === 1 ? 'partido' : 'partidos'}
          </span>
        </div>
      </div>

      {/* 2. Target metric totals depends on tab selection */}
      <AnimatePresence mode="wait">
        {activeTab === 'tecnico' ? (
          <motion.div 
            key="tecnico-cards"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {/* Average score / saves */}
            <div className="glass p-3.5 sm:p-5 flex items-center justify-between border border-neutral-800 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/[0.02] rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/[0.04] transition-all duration-300" />
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">
                  {isArquero ? 'Promedio Atajadas' : 'Promedio Goles'}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2.5xl sm:text-3.5xl font-extrabold text-white tracking-tight leading-none italic font-mono">
                    {isArquero ? promedioAtajadas : promedioGoles}
                  </span>
                  <span className="text-[10px] text-neutral-505 font-light">
                    por part.
                  </span>
                </div>
                <span className="text-[9px] text-emerald-400 block mt-2 font-black uppercase tracking-wider font-mono">
                  Total: {isArquero ? totalAtajadas : totalGoles} {isArquero ? 'clv' : 'marcas'}
                </span>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/15 text-[10px] font-black italic">
                {isArquero ? 'SVS' : 'GOL'}
              </div>
            </div>

            {/* Average assists / clean sheets */}
            <div className="glass p-3.5 sm:p-5 flex items-center justify-between border border-neutral-800 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/[0.02] rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/[0.04] transition-all duration-300" />
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">
                  {isArquero ? 'Arcos en Cero' : 'Promedio Asistencias'}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2.5xl sm:text-3.5xl font-extrabold text-white tracking-tight leading-none italic font-mono">
                    {isArquero ? `${promedioVallasPct}%` : promedioAsistencias}
                  </span>
                  <span className="text-[10px] text-neutral-505 font-light">
                    {isArquero ? 'efect.' : 'por part.'}
                  </span>
                </div>
                <span className="text-[9px] text-amber-500 block mt-2 font-black uppercase tracking-wider font-mono">
                  {isArquero ? `${totalVallasInvictas} vallas invictas` : `Total: ${totalAsistencias} pases gol`}
                </span>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/15 text-[10px] font-black italic">
                {isArquero ? 'INV' : 'AST'}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="fisico-cards"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {/* Average Smartwatch covered distance */}
            <div className="glass p-3.5 sm:p-5 flex items-center justify-between border border-neutral-800 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/[0.02] rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/[0.04] transition-all duration-300" />
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">
                  Distancia Promedio
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2.5xl sm:text-3.5xl font-extrabold text-cyan-400 tracking-tight leading-none italic font-mono">
                    {promedioKm > 0 ? `${promedioKm}k` : '---'}
                  </span>
                  <span className="text-[10px] text-neutral-505 font-light">
                    por part.
                  </span>
                </div>
                <span className="text-[9px] text-neutral-500 block mt-2 font-black uppercase tracking-wider font-mono">
                  {smartwatchCount > 0 ? `Calculado en ${smartwatchCount} logs` : 'Sin registros Xiaomi'}
                </span>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-cyan-530/10 text-cyan-405 flex items-center justify-center border border-cyan-500/15 text-[10px] font-black italic">
                DST
              </div>
            </div>

            {/* Average Heart rate */}
            <div className="glass p-3.5 sm:p-5 flex items-center justify-between border border-neutral-800 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/[0.02] rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/[0.04] transition-all duration-300" />
              <div>
                <span className="text-[9px] sm:text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">
                  Frecuencia Cardíaca
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2.5xl sm:text-3.5xl font-extrabold text-rose-450 tracking-tight leading-none italic font-mono">
                    {promedioBpm > 0 ? `${promedioBpm}` : '---'}
                  </span>
                  <span className="text-[10px] text-neutral-505 font-light">
                    LPM avg.
                  </span>
                </div>
                <span className="text-[9px] text-rose-500 block mt-2 font-black uppercase tracking-wider font-mono">
                  {promedioBpm > 150 ? 'Esfuerzo de Alta Intensidad' : promedioBpm > 0 ? 'Zona aeróbica ideal' : 'Sin ritmo registrado'}
                </span>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/15 text-[10px] font-black italic">
                BPM
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Chart Panel */}
      <div className="glass p-4.5 sm:p-6 shadow-2xl rounded-2xl border border-neutral-800 space-y-4 relative overflow-hidden bg-neutral-900/30">
        
        {/* Plot header details & Legends */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.07]">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <AreaChart className="w-4 h-4 text-emerald-400" />
              {activeTab === 'tecnico' 
                ? (isArquero ? 'Historial de Bloqueos y Seguridad' : 'Goles y Asistencias del Ciclo')
                : 'Monitoreo de Esfuerzo Físico'
              }
            </h3>
            <p className="text-[10px] text-neutral-500 font-light mt-0.5">
              {activeTab === 'tecnico' 
                ? 'Curvas de efectividad ofensiva y técnica en los últimos 5 partidos jugados.' 
                : 'Información telemétrica del sensor pulsera/reloj inteligente Xiaomi.'}
            </p>
          </div>

          {/* Map Legends based on active view */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono leading-none">
            {activeTab === 'tecnico' ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-neutral-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  {isArquero ? 'Atajadas' : 'Goles'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-neutral-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                  {isArquero ? 'Arco en Cero' : 'Asistencias'}
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 text-neutral-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
                  Kilómetros
                </span>
                <span className="inline-flex items-center gap-1.5 text-neutral-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                  Ritmo Cardíaco (BPM)
                </span>
              </>
            )}
          </div>
        </div>

        {last5Matches.length === 0 ? (
          <div className="py-14 text-center bg-white/[0.02] border border-white/[0.05] rounded-2xl">
            <Calendar className="w-8 h-8 text-neutral-600 mx-auto mb-2 animate-bounce" />
            <span className="text-xs font-black text-neutral-400 block uppercase tracking-wider">
              Sin partidos registrados
            </span>
            <p className="text-[10px] text-neutral-500 mt-1 max-w-xs mx-auto font-light leading-relaxed px-5">
              Para generar el gráfico, registra un diario con tipo de jornada <strong className="text-emerald-400">"Partido"</strong> anotando tus minutos y estadísticas.
            </p>
          </div>
        ) : activeTab === 'fisico' && smartwatchCount === 0 ? (
          <div className="py-14 text-center bg-white/[0.02] border border-white/[0.05] rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-amber-500/80 mx-auto mb-2" />
            <span className="text-xs font-black text-neutral-400 block uppercase tracking-wider">
              Xiaomi/Smartwatch desconectado
            </span>
            <p className="text-[10px] text-neutral-500 mt-1 max-w-xs mx-auto font-light leading-relaxed px-5">
              Ninguno de tus últimos {pointsCount} partidos tiene guardada información sobre ritmo cardíaco o kilómetros.
            </p>
            <p className="text-[9px] text-neutral-650 mt-1.5 max-w-xs mx-auto italic">
              * Puedes agregarla editando tus partidos en el feed del diario.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* SVG Interactive Line / Area chart */}
            <div className="bg-neutral-950/[0.3] rounded-2xl p-2 sm:p-4.5 border border-white/[0.05] relative overflow-visible">
              
              <svg 
                className="w-full h-auto overflow-visible select-none" 
                viewBox={`0 0 ${width} ${height}`}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Horizontal grid guide lines */}
                {[0, 1, 2, 3].map((v) => {
                  const y = paddingY + (v * (height - paddingY * 2)) / 3;
                  return (
                    <line
                      key={v}
                      x1={paddingX - 10}
                      y1={y}
                      x2={width - paddingX + 10}
                      y2={y}
                      className="stroke-white/[0.025]"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* 1. Technical Areas / Paths (Tab: Técnico) */}
                {activeTab === 'tecnico' && (
                  <>
                    {/* Glow background areas */}
                    {goalsAreaPath && (
                      <path
                        d={goalsAreaPath}
                        fill="url(#goalsGrad)"
                        className="opacity-[0.08]"
                      />
                    )}
                    {assistsAreaPath && (
                      <path
                        d={assistsAreaPath}
                        fill="url(#assistsGrad)"
                        className="opacity-[0.05]"
                      />
                    )}

                    {/* Bold outline paths */}
                    {goalsPath && (
                      <path
                        d={goalsPath}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glowGreen)"
                      />
                    )}
                    {assistsPath && (
                      <path
                        d={assistsPath}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glowAmber)"
                      />
                    )}
                  </>
                )}

                {/* 2. Physical Areas / Paths (Tab: Físico) */}
                {activeTab === 'fisico' && (
                  <>
                    {/* Glow background areas */}
                    {kmAreaPath && (
                      <path
                        d={kmAreaPath}
                        fill="url(#kmGrad)"
                        className="opacity-[0.08]"
                      />
                    )}
                    {bpmAreaPath && (
                      <path
                        d={bpmAreaPath}
                        fill="url(#bpmGrad)"
                        className="opacity-[0.05]"
                      />
                    )}

                    {/* Bold outline paths */}
                    {kmPath && (
                      <path
                        d={kmPath}
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glowCyan)"
                      />
                    )}
                    {bpmPath && (
                      <path
                        d={bpmPath}
                        fill="none"
                        stroke="#F43F5E"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glowRose)"
                      />
                    )}
                  </>
                )}

                {/* Hover Indicator Vertical Line */}
                {hoveredIndex !== null && (
                  <line
                    x1={
                      activeTab === 'tecnico' 
                        ? goalsPoints[hoveredIndex].x 
                        : kmPoints[hoveredIndex].x
                    }
                    y1={paddingY - 15}
                    x2={
                      activeTab === 'tecnico' 
                        ? goalsPoints[hoveredIndex].x 
                        : kmPoints[hoveredIndex].x
                    }
                    y2={height - paddingY + 5}
                    className="stroke-emerald-400/40"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                )}

                {/* Grid vertical lines & column triggers */}
                {last5Matches.map((match, i) => {
                  const divisorX = pointsCount > 1 ? pointsCount - 1 : 1;
                  const x = paddingX + (i / divisorX) * (width - paddingX * 2);
                  
                  return (
                    <g key={match.id} className="cursor-pointer">
                      {/* Anchor vertical guidelines */}
                      <line
                        x1={x}
                        y1={paddingY}
                        x2={x}
                        y2={height - paddingY}
                        className="stroke-white/[0.04]"
                        strokeWidth="1"
                      />

                      {/* X-axis date labels */}
                      <text
                        x={x}
                        y={height - 8}
                        textAnchor="middle"
                        className={`font-mono text-[9px] font-black tracking-tight transition-all duration-300 ${
                          hoveredIndex === i ? 'fill-emerald-400 scale-105' : 'fill-neutral-500'
                        }`}
                      >
                        {formatDateLabel(match.fecha)}
                      </text>

                      {/* Match shorthand index marker (P1, P2...) */}
                      <text
                        x={x}
                        y={paddingY - 12}
                        textAnchor="middle"
                        className={`font-mono text-[8px] font-extrabold tracking-widest ${
                          hoveredIndex === i ? 'fill-white' : 'fill-neutral-600'
                        }`}
                      >
                        P{i + 1}
                      </text>

                      {/* Invisible wider mouse-hover target region for easier touching/hovering */}
                      <rect
                        x={x - (width - paddingX * 2) / (pointsCount * 2)}
                        y={paddingY - 20}
                        width={(width - paddingX * 2) / Math.max(1, pointsCount - 1)}
                        height={height - paddingY * 2 + 40}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                      />
                    </g>
                  );
                })}

                {/* 3. SVG Definitions for filters, gradients and overlays */}
                <defs>
                  <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glowRose" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Gradient paths */}
                  <linearGradient id="goalsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="assistsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="kmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* 4. Active node circle bullets (Tab: Técnico) */}
                {activeTab === 'tecnico' && (
                  <>
                    {goalsPoints.map((pt, i) => (
                      <g key={`g-dot-${i}`} className="pointer-events-none">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredIndex === i ? '7' : '5'}
                          fill="#10B981"
                          stroke="#0a0a0c"
                          strokeWidth="2.5"
                          className="transition-all duration-300"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredIndex === i ? '14' : '0'}
                          fill="#10B981"
                          className="opacity-15 transition-all duration-300 pointer-events-none"
                        />
                        {/* Interactive floating point values inside elements directly */}
                        {hoveredIndex === i && (
                          <text
                            x={pt.x}
                            y={pt.y - 12}
                            textAnchor="middle"
                            className="fill-emerald-400 font-black font-mono text-[10px] drop-shadow-md"
                          >
                            {pt.value}
                          </text>
                        )}
                      </g>
                    ))}

                    {assistsPoints.map((pt, i) => (
                      <g key={`a-dot-${i}`} className="pointer-events-none">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredIndex === i ? '7' : '5'}
                          fill="#F59E0B"
                          stroke="#0a0a0c"
                          strokeWidth="2.5"
                          className="transition-all duration-300"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredIndex === i ? '14' : '0'}
                          fill="#F59E0B"
                          className="opacity-15 transition-all duration-300 pointer-events-none"
                        />
                        {hoveredIndex === i && (
                          <text
                            x={pt.x}
                            y={pt.y - 12}
                            textAnchor="middle"
                            className="fill-amber-400 font-black font-mono text-[9px] drop-shadow-md"
                          >
                            {isArquero ? (pt.value ? 'CERO' : 'REC') : pt.value}
                          </text>
                        )}
                      </g>
                    ))}
                  </>
                )}

                {/* 5. Active node circle bullets (Tab: Físico) */}
                {activeTab === 'fisico' && (
                  <>
                    {kmPoints.map((pt, i) => (
                      <g key={`km-dot-${i}`} className="pointer-events-none">
                        {pt.value > 0 && (
                          <>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredIndex === i ? '7' : '5'}
                              fill="#06B6D4"
                              stroke="#0a0a0c"
                              strokeWidth="2.5"
                              className="transition-all duration-300"
                            />
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredIndex === i ? '14' : '0'}
                              fill="#06B6D4"
                              className="opacity-15 transition-all duration-300"
                            />
                          </>
                        )}
                      </g>
                    ))}

                    {bpmPoints.map((pt, i) => (
                      <g key={`bpm-dot-${i}`} className="pointer-events-none">
                        {pt.value > 0 && (
                          <>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredIndex === i ? '7' : '5'}
                              fill="#F43F5E"
                              stroke="#0a0a0c"
                              strokeWidth="2.5"
                              className="transition-all duration-300"
                            />
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredIndex === i ? '14' : '0'}
                              fill="#F43F5E"
                              className="opacity-15 transition-all duration-300"
                            />
                          </>
                        )}
                      </g>
                    ))}
                  </>
                )}
              </svg>

              {/* Dynamic Overlay floating descriptive statistics card */}
              <div className="absolute top-1 right-2 pointer-events-none select-none z-10 hidden sm:block">
                <AnimatePresence>
                  {activeHoveredMatch ? (
                    <motion.div
                      initial={{ opacity: 0, x: 10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 10, scale: 0.95 }}
                      className="bg-neutral-900/90 border border-neutral-800 backdrop-blur-md p-3.5 rounded-xl shadow-xl w-60 space-y-1.5"
                    >
                      <div className="flex justify-between items-center pb-1 border-b border-white/[0.04]">
                        <span className="text-[9px] font-black text-emerald-400 tracking-wider uppercase font-mono">
                          Detalle Partido
                        </span>
                        <span className="text-[9px] text-neutral-450 font-mono font-medium">
                          {activeHoveredMatch.fecha}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <div>
                          <span className="text-[8px] text-neutral-500 uppercase font-black block leading-none">
                            {isArquero ? 'Atajadas' : 'Goles'}
                          </span>
                          <span className="text-xs font-black text-white font-mono leading-normal">
                            {isArquero ? (activeHoveredMatch.atajadas || 0) : activeHoveredMatch.goles}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-neutral-500 uppercase font-black block leading-none">
                            {isArquero ? 'Arco Invicto' : 'Asistencias'}
                          </span>
                          <span className="text-xs font-black text-white font-mono leading-normal">
                            {isArquero ? (activeHoveredMatch.vallaInvicta ? 'Sí ✅' : 'No ❌') : activeHoveredMatch.asistencias}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-neutral-500 uppercase font-black block leading-none">
                            Smartwatch Km
                          </span>
                          <span className="text-xs font-black text-cyan-400 font-mono leading-normal">
                            {activeHoveredMatch.smartwatchKm !== undefined ? `${activeHoveredMatch.smartwatchKm} km` : '---'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-neutral-500 uppercase font-black block leading-none">
                            Smartwatch BPM
                          </span>
                          <span className="text-xs font-black text-rose-450 font-mono leading-normal">
                            {activeHoveredMatch.smartwatchBpm !== undefined ? `${activeHoveredMatch.smartwatchBpm} lpm` : '---'}
                          </span>
                        </div>
                      </div>

                      {activeHoveredMatch.reflexion && (
                        <p className="text-[9px] text-neutral-450 italic font-light pt-1 border-t border-white/[0.04] leading-relaxed truncate">
                          "{activeHoveredMatch.reflexion}"
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      className="bg-neutral-900/25 border border-dashed border-neutral-800 p-2.5 rounded-xl w-60 text-center"
                    >
                      <span className="text-[8.5px] text-neutral-500 uppercase tracking-widest font-black block">
                        Pasa el cursor por los puntos
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile-only responsive tooltip banner shown inline below the chart */}
            <div className="block sm:hidden h-24 relative">
              <AnimatePresence mode="wait">
                {activeHoveredMatch ? (
                  <motion.div
                    key={activeHoveredMatch.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="bg-neutral-950/65 border border-neutral-850 p-3 rounded-xl shadow-lg text-left space-y-1.5"
                  >
                    <div className="flex justify-between items-center leading-none">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider font-mono">
                        Partido del {activeHoveredMatch.fecha}
                      </span>
                      {activeHoveredMatch.smartwatchKm && (
                        <span className="bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                          Xiaomi Sync
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 text-[11px] leading-tight font-mono pt-0.5">
                      <div>
                        <span className="text-[8px] text-neutral-550 block leading-none mr-1.5">
                          {isArquero ? 'ATAJADAS:' : 'GOLES:'}
                        </span>
                        <strong className="text-white">
                          {isArquero ? (activeHoveredMatch.atajadas || 0) : activeHoveredMatch.goles}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-neutral-550 block leading-none mr-1.5">
                          {isArquero ? 'ARCO EN CERO:' : 'ASISTENCIAS:'}
                        </span>
                        <strong className="text-white">
                          {isArquero ? (activeHoveredMatch.vallaInvicta ? 'Sí ✅' : 'No ❌') : activeHoveredMatch.asistencias}
                        </strong>
                      </div>
                      {activeHoveredMatch.smartwatchKm && (
                        <div>
                          <span className="text-[8px] text-neutral-550 block leading-none mr-1.5">
                            ESFUERZO Km:
                          </span>
                          <strong className="text-cyan-400">{activeHoveredMatch.smartwatchKm}k</strong>
                        </div>
                      )}
                    </div>

                    {activeHoveredMatch.reflexion && (
                      <p className="text-[9.5px] text-neutral-450 italic font-light truncate leading-none">
                        "{activeHoveredMatch.reflexion}"
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-white/[0.01] border border-dashed border-neutral-850 rounded-xl p-4.5 text-center flex items-center justify-center h-full">
                    <p className="text-[10px] text-neutral-500 font-light">
                      Selecciona o presiona cualquier punto para ver detalles del rendimiento.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick summary footnote explaining data reading */}
            <p className="text-[10px] text-neutral-500 italic text-center font-light leading-relaxed">
              {isArquero 
                ? '* El gráfico de curvas muestra tu consistencia en el arco (atajadas acumuladas) y efectividad de arco en cero (CERO).'
                : '* El gráfico de curvas muestra tu progresión y consistencia en el ataque a lo largo de los partidos.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
