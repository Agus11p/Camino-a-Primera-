import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Trash2, 
  Globe, 
  Info, 
  ShieldAlert, 
  Layers, 
  Check, 
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { PlayerProfile } from '../types';

interface SettingsSectionProps {
  profile: PlayerProfile;
  onEditProfile: () => void;
  onResetApp: () => void;
}

export default function SettingsSection({
  profile,
  onEditProfile,
  onResetApp
}: SettingsSectionProps) {
  const [lang, setLang] = useState<'ES' | 'EN' | 'PT'>('ES');
  const [measurementUnit, setMeasurementUnit] = useState<'Métrico' | 'Imperial'>('Métrico');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 pb-24 text-left"
    >
      {/* Title Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-tight">
            Configuración del Míster
          </h2>
          <p className="text-[10px] text-neutral-440 font-mono">
            Gestione las preferencias de su perfil deportivo y controle los datos de juego.
          </p>
        </div>
      </motion.div>

      {/* 1. Language Box Selector */}
      <motion.div variants={itemVariants} className="glass p-4.5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            Idioma del Sistema
          </h3>
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed font-light">
          Seleccione el idioma en el que el Míster táctico generará los consejos y los reportes de rendimiento.
        </p>
        
        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['ES', 'EN', 'PT'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`py-2 px-3 rounded-lg border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                lang === l 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-black shadow-md'
                  : 'bg-white/[0.01] border-white/5 text-neutral-400 hover:text-white hover:border-white/10'
              }`}
            >
              {lang === l && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              {l === 'ES' ? 'Español' : l === 'EN' ? 'English' : 'Português'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 2. Preferences & Units */}
      <motion.div variants={itemVariants} className="glass p-4.5 space-y-3.5 shadow-xl">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            Unidades de Medida
          </h3>
        </div>
        
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
          <div className="text-left">
            <span className="block text-xs font-bold text-white">Metraje & Peso</span>
            <span className="text-[9px] text-neutral-500 font-mono">Unidades métricas (cm/kg) o imperiales (ft/lbs)</span>
          </div>
          <div className="flex gap-1 bg-black p-0.5 rounded-lg border border-white/5">
            {(['Métrico', 'Imperial'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setMeasurementUnit(unit)}
                className={`py-1 px-3 text-[9px] font-black uppercase tracking-wider rounded transition cursor-pointer ${
                  measurementUnit === unit
                    ? 'bg-emerald-500 text-neutral-950 font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="text-left">
            <span className="block text-xs font-bold text-white">Efectos de Sonido</span>
            <span className="text-[9px] text-neutral-500 font-mono">Reproducir sutiles ruidos tácticos al registrar</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 rounded-full transition-all border p-0.5 flex relative items-center cursor-pointer ${
              soundEnabled ? 'bg-emerald-500/20 border-emerald-500/50 justify-end' : 'bg-white/5 border-white/10 justify-start'
            }`}
          >
            <motion.div 
              layout 
              className={`w-4.5 h-4.5 rounded-full ${soundEnabled ? 'bg-emerald-400' : 'bg-neutral-500'}`} 
            />
          </button>
        </div>
      </motion.div>

      {/* 3. Update Ficha Box */}
      <motion.div variants={itemVariants} className="glass p-4.5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Ajustes de Perfil Deportivo
            </h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="text-left flex-1">
            <div className="text-xs font-bold text-neutral-200">
              Ficha Médica y Posicionamiento
            </div>
            <p className="text-[10px] text-neutral-440 font-light leading-relaxed mt-1">
              Modifique su peso corporal, demarcación preferida (<span className="text-emerald-450 font-semibold">{profile.posicion}</span>) o habilidades de banda registradas de forma inmediata.
            </p>
          </div>
          
          <button
            type="button"
            onClick={onEditProfile}
            className="py-2 px-4 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 active:scale-95 text-[10px] font-black uppercase tracking-wider transition rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <User className="w-3.5 h-3.5 stroke-[3]" />
            Actualizar Ficha
          </button>
        </div>
      </motion.div>

      {/* 4. Dangerous reset zone */}
      <motion.div variants={itemVariants} className="glass p-4.5 space-y-3 shadow-xl border-rose-500/10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider text-rose-400">
            Zona de Control de Datos
          </h3>
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed font-light">
          Restablezca las metas semanales de entrenamiento e indexe a cero todo el historial de partidos registrados de forma completa. Esta acción es irreversible.
        </p>

        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Borrar Todos los Datos de la App
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3 text-center"
          >
            <span className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest block">
              ⚠️ ADVERTENCIA DE SEGURIDAD ABSOLUTA
            </span>
            <p className="text-[10px] text-neutral-300 font-light leading-relaxed">
              ¿Está completamente seguro de que desea reiniciar <strong>todo su historial, fichas de perfil, metas individuales y rachas de días</strong> a cero? No podrá deshacer esta acción. No use el botón a menos de estar seguro.
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => {
                  onResetApp();
                  setShowConfirmReset(false);
                }}
                className="py-1.5 px-3 bg-rose-500 hover:bg-rose-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition active:scale-95"
              >
                Sí, Deseo Borrar Todo
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 5. Version Info and Credits */}
      <motion.div variants={itemVariants} className="text-center pt-2 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-[10px] font-mono">
          <Info className="w-3.5 h-3.5" />
          <span>Camino a Primera · Versión 1.5.0 Premium</span>
        </div>
        <p className="text-[9px] text-neutral-600 font-mono">
          Estación AI Core: Activo · Red Local Segura en Cloud Run Container
        </p>
      </motion.div>
    </motion.div>
  );
}
