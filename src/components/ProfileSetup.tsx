import React, { useState, useEffect } from 'react';
import { PlayerProfile, PiernaHabil, PosicionTactica, POSICIONES_TACTICAS, HABILIDADES_DISPONIBLES } from '../types';
import { Shield, Sparkles, User, Info, ArrowLeft } from 'lucide-react';

interface ProfileSetupProps {
  initialProfile: PlayerProfile | null;
  onSave: (profile: PlayerProfile) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function ProfileSetup({
  initialProfile,
  onSave,
  onBack,
  showBackButton = false,
}: ProfileSetupProps) {
  const [nombre, setNombre] = useState(initialProfile?.nombre || '');
  const [club, setClub] = useState(initialProfile?.club || '');
  const [edad, setEdad] = useState<number>(initialProfile?.edad || 18);
  const [peso, setPeso] = useState<number>(initialProfile?.peso || 72);
  const [altura, setAltura] = useState<number>(initialProfile?.altura || 178);
  const [piernaHabil, setPiernaHabil] = useState<PiernaHabil>(initialProfile?.piernaHabil || 'Diestro');
  const [posicion, setPosicion] = useState<PosicionTactica>(initialProfile?.posicion || 'Delantero Centro');

  // Positional Category Mapping Setup
  const CATEGORIAS_POSICION: Record<string, PosicionTactica[]> = {
    '🧤 Arquero': ['Arquero'],
    '🛡️ Defensa': ['Central Izquierdo', 'Central Derecho', 'Lateral Izquierdo', 'Lateral Derecho'],
    '⚙️ Volante': ['Mediocampista Defensivo', 'Mediocampista Ofensivo', 'Mediocampista Externo Izquierdo', 'Mediocampista Externo Derecho'],
    '⚡ Ataque': ['Mediapunta', 'Extremo Izquierdo', 'Extremo Derecho', 'Delantero Centro'],
  };

  const getCategoryForPosition = (pos: PosicionTactica): string => {
    if (pos === 'Arquero') return '🧤 Arquero';
    if (['Central Izquierdo', 'Central Derecho', 'Lateral Izquierdo', 'Lateral Derecho'].includes(pos)) return '🛡️ Defensa';
    if (['Mediocampista Defensivo', 'Mediocampista Ofensivo', 'Mediocampista Externo Izquierdo', 'Mediocampista Externo Derecho'].includes(pos)) return '⚙️ Volante';
    return '⚡ Ataque';
  };

  const [activeCategory, setActiveCategory] = useState<string>(() => getCategoryForPosition(initialProfile?.posicion || 'Delantero Centro'));
  
  // Choose between 2 and 5 skills
  const [habilidades, setHabilidades] = useState<string[]>(() => {
    if (initialProfile) {
      if (initialProfile.habilidades && initialProfile.habilidades.length > 0) {
        return initialProfile.habilidades;
      }
      return [initialProfile.habilidad1, initialProfile.habilidad2].filter(Boolean);
    }
    return [];
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Auto calculate IMC
  const [imc, setImc] = useState<number>(0);
  const [imcStatus, setImcStatus] = useState<{ label: string; color: string }>({ label: '', color: '' });

  useEffect(() => {
    if (peso > 0 && altura > 0) {
      const alturaMts = altura / 100;
      const calculatedImc = parseFloat((peso / (alturaMts * alturaMts)).toFixed(1));
      setImc(calculatedImc);

      if (calculatedImc < 18.5) {
        setImcStatus({ label: 'Bajo Peso', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' });
      } else if (calculatedImc >= 18.5 && calculatedImc < 25.0) {
        setImcStatus({ label: 'Peso Ideal', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' });
      } else {
        setImcStatus({ label: 'Sobrepeso / Obesidad', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' });
      }
    } else {
      setImc(0);
      setImcStatus({ label: '-', color: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/30' });
    }
  }, [peso, altura]);

  const handleToggleHabilidad = (skill: string) => {
    if (habilidades.includes(skill)) {
      setHabilidades(habilidades.filter((s) => s !== skill));
    } else {
      if (habilidades.length < 5) {
        setHabilidades([...habilidades, skill]);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!nombre.trim() || !club.trim()) {
      return;
    }

    if (habilidades.length < 2 || habilidades.length > 5) {
      return;
    }

    onSave({
      nombre: nombre.trim(),
      club: club.trim(),
      edad,
      peso,
      altura,
      piernaHabil,
      posicion,
      habilidad1: habilidades[0] || 'Definición',
      habilidad2: habilidades[1] || 'Velocidad',
      habilidades,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Upper bar with back if possible */}
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-sm mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      )}

      <div className="flex items-center gap-3.5 mb-8">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Ficha Oficial del Jugador
          </h1>
          <p className="text-xs text-neutral-400">
            Completa tus especificaciones técnicas para generar tu perfil scout.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Profile Card */}
        <div className="glass p-6 space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-4 h-4" />
            Datos Básicos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Nombre Completo o Apodo <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Agus"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none transition text-sm"
              />
              {hasSubmitted && !nombre.trim() && (
                <p className="text-xs text-rose-500 mt-1">El nombre es obligatorio.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Club Actual u Equipo <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Club Deportivo San Lorenzo"
                required
                value={club}
                onChange={(e) => setClub(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none transition text-sm"
              />
              {hasSubmitted && !club.trim() && (
                <p className="text-xs text-rose-500 mt-1">El club es obligatorio.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Edad
              </label>
              <input
                type="number"
                min="5"
                max="99"
                value={edad}
                onChange={(e) => setEdad(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-center text-white focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 font-sans">
                Peso (kg)
              </label>
              <input
                type="number"
                min="20"
                max="200"
                value={peso}
                onChange={(e) => setPeso(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-center text-white focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Altura (cm)
              </label>
              <input
                type="number"
                min="50"
                max="250"
                value={altura}
                onChange={(e) => setAltura(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-center text-white focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* BMI (IMC) display widget */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm mt-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Cálculo de IMC Automático
                </span>
                <span className="text-xs text-neutral-500">
                  Fórmula matemática basada en tu antropometría actual.
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right">
                <span className="text-xs text-neutral-400 block">Tu IMC:</span>
                <span className="text-lg font-black text-white">{imc > 0 ? imc : '--'}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase ${imcStatus.color}`}>
                {imcStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Attributes Card */}
        <div className="glass p-6 space-y-5">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Atributos de Cancha
          </h2>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Pierna Hábil
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPiernaHabil('Diestro')}
                className={`py-3 px-4 rounded-xl text-sm font-bold uppercase transition border ${
                  piernaHabil === 'Diestro'
                    ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-400 cursor-pointer'
                }`}
              >
                Diestro
              </button>
              <button
                type="button"
                onClick={() => setPiernaHabil('Zurdo')}
                className={`py-3 px-4 rounded-xl text-sm font-bold uppercase transition border ${
                  piernaHabil === 'Zurdo'
                    ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-400 cursor-pointer'
                }`}
              >
                Zurdo
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Posición Táctica Específica <span className="text-emerald-400">*</span>
            </label>
            
            {/* Elegant Segmented Tabs for Categories */}
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 grid grid-cols-4 gap-1 mb-3">
              {Object.keys(CATEGORIAS_POSICION).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`py-2 px-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition text-center truncate cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/15'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.split(' ')[1] || cat}
                </button>
              ))}
            </div>

            {/* Grid of Positions under Selected Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
              {CATEGORIAS_POSICION[activeCategory]?.map((pos) => {
                const isSelected = posicion === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosicion(pos)}
                    className={`py-2.5 px-3 rounded-lg border text-left transition text-xs font-bold flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-emerald-500/50 text-emerald-400 font-extrabold shadow-sm'
                        : 'bg-white/5 border-white/5 hover:border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{pos}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <p className="text-[10px] text-neutral-500 mt-1.5 pl-1 italic">
              * Cambia de categoría arriba para explorar otras posiciones en el campo.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Habilidades a destacar (Selecciona de 2 a 5) <span className="text-emerald-400">*</span>
              </label>
              <span className="text-xs text-emerald-400 font-bold">
                {habilidades.length} / 5
              </span>
            </div>
            <p className="text-xs text-neutral-500 mb-3.5">
              Tus mayores destrezas en el campo de juego.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {HABILIDADES_DISPONIBLES.map((skill) => {
                const isSelected = habilidades.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleHabilidad(skill)}
                    className={`py-2 px-1 rounded-lg border text-center transition overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-neutral-950 font-bold shadow shadow-emerald-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/25 text-neutral-400'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            {hasSubmitted && (habilidades.length < 2 || habilidades.length > 5) && (
              <p className="text-xs text-rose-500 mt-2">
                Debes elegir entre <strong className="font-bold">dos (2)</strong> y <strong className="font-bold">cinco (5)</strong> habilidades destacadas para continuar.
              </p>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-neutral-950 font-black py-4 px-6 rounded-xl transition duration-200 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer text-base uppercase"
        >
          {initialProfile ? 'Guardar Cambios' : 'Guardar Ficha de Jugador'}
        </button>
      </form>
    </div>
  );
}
