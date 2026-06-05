import React, { useState, useEffect } from 'react';
import { ActivityLog, PlayerProfile } from '../types';
import { X, Calendar, MessageSquare, Award, Play, Heart, Activity } from 'lucide-react';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string }) => void;
  editLog: ActivityLog | null; // null if creating a new entry
  profile?: PlayerProfile | null;
}

export default function DailyLogModal({
  isOpen,
  onClose,
  onSave,
  editLog,
  profile,
}: DailyLogModalProps) {
  const [tipo, setTipo] = useState<'Entrenamiento' | 'Partido'>('Partido');
  const [fecha, setFecha] = useState('');
  const [goles, setGoles] = useState(0);
  const [asistencias, setAsistencias] = useState(0);
  const [atajadas, setAtajadas] = useState(0);
  const [vallaInvicta, setVallaInvicta] = useState(false);
  const [reflexion, setReflexion] = useState('');
  const [smartwatchBpm, setSmartwatchBpm] = useState<string>('');
  const [smartwatchKm, setSmartwatchKm] = useState<string>('');

  const isArquero = profile?.posicion === 'Arquero';

  // Preload values if in edit mode, or default to current date when creating
  useEffect(() => {
    if (isOpen) {
      if (editLog) {
        setTipo(editLog.tipo);
        setFecha(editLog.fecha);
        setGoles(editLog.goles);
        setAsistencias(editLog.asistencias);
        setAtajadas(editLog.atajadas || 0);
        setVallaInvicta(!!editLog.vallaInvicta);
        setReflexion(editLog.reflexion);
        setSmartwatchBpm(editLog.smartwatchBpm ? String(editLog.smartwatchBpm) : '');
        setSmartwatchKm(editLog.smartwatchKm ? String(editLog.smartwatchKm) : '');
      } else {
        setTipo('Partido');
        // Default to local date string in YYYY-MM-DD
        const todayStr = new Date().toISOString().split('T')[0];
        setFecha(todayStr);
        setGoles(0);
        setAsistencias(0);
        setAtajadas(0);
        setVallaInvicta(false);
        setReflexion('');
        setSmartwatchBpm('');
        setSmartwatchKm('');
      }
    }
  }, [isOpen, editLog]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha) return;

    onSave({
      id: editLog?.id, // include ID if editing
      tipo,
      fecha,
      goles: tipo === 'Partido' ? goles : 0,
      asistencias: tipo === 'Partido' ? asistencias : 0,
      atajadas: (tipo === 'Partido' && isArquero) ? atajadas : 0,
      vallaInvicta: (tipo === 'Partido' && isArquero) ? vallaInvicta : false,
      reflexion: reflexion.trim(),
      smartwatchBpm: smartwatchBpm ? Number(smartwatchBpm) : undefined,
      smartwatchKm: smartwatchKm ? Number(smartwatchKm) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-lg glass shadow-2xl overflow-hidden self-end sm:self-auto relative max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="px-5 py-4.5 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">
              {editLog ? 'Editar Registro Diario' : 'Registrar Jornada'}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {editLog ? 'Modifica los datos cargados anteriormente.' : 'Elige el tipo de sesión y anota tu desempeño deportivo.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 text-neutral-400 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Form body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* 1. Toggle Selection: Entrenamiento vs Partido */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
              Tipo de Actividad
            </label>
            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTipo('Partido')}
                className={`py-3 px-4 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipo === 'Partido'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md font-black'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Award className="w-4 h-4" />
                Partido Oficial
              </button>
              <button
                type="button"
                onClick={() => setTipo('Entrenamiento')}
                className={`py-3 px-4 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipo === 'Entrenamiento'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md font-black'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Play className="w-4 h-4 rotate-0" />
                Entrenamiento
              </button>
            </div>
          </div>

          {/* 2. Date Input (Real Date Selector) */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Fecha de la Actividad
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none text-sm transition cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Stats section: Only shown if PARTIDO is toggled */}
          {tipo === 'Partido' && (
            isArquero ? (
              <div className="grid grid-cols-2 gap-4 bg-emerald-500/5 p-4 border border-emerald-500/20 rounded-xl">
                {/* Goalkeeper Saves (Atajadas Clave) */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                    👐 Atajadas Clave
                  </span>
                  
                  <div className="flex items-center justify-between bg-white/5 rounded-lg border border-white/10 p-2 max-w-[150px] mx-auto">
                    <button
                      type="button"
                      onClick={() => setAtajadas(Math.max(0, atajadas - 1))}
                      className="w-8 h-8 rounded bg-white/10 border border-white/15 text-white hover:border-white/35 transition font-black text-center text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-black text-white w-6 text-center">{atajadas}</span>
                    <button
                      type="button"
                      onClick={() => setAtajadas(atajadas + 1)}
                      className="w-8 h-8 rounded bg-white/10 border border-white/15 text-white hover:border-white/35 transition font-black text-center text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Goalkeeper Clean Sheet (Valla Invicta) Toggle button */}
                <div className="space-y-1.5 flex flex-col justify-between">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    🛡️ Arco en Cero
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => setVallaInvicta(!vallaInvicta)}
                    className={`py-2 px-3 border rounded-lg transition-all text-[11px] font-black uppercase text-center w-full max-w-[150px] mx-auto cursor-pointer ${
                      vallaInvicta 
                        ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/10'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-350'
                    }`}
                  >
                    {vallaInvicta ? '🏆 Valla Invicta' : 'Recibió Goles'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 border border-white/10 rounded-xl">
                {/* Goals counter */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Goles Marcados
                  </span>
                  
                  <div className="flex items-center justify-between bg-white/5 rounded-lg border border-white/10 p-2 max-w-[150px] mx-auto">
                    <button
                      type="button"
                      onClick={() => setGoles(Math.max(0, goles - 1))}
                      className="w-8 h-8 rounded bg-white/15 border border-white/10 text-white hover:border-white/35 transition font-black text-center text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-white w-6 text-center">{goles}</span>
                    <button
                      type="button"
                      onClick={() => setGoles(goles + 1)}
                      className="w-8 h-8 rounded bg-white/15 border border-white/10 text-white hover:border-white/35 transition font-black text-center text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Assists counter */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Asistencias Dadas
                  </span>
                  
                  <div className="flex items-center justify-between bg-white/5 rounded-lg border border-white/10 p-2 max-w-[150px] mx-auto">
                    <button
                      type="button"
                      onClick={() => setAsistencias(Math.max(0, asistencias - 1))}
                      className="w-8 h-8 rounded bg-white/15 border border-white/10 text-white hover:border-white/35 transition font-black text-center text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-white w-6 text-center">{asistencias}</span>
                    <button
                      type="button"
                      onClick={() => setAsistencias(asistencias + 1)}
                      className="w-8 h-8 rounded bg-white/15 border border-white/10 text-white hover:border-white/35 transition font-black text-center text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* 4. Reflection field */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              ¿Cómo te sentiste hoy? (Opcional)
            </span>
            <p className="text-[10px] text-neutral-500">
              Anota tus reflexiones críticas del juego, molestias físicas o puntos a entrenar.
            </p>
            <textarea
              value={reflexion}
              onChange={(e) => setReflexion(e.target.value)}
              placeholder={tipo === 'Partido' ? 'Ej. Me sentí rápido en la contra. Defectos al definir.' : 'Ej. Reforcé pases cruzados y definición con la derecha.'}
              rows={3}
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl p-3.5 text-white placeholder-neutral-600 focus:outline-none text-sm transition font-sans resize-none"
            />
          </div>

          {/* Submission and Control buttons */}
          <div className="pt-2 grid grid-cols-2 gap-3 pb-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-xs font-bold uppercase border border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-3 px-4 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition shadow-lg shadow-emerald-500/10 cursor-pointer uppercase"
            >
              {editLog ? 'Guardar Cambios' : 'Registrar Día'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
