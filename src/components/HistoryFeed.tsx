import React, { useState } from 'react';
import { ActivityLog, PlayerProfile } from '../types';
import { 
  Award, 
  Trash2, 
  Edit3, 
  Calendar, 
  Search, 
  SlidersHorizontal,
  FolderOpen,
  Heart,
  Activity
} from 'lucide-react';

interface HistoryFeedProps {
  logs: ActivityLog[];
  onEdit: (log: ActivityLog) => void;
  onDelete: (id: string) => void;
  profile?: PlayerProfile | null;
}

export default function HistoryFeed({
  logs,
  onEdit,
  onDelete,
  profile,
}: HistoryFeedProps) {
  // Filter state
  const [filter, setFilter] = useState<'Todos' | 'Partidos' | 'Entrenamientos'>('Todos');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const isArquero = profile?.posicion === 'Arquero';

  // Format YYYY-MM-DD cleanly, eg "Sábado, 28 de Mayo"
  const formatDateSpanish = (isoString: string) => {
    try {
      const d = new Date(isoString + 'T12:00:00'); // mitigate timezone shift
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
    } catch {
      return isoString;
    }
  };

  // Sort logs by date string (newest first)
  const sortedLogs = [...logs].sort((a, b) => {
    // Sort by fecha descending, secondary timestamp descending
    if (a.fecha !== b.fecha) {
      return b.fecha.localeCompare(a.fecha);
    }
    return b.timestamp - a.timestamp;
  });

  // Apply filters
  const filteredLogs = sortedLogs.filter((log) => {
    if (filter === 'Partidos') return log.tipo === 'Partido';
    if (filter === 'Entrenamientos') return log.tipo === 'Entrenamiento';
    return true; // "Todos"
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Upper Filter Tabs */}
      <div className="space-y-3.5">
        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          Filtros del Historial
        </label>
              {/* Segmented slider bar */}
        <div className="bg-white/5 p-1 rounded-xl border border-white/10 grid grid-cols-3 gap-1">
          <button
            onClick={() => setFilter('Todos')}
            className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition ${
              filter === 'Todos'
                ? 'bg-white/10 text-white font-extrabold border border-white/10 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('Partidos')}
            className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition ${
              filter === 'Partidos'
                ? 'bg-white/10 text-white font-extrabold border border-white/10 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Partidos
          </button>
          <button
            onClick={() => setFilter('Entrenamientos')}
            className={`py-2 px-3 rounded-lg text-xs font-bold uppercase transition ${
              filter === 'Entrenamientos'
                ? 'bg-white/10 text-white font-extrabold border border-white/10 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Entrenos
          </button>
        </div>
      </div>

      {/* Feed list */}
      <div className="space-y-3.5">
        {filteredLogs.length === 0 ? (
          <div className="glass p-8 text-center">
            <FolderOpen className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
            <p className="text-xs text-neutral-400 font-medium">
              No se encontraron registros de este tipo.
            </p>
            <p className="text-[11px] text-neutral-500 mt-1 font-light">
              Registra una jornada utilizando el botón para comenzar a recopilar tu historial.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isMatch = log.tipo === 'Partido';
            
            return (
              <div
                key={log.id}
                className="glass glass-interactive p-4.5 relative overflow-hidden group"
              >
                {/* Thin side status layout highlight */}
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isMatch ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'
                }`} />

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0 pl-1.5">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isMatch
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/5 text-neutral-400 border border-white/15'
                      }`}>
                        {isMatch ? 'Partido' : 'Entrenamiento'}
                      </span>
                      
                      <span className="text-[11px] font-bold text-neutral-500 flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {formatDateSpanish(log.fecha)}
                      </span>
                    </div>

                    {/* Stats details: only relevant if isMatch */}
                    {isMatch && (
                      isArquero ? (
                        <div className="flex items-center gap-4 py-1.5">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 text-center min-w-[75px]">
                            <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">
                              👐 Atajadas
                            </span>
                            <span className="text-sm font-black text-white italic">
                              {log.atajadas || 0}
                            </span>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-center min-w-[100px]">
                            <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">
                              🛡️ Arco en Cero
                            </span>
                            <span className={`text-xs font-black uppercase ${log.vallaInvicta ? 'text-emerald-400' : 'text-neutral-500'}`}>
                              {log.vallaInvicta ? 'Sí ✅' : 'No ❌'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 py-1.5">
                          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-center">
                            <span className="block text-[8px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">
                              Goles
                            </span>
                            <span className="text-sm font-black text-white italic">
                              {log.goles}
                            </span>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-center">
                            <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">
                              Asistencias
                            </span>
                            <span className="text-sm font-black text-amber-500 italic">
                              {log.asistencias}
                            </span>
                          </div>
                        </div>
                      )
                    )}

                    {/* Smartwatch Metrics HUD inside log item */}
                    {(log.smartwatchBpm || log.smartwatchKm) && (
                      <div className="flex flex-wrap items-center gap-2 py-1 flex-row">
                        <span className="text-[8px] font-mono font-black uppercase text-amber-500 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Xiaomi Sync
                        </span>
                        
                        {log.smartwatchBpm && (
                          <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1 bg-white/[0.02] border border-white/5 py-0.5 px-2 rounded-md">
                            <Heart className="w-3 h-3 text-rose-500 fill-rose-500/10" />
                            <b className="text-white font-extrabold">{log.smartwatchBpm}</b> BPM Prom.
                          </span>
                        )}

                        {log.smartwatchKm && (
                          <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1 bg-white/[0.02] border border-white/5 py-0.5 px-2 rounded-md">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <b className="text-white font-extrabold">{log.smartwatchKm}</b> KM
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reflection body */}
                    {log.reflexion ? (
                      <p className="text-xs text-neutral-300 font-sans leading-relaxed bg-white/5 border border-white/5 rounded-lg p-3 italic font-light">
                        "{log.reflexion}"
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500 italic pl-1 font-light">
                        Sin reflexiones del día anotadas.
                      </p>
                    )}
                  </div>

                  {/* Actions buttons panel */}
                  <div className="flex flex-col gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEdit(log)}
                      className="p-2 text-neutral-400 hover:text-emerald-400 hover:bg-white/10 rounded-lg border border-transparent hover:border-white/10 transition cursor-pointer"
                      title="Editar registro"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    
                    {confirmDeleteId === log.id ? (
                      <div className="flex flex-col items-center gap-1 bg-rose-950/40 p-1.5 rounded-lg border border-rose-500/30 text-center animate-pulse">
                        <span className="text-[8px] font-black text-rose-400 uppercase tracking-wider block">¿Borrar?</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDelete(log.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-1.5 py-0.5 rounded bg-rose-500 text-neutral-950 text-[9px] font-black uppercase tracking-wider hover:bg-rose-400 cursor-pointer"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[9px] font-black uppercase tracking-wider hover:bg-white/20 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(log.id)}
                        className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-white/10 rounded-lg border border-transparent hover:border-white/10 transition cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
