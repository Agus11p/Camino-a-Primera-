import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlayerProfile, PiernaHabil, PosicionTactica, POSICIONES_TACTICAS, HABILIDADES_DISPONIBLES } from '../types';
import { Shield, Sparkles, User, Info, ArrowLeft, AlertCircle } from 'lucide-react';

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
  // Let the states start blank if initialProfile doesn't exist, for ultra-comfortable blank filing
  const [nombre, setNombre] = useState(initialProfile?.nombre || '');
  const [club, setClub] = useState(initialProfile?.club || '');
  const [edad, setEdad] = useState<number | ''>(
    initialProfile?.edad !== undefined ? initialProfile.edad : ''
  );
  const [peso, setPeso] = useState<number | ''>(
    initialProfile?.peso !== undefined ? initialProfile.peso : ''
  );
  const [altura, setAltura] = useState<number | ''>(
    initialProfile?.altura !== undefined ? initialProfile.altura : ''
  );
  const [piernaHabil, setPiernaHabil] = useState<PiernaHabil>(initialProfile?.piernaHabil || 'Diestro');
  const [posicion, setPosicion] = useState<PosicionTactica>(initialProfile?.posicion || 'Delantero Centro');

  // Tracking errors custom react side for premium visual branding feedback
  const [errors, setErrors] = useState<{
    nombre?: string;
    club?: string;
    edad?: string;
    peso?: string;
    altura?: string;
    habilidades?: string;
  }>({});

  const [hasSubmitted, setHasSubmitted] = useState(false);

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

  // Auto calculate IMC with type safety
  const [imc, setImc] = useState<number>(0);
  const [imcStatus, setImcStatus] = useState<{ label: string; color: string }>({ label: '', color: '' });

  useEffect(() => {
    const pesoNum = Number(peso);
    const alturaNum = Number(altura);

    if (pesoNum > 0 && alturaNum > 0) {
      const alturaMts = alturaNum / 100;
      const calculatedImc = parseFloat((pesoNum / (alturaMts * alturaMts)).toFixed(1));
      setImc(calculatedImc);

      if (calculatedImc < 18.5) {
        setImcStatus({ label: 'Bajo Peso', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30 font-bold' });
      } else if (calculatedImc >= 18.5 && calculatedImc < 25.0) {
        setImcStatus({ label: 'Peso Ideal', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 font-bold' });
      } else {
        setImcStatus({ label: 'Sobrepeso / Obesidad', color: 'text-rose-450 bg-rose-500/10 border-rose-500/20 font-bold' });
      }
    } else {
      setImc(0);
      setImcStatus({ label: '-', color: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/30' });
    }
  }, [peso, altura]);

  const handleToggleHabilidad = (skill: string) => {
    let nextSkills: string[] = [];
    if (habilidades.includes(skill)) {
      nextSkills = habilidades.filter((s) => s !== skill);
    } else {
      if (habilidades.length < 5) {
        nextSkills = [...habilidades, skill];
      } else {
        nextSkills = habilidades;
      }
    }
    setHabilidades(nextSkills);
    
    // Clear dynamic sub-errors on the fly
    if (errors.habilidades && nextSkills.length >= 2 && nextSkills.length <= 5) {
      setErrors(prev => ({ ...prev, habilidades: undefined }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    const newErrors: typeof errors = {};

    // Validate inputs
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre o apodo es obligatorio para tu registro oficial.';
    }

    if (!club.trim()) {
      newErrors.club = 'El club o equipo actual es obligatorio.';
    }

    if (edad === '') {
      newErrors.edad = 'La edad es obligatoria.';
    } else if (edad < 5 || edad > 99) {
      newErrors.edad = 'Debe tener entre 5 y 99 años de edad.';
    }

    if (peso === '') {
      newErrors.peso = 'El peso es obligatorio.';
    } else if (peso < 20 || peso > 250) {
      newErrors.peso = 'Debe tener entre 20 y 250 kg.';
    }

    if (altura === '') {
      newErrors.altura = 'La altura es obligatoria.';
    } else if (altura < 50 || altura > 250) {
      newErrors.altura = 'Debe tener entre 50 y 250 cm.';
    }

    if (habilidades.length < 2 || habilidades.length > 5) {
      newErrors.habilidades = 'Por favor, selecciona entre 2 y 5 destrezas o habilidades destacadas.';
    }

    setErrors(newErrors);

    // If errors exist, block saving, scroll to the first element with error for convenience
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorEl = document.querySelector('.error-indicator-target');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    // Since validation matches constraints, values are safely converted to numbers
    onSave({
      nombre: nombre.trim(),
      club: club.trim(),
      edad: Number(edad),
      peso: Number(peso),
      altura: Number(altura),
      piernaHabil,
      posicion,
      habilidad1: habilidades[0] || 'Definición',
      habilidad2: habilidades[1] || 'Velocidad',
      habilidades,
    });
  };

  const formSectionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.08 }}
      className="w-full max-w-2xl mx-auto px-4 py-8"
    >
      {/* Upper bar with back if possible */}
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white text-sm mb-6 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel
        </button>
      )}

      {/* Header Info */}
      <motion.div 
        variants={formSectionVariants}
        className="flex items-center gap-3.5 mb-8"
      >
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Ficha Oficial del Jugador
          </h1>
          <p className="text-xs text-neutral-400">
            Completa tus especificaciones técnicas para generar tu perfil scout. Puedes dejar campos en blanco para rellenar cómodamente, pero deberás completarlos antes de continuar.
          </p>
        </div>
      </motion.div>

      {/* Global alert box when errors are found */}
      {hasSubmitted && Object.keys(errors).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-sm error-indicator-target text-left"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="font-extrabold text-rose-400 uppercase tracking-wider text-xs">Faltan Datos Obligatorios</h4>
            <p className="text-[11px] text-neutral-300 mt-1 font-light leading-relaxed">
              Completa los campos marcados en rojo con tu información técnica real para guardar la ficha de jugador con éxito.
            </p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-6" noValidate>
        {/* Core Profile Card */}
        <motion.div 
          variants={formSectionVariants}
          className="glass p-6 space-y-5"
        >
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Datos Básicos del Jugador
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                Nombre Completo o Apodo <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Agus11"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errors.nombre) {
                    setErrors(prev => ({ ...prev, nombre: undefined }));
                  }
                }}
                className={`w-full bg-white/5 border focus:outline-none rounded-xl px-4 py-3 text-white placeholder-neutral-600 transition-all text-sm font-semibold ${
                  hasSubmitted && errors.nombre
                    ? 'border-rose-500 bg-rose-500/5 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/25'
                    : 'border-white/10 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/10'
                }`}
              />
              {hasSubmitted && errors.nombre && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1.5 font-medium pl-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Club input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                Club Actual u Equipo <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. San Lorenzo de Almagro"
                value={club}
                onChange={(e) => {
                  setClub(e.target.value);
                  if (errors.club) {
                    setErrors(prev => ({ ...prev, club: undefined }));
                  }
                }}
                className={`w-full bg-white/5 border focus:outline-none rounded-xl px-4 py-3 text-white placeholder-neutral-600 transition-all text-sm font-semibold ${
                  hasSubmitted && errors.club
                    ? 'border-rose-500 bg-rose-500/5 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/25'
                    : 'border-white/10 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/10'
                }`}
              />
              {hasSubmitted && errors.club && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1.5 font-medium pl-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  {errors.club}
                </p>
              )}
            </div>
          </div>

          {/* Anthropometric inputs (Edad, Peso, Altura) */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* Edad input */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 text-center">
                Edad <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="number"
                placeholder="Ej. 18"
                value={edad}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setEdad('');
                  } else {
                    const parsed = parseInt(val);
                    setEdad(isNaN(parsed) ? '' : parsed);
                  }
                  if (errors.edad) {
                    setErrors(prev => ({ ...prev, edad: undefined }));
                  }
                }}
                className={`w-full bg-white/5 border focus:outline-none rounded-xl py-3 text-center text-white placeholder-neutral-600 transition-all text-sm font-bold ${
                  hasSubmitted && errors.edad
                    ? 'border-rose-500 bg-rose-500/5 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/25'
                    : 'border-white/10 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/10'
                }`}
              />
            </div>

            {/* Peso input */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 text-center">
                Peso (kg) <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="number"
                placeholder="Ej. 72"
                value={peso}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setPeso('');
                  } else {
                    const parsed = parseInt(val);
                    setPeso(isNaN(parsed) ? '' : parsed);
                  }
                  if (errors.peso) {
                    setErrors(prev => ({ ...prev, peso: undefined }));
                  }
                }}
                className={`w-full bg-white/5 border focus:outline-none rounded-xl py-3 text-center text-white placeholder-neutral-600 transition-all text-sm font-bold ${
                  hasSubmitted && errors.peso
                    ? 'border-rose-500 bg-rose-500/5 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/25'
                    : 'border-white/10 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/10'
                }`}
              />
            </div>

            {/* Altura input */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 text-center">
                Altura (cm) <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="number"
                placeholder="Ej. 178"
                value={altura}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setAltura('');
                  } else {
                    const parsed = parseInt(val);
                    setAltura(isNaN(parsed) ? '' : parsed);
                  }
                  if (errors.altura) {
                    setErrors(prev => ({ ...prev, altura: undefined }));
                  }
                }}
                className={`w-full bg-white/5 border focus:outline-none rounded-xl py-3 text-center text-white placeholder-neutral-600 transition-all text-sm font-bold ${
                  hasSubmitted && errors.altura
                    ? 'border-rose-500 bg-rose-500/5 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/25'
                    : 'border-white/10 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 focus:bg-white/10'
                }`}
              />
            </div>
          </div>

          {/* Sub-errors inside the anthropometrics block */}
          {hasSubmitted && (errors.edad || errors.peso || errors.altura) && (
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 flex flex-col gap-1.5 text-left text-[11px] pl-4">
              {errors.edad && (
                <p className="text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <strong>Edad:</strong> {errors.edad}
                </p>
              )}
              {errors.peso && (
                <p className="text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <strong>Peso:</strong> {errors.peso}
                </p>
              )}
              {errors.altura && (
                <p className="text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <strong>Altura:</strong> {errors.altura}
                </p>
              )}
            </div>
          )}

          {/* BMI (IMC) display widget */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm mt-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Cálculo de IMC Automático
                </span>
                <span className="text-[10px] text-neutral-500 leading-normal">
                  Cargado automáticamente en tiempo real basándose en tu peso y estatura.
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">Tu IMC:</span>
                <span className="text-lg font-black text-white">{imc > 0 ? imc : '--'}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg border text-[10px] tracking-wider uppercase ${imcStatus.color}`}>
                {imcStatus.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Technical Attributes Card */}
        <motion.div 
          variants={formSectionVariants}
          className="glass p-6 space-y-5"
        >
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            Atributos de Campo del Jugador
          </h2>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 text-left">
              Pierna Hábil de Cancha
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setPiernaHabil('Diestro')}
                className={`py-3 px-4 rounded-xl text-sm font-bold uppercase transition border ${
                  piernaHabil === 'Diestro'
                    ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10 font-black'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-450 cursor-pointer'
                }`}
              >
                Diestro
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setPiernaHabil('Zurdo')}
                className={`py-3 px-4 rounded-xl text-sm font-bold uppercase transition border ${
                  piernaHabil === 'Zurdo'
                    ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10 font-black'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-450 cursor-pointer'
                }`}
              >
                Zurdo
              </motion.button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 text-left flex items-center gap-1">
              Posición Táctica Específica <span className="text-emerald-400 font-mono">*</span>
            </label>
            
            {/* Elegant Segmented Tabs for Categories */}
            <div className="bg-white/5 p-1 rounded-xl border border-white/10 grid grid-cols-4 gap-1 mb-3">
              {Object.keys(CATEGORIAS_POSICION).map((cat) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                </motion.button>
              ))}
            </div>

            {/* Grid of Positions under Selected Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
              {CATEGORIAS_POSICION[activeCategory]?.map((pos) => {
                const isSelected = posicion === pos;
                return (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
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
                  </motion.button>
                );
              })}
            </div>
            
            <p className="text-[10px] text-neutral-500 mt-1.5 pl-1 italic text-left">
              * Cambia de categoría arriba para explorar otras posiciones en el campo.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider text-left flex items-center gap-1">
                Habilidades destacables <span className="text-emerald-400 font-bold">*</span>
              </label>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                habilidades.length < 2 || habilidades.length > 5
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              }`}>
                {habilidades.length} / 5 Seleccionadas (Mín. 2)
              </span>
            </div>
            <p className="text-left text-xs text-neutral-500 mb-3.5">
              Escoge las mayores destrezas que posees para tus tácticas en el campo de juego.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {HABILIDADES_DISPONIBLES.map((skill) => {
                const isSelected = habilidades.includes(skill);
                return (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={skill}
                    type="button"
                    onClick={() => handleToggleHabilidad(skill)}
                    className={`py-2 px-1 rounded-lg border text-center transition overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-neutral-950 font-black shadow shadow-emerald-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/25 text-neutral-450'
                    }`}
                  >
                    {skill}
                  </motion.button>
                );
              })}
            </div>

            {hasSubmitted && errors.habilidades && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl mt-3 font-medium text-left">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                {errors.habilidades}
              </p>
            )}
          </div>
        </motion.div>

        {/* Save button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-neutral-950 font-black py-4 px-6 rounded-xl transition duration-200 shadow-xl shadow-emerald-500/15 flex items-center justify-center gap-2 cursor-pointer text-base uppercase tracking-wider"
        >
          {initialProfile ? 'Guardar Cambios Oficiales' : 'Guardar y Continuar'}
        </motion.button>
      </form>
    </motion.div>
  );
}
