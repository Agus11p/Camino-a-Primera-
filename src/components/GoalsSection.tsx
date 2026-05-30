import React, { useState } from 'react';
import { DynamicGoal, ActivityLog, BadgeCount } from '../types';
import { calculateBadges } from '../utils/badgeHelper';
import { triggerConfetti } from '../utils/confetti';
import { 
  Trophy, 
  Trash2, 
  Plus, 
  Check, 
  Target, 
  Award, 
  Bookmark, 
  Sparkles 
} from 'lucide-react';

interface GoalsSectionProps {
  goals: DynamicGoal[];
  logs: ActivityLog[];
  onAddGoal: (texto: string, plazo: 'Corto' | 'Mediano' | 'Largo') => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
}

export default function GoalsSection({
  goals,
  logs,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
}: GoalsSectionProps) {
  const [newGoalText, setNewGoalText] = useState('');
  const [selectedPlazo, setSelectedPlazo] = useState<'Corto' | 'Mediano' | 'Largo'>('Corto');

  // Load all current badges
  const unlockedBadges = calculateBadges(logs);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    onAddGoal(newGoalText.trim(), selectedPlazo);
    setNewGoalText('');
  };

  const handleCompleteGoal = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      // Complete action -> launch confetti
      triggerConfetti();
    }
    onToggleGoal(id);
  };

  // Group goals by plazo
  const getGoalsByPlazo = (plazo: 'Corto' | 'Mediano' | 'Largo') => {
    return goals.filter((g) => g.plazo === plazo);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* 1. Medallero Oficial: Premium Golden Badges */}
      <div className="glass p-6 shadow-xl relative overflow-hidden emerald-glow animate-fade-in">
        {/* Glow detail */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/25">
            <Trophy className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Medallero de Honor
            </h2>
            <p className="text-xs text-neutral-400 font-light">
              Insignias ganarbles por tu rendimiento demostrado en el campo de juego.
            </p>
          </div>
        </div>

        {unlockedBadges.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-6 text-center border border-white/5">
            <Award className="w-10 h-10 text-neutral-500 mx-auto mb-2 animate-bounce" style={{ animationDuration: '6s' }} />
            <p className="text-xs text-neutral-400 font-medium">
              Aún no tienes insignias desbloqueadas.
            </p>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-xs mx-auto font-light">
              Se calculan automáticamente escaneando tus partidos registrados. ¡Consigue 3 goles para tu primer Hat-trick!
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.name}
                className="inline-flex items-center gap-2 medal-gold rounded-full px-4 py-2 shadow-lg transition-transform hover:-translate-y-0.5 relative group"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-black tracking-tight uppercase">
                  {badge.count > 1 ? `${badge.count} ` : ''}{badge.name}{badge.count > 1 ? 's' : ''}
                </span>

                {/* Micro tooltip explaining description */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#05070a] text-neutral-300 text-[10px] py-1 px-2.5 rounded border border-white/10 shadow-xl whitespace-nowrap z-30">
                  {badge.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Form to Add Dynamic Goals */}
      <div className="glass p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Target className="w-4.5 h-4.5 text-emerald-400" />
          Nuevo Objetivo en Campaña
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="Ej. Practicar tiro libre con pierna inhábil..."
              className="flex-1 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-neutral-600 font-sans focus:outline-none text-sm transition"
            />
            
            <div className="flex items-center gap-2">
              <select
                value={selectedPlazo}
                onChange={(e) => setSelectedPlazo(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 cursor-pointer uppercase tracking-wider"
              >
                <option value="Corto" className="bg-neutral-900">Corto Plazo</option>
                <option value="Mediano" className="bg-neutral-900">Medio Plazo</option>
                <option value="Largo" className="bg-neutral-900">Largo Plazo</option>
              </select>

              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 w-12 h-12 rounded-xl flex items-center justify-center font-bold tracking-tight shrink-0 transition cursor-pointer"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. Three Columns columns/lists: Corto, Mediano, Largo Plazo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['Corto', 'Mediano', 'Largo'] as const).map((plazo) => {
          const plazoGoals = getGoalsByPlazo(plazo);
          return (
            <div key={plazo} className="glass p-5 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Plazo {plazo === 'Corto' ? 'Corto' : plazo === 'Mediano' ? 'Mediado' : 'Largo'}
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 uppercase tracking-widest">
                  {plazoGoals.length} meta{plazoGoals.length === 1 ? '' : 's'}
                </span>
              </div>

              {plazoGoals.length === 0 ? (
                <p className="text-xs text-neutral-500 py-6 text-center italic font-light flex-1 flex items-center justify-center">
                  Sin objetivos creados.
                </p>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {plazoGoals.map((g) => (
                    <div
                      key={g.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition duration-150 ${
                        g.completado
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                        <button
                          type="button"
                          onClick={() => handleCompleteGoal(g.id, g.completado)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                            g.completado
                              ? 'bg-emerald-500 border-emerald-500 text-neutral-950 font-bold'
                              : 'border-white/20 hover:border-emerald-500/60'
                          }`}
                        >
                          {g.completado && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        
                        <span className={`text-xs break-words font-medium ${g.completado ? 'line-through text-neutral-500' : ''}`}>
                          {g.texto}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteGoal(g.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition shrink-0 cursor-pointer"
                        title="Borrar objetivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
