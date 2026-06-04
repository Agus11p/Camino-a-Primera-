import React from 'react';
import { ActivityLog, PlayerProfile } from '../types';
import { AreaChart, Calendar, TrendingUp } from 'lucide-react';

interface StatisticsChartsProps {
  logs: ActivityLog[];
  profile?: PlayerProfile | null;
}

export default function StatisticsCharts({ logs, profile }: StatisticsChartsProps) {
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
  
  // Percentage of clean sheets over total matches (porcentaje)
  const promedioVallasPct = totalPartidos > 0 
    ? Math.round((totalVallasInvictas / totalPartidos) * 100) 
    : 0;

  // 2. Fetch last 5 matches (oldest to newest for rendering chronologically left-to-right)
  const last5Matches = [...matches]
    .sort((a, b) => b.timestamp - a.timestamp) // newest first
    .slice(0, 5)
    .reverse(); // back to chronological order (oldest to newest)

  // Find max value in last 5 matches to scale the CSS chart (max goals or assists in any single game)
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

  // SVG Coordinates calculations
  const width = 500;
  const height = 160;
  const paddingX = 45;
  const paddingY = 25;
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
    // Scale clean sheet visual line to be either full peak (matching maxSingleVal) or base
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
    const baseY = height - paddingY; // bottom base
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const goalsPath = createPath(goalsPoints);
  const assistsPath = createPath(assistsPoints);
  const goalsAreaPath = createAreaPath(goalsPoints);
  const assistsAreaPath = createAreaPath(assistsPoints);

  // Simple date formatter (e.g. "29 May")
  const formatDateLabel = (isoString: string) => {
    try {
      const d = new Date(isoString + 'T12:00:00'); // avoid timezone offset issues
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Historical Summary Box (Side-by-side on mobile) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Goals Per Game card */}
        <div className="glass p-3 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5 sm:mb-1">
              {isArquero ? 'Promedio Atajadas' : 'Promedio Goles'}
            </span>
            <span className="text-xl sm:text-3xl font-black text-white italic">
              {isArquero ? promedioAtajadas : promedioGoles}
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-500 block mt-0.5 sm:mt-1.5 font-light">Por Partido</span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 text-[10px] sm:text-[11px] font-bold uppercase">
            {isArquero ? 'ATA' : 'G/P'}
          </div>
        </div>

        {/* Assists Per Game card */}
        <div className="glass p-3 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5 sm:mb-1">
              {isArquero ? 'Arcos en Cero' : 'Promedio Asistencias'}
            </span>
            <span className="text-xl sm:text-3xl font-black text-white italic">
              {isArquero ? `${promedioVallasPct}%` : promedioAsistencias}
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-500 block mt-0.5 sm:mt-1.5 font-light">
              {isArquero ? 'Partidos Invicto' : 'Por Partido'}
            </span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500/20 text-[10px] sm:text-[11px] font-bold uppercase">
            {isArquero ? 'ARC%' : 'A/P'}
          </div>
        </div>
      </div>

      {/* Dynamic Area / Line Chart with local SVG coordinates */}
      <div className="glass p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AreaChart className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                {isArquero ? 'Progreso de Valla y Atajadas' : 'Rendimiento - Últimos 5 Partidos'}
              </h3>
              <p className="text-xs text-neutral-400">
                Líneas de progresión histórica de tus destrezas.
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-300 font-medium font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              {isArquero ? 'Atajadas' : 'Goles'}
            </span>
            <span className="flex items-center gap-1.5 text-neutral-300 font-medium font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
              {isArquero ? 'Valla Invicta' : 'Asistencias'}
            </span>
          </div>
        </div>

        {last5Matches.length === 0 ? (
          <div className="py-12 text-center bg-white/5 rounded-xl border border-white/10">
            <Calendar className="w-8 h-8 text-neutral-500 mx-auto mb-2 animate-bounce" />
            <p className="text-xs text-neutral-450 font-medium">
              Faltan datos de partidos.
            </p>
            <p className="text-[10px] text-neutral-500 mt-1 max-w-xs mx-auto font-light">
              Registra tu primer "Partido" en el feed del diario para ver el histograma de rendimiento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* SVG Interactive Line / Area chart */}
            <div className="bg-white/[0.03] rounded-xl p-2 sm:p-4 border border-white/10 relative overflow-hidden">
              <svg className="w-full h-auto" viewBox={`0 0 ${width} ${height}`}>
                {/* Horizontal grid guide lines */}
                {[0, 1, 2].map((v) => {
                  const y = paddingY + (v * (height - paddingY * 2)) / 2;
                  return (
                    <line
                      key={v}
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      className="stroke-white/5"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Draw Areas first for overlays */}
                {goalsAreaPath && (
                  <path
                    d={goalsAreaPath}
                    fill="url(#goalsGrad)"
                    className="opacity-25"
                  />
                )}
                {assistsAreaPath && (
                  <path
                    d={assistsAreaPath}
                    fill="url(#assistsGrad)"
                    className="opacity-15"
                  />
                )}

                {/* Reference Grid lines */}
                {last5Matches.map((match, i) => {
                  const divisorX = pointsCount > 1 ? pointsCount - 1 : 1;
                  const x = paddingX + (i / divisorX) * (width - paddingX * 2);
                  return (
                    <g key={match.id}>
                      <line
                        x1={x}
                        y1={paddingY}
                        x2={x}
                        y2={height - paddingY}
                        className="stroke-white/5"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={x}
                        y={height - 5}
                        textAnchor="middle"
                        className="fill-neutral-400 font-mono text-[9px] font-medium"
                      >
                        {formatDateLabel(match.fecha)}
                      </text>
                      <text
                        x={x}
                        y={paddingY - 10}
                        textAnchor="middle"
                        className="fill-neutral-500 font-mono text-[8px] font-bold"
                      >
                        P{i + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Lines */}
                {goalsPath && (
                  <path
                    d={goalsPath}
                    fill="none"
                    stroke="#10b981"
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
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glowAmber)"
                  />
                )}

                {/* SVG Definitions for Gradients and Glow filters */}
                <defs>
                  <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="goalsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="assistsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Draw Interactive circles and label values */}
                {goalsPoints.map((pt, i) => (
                  <g key={`g-dot-${i}`} className="group select-none">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill="#10b981"
                      stroke="#0f0f11"
                      strokeWidth="2.5"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      className="fill-emerald-400 font-extrabold font-mono text-[10px]"
                    >
                      {pt.value}
                    </text>
                  </g>
                ))}

                {assistsPoints.map((pt, i) => (
                  <g key={`a-dot-${i}`} className="group select-none">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill="#f59e0b"
                      stroke="#0f0f11"
                      strokeWidth="2.5"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      className="fill-amber-400 font-extrabold font-mono text-[9px]"
                    >
                      {isArquero ? (pt.value ? 'CERO ✅' : 'GOL ❌') : pt.value}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Quick Summary footnote */}
            <p className="text-[11px] text-neutral-500 italic text-center font-light">
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
