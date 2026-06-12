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
  BookOpen,
  Mail,
  Shield,
  Sparkles
} from 'lucide-react';
import { PlayerProfile } from '../types';
import { LanguageCode, getTranslation } from '../lib/i18n';
import { playClickSound } from '../lib/audio';

interface SettingsSectionProps {
  profile: PlayerProfile;
  onEditProfile: () => void;
  onResetApp: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  onOpenInfoAndLegal: (tab: 'about' | 'privacy' | 'contact' | 'guides') => void;
}

export default function SettingsSection({
  profile,
  onEditProfile,
  onResetApp,
  language,
  onLanguageChange,
  soundEnabled,
  onSoundEnabledChange,
  onOpenInfoAndLegal
}: SettingsSectionProps) {
  const [measurementUnit, setMeasurementUnit] = useState<'Métrico' | 'Imperial'>(() => {
    return (localStorage.getItem('camino_unit') as any) || 'Métrico';
  });
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Translate helper local to settings section
  const t = (key: any) => getTranslation(key, language);

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

  const handleLangToggle = (langCode: LanguageCode) => {
    onLanguageChange(langCode);
    playClickSound();
  };

  const handleUnitToggle = (unit: 'Métrico' | 'Imperial') => {
    setMeasurementUnit(unit);
    localStorage.setItem('camino_unit', unit);
    playClickSound();
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    onSoundEnabledChange(newValue);
    // Timeout so localstorage is updated right before playing
    setTimeout(() => {
      playClickSound();
    }, 20);
  };

  const clickFeedback = () => {
    playClickSound();
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
            {t('settings_title')}
          </h2>
          <p className="text-[10px] text-neutral-440 font-mono">
            {t('settings_desc')}
          </p>
        </div>
      </motion.div>

      {/* 1. Language Box Selector */}
      <motion.div variants={itemVariants} className="glass p-4.5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            {t('settings_lang')}
          </h3>
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed font-light">
          {t('settings_lang_desc')}
        </p>
        
        <div className="grid grid-cols-3 gap-2 pt-1">
          {(['ES', 'EN', 'PT'] as const).map((l) => (
            <button
              key={l}
              onClick={() => handleLangToggle(l)}
              className={`py-2 px-3 rounded-lg border text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                language === l 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-black shadow-md'
                  : 'bg-white/[0.01] border-white/5 text-neutral-400 hover:text-white hover:border-white/10'
              }`}
            >
              {language === l && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
            {t('settings_units')}
          </h3>
        </div>
        
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
          <div className="text-left">
            <span className="block text-xs font-bold text-white">{t('settings_units_label')}</span>
            <span className="text-[9px] text-neutral-500 font-mono">{t('settings_units_desc')}</span>
          </div>
          <div className="flex gap-1 bg-black p-0.5 rounded-lg border border-white/5">
            {(['Métrico', 'Imperial'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => handleUnitToggle(unit)}
                className={`py-1 px-3 text-[9px] font-black uppercase tracking-wider rounded transition cursor-pointer ${
                  measurementUnit === unit
                    ? 'bg-emerald-500 text-neutral-950 font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {unit === 'Métrico' ? (language === 'EN' ? 'Metric' : language === 'PT' ? 'Métrico' : 'Métrico') : (language === 'EN' ? 'Imperial' : language === 'PT' ? 'Imperial' : 'Imperial')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="text-left">
            <span className="block text-xs font-bold text-white">{t('settings_sounds')}</span>
            <span className="text-[9px] text-neutral-500 font-mono">{t('settings_sounds_desc')}</span>
          </div>
          <button
            onClick={handleSoundToggle}
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
              {t('setup_title')}
            </h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="text-left flex-1">
            <div className="text-xs font-bold text-neutral-200">
              {language === 'EN' ? 'Athlete Profile & Positioning' : language === 'PT' ? 'Ficha Médica & Posicionamento' : 'Ficha Médica y Posicionamiento'}
            </div>
            <p className="text-[10px] text-neutral-440 font-light leading-relaxed mt-1">
              {language === 'EN' 
                ? `Modify body metrics, preferred position (${profile.posicion}) or recorded skills instantly.` 
                : language === 'PT' 
                ? `Modifique suas métricas de peso, posição (${profile.posicion}) ou habilidades registradas.` 
                : `Modifique su peso corporal, demarcación preferida (${profile.posicion}) o habilidades de banda registradas de forma inmediata.`}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => {
              clickFeedback();
              onEditProfile();
            }}
            className="py-2 px-4 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 active:scale-95 text-[10px] font-black uppercase tracking-wider transition rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <User className="w-3.5 h-3.5 stroke-[3]" />
            {t('settings_profile_btn')}
          </button>
        </div>
      </motion.div>

      {/* 4. Dangerous reset zone */}
      <motion.div variants={itemVariants} className="glass p-4.5 space-y-3 shadow-xl border-rose-500/10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider text-rose-400">
            {t('settings_reset_title')}
          </h3>
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed font-light">
          {t('settings_reset_desc')}
        </p>

        {!showConfirmReset ? (
          <button
            onClick={() => {
              clickFeedback();
              setShowConfirmReset(true);
            }}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('settings_reset_btn')}
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3 text-center"
          >
            <span className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-widest block">
              {t('settings_reset_warning')}
            </span>
            <p className="text-[10px] text-neutral-300 font-light leading-relaxed">
              {t('settings_reset_confirm_desc')}
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => {
                  clickFeedback();
                  onResetApp();
                  setShowConfirmReset(false);
                }}
                className="py-1.5 px-3 bg-rose-500 hover:bg-rose-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition active:scale-95"
              >
                {t('settings_reset_yes')}
              </button>
              <button
                onClick={() => {
                  clickFeedback();
                  setShowConfirmReset(false);
                }}
                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition active:scale-95"
              >
                {t('settings_reset_no')}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 4.5 Info & Legal Center Card for AdSense compliance */}
      <motion.div variants={itemVariants} className="glass p-4.5 space-y-3 shadow-xl">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            Información, Guías & Soporte
          </h3>
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed font-light">
          Consulta nuestras guías científicas sobre rendimiento, lee la política obligatoria de protección de datos personales o contáctanos por email de soporte.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <button
            onClick={() => { clickFeedback(); onOpenInfoAndLegal('guides'); }}
            className="py-2.5 px-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 text-neutral-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Guías Físicas
          </button>
          <button
            onClick={() => { clickFeedback(); onOpenInfoAndLegal('about'); }}
            className="py-2.5 px-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 text-neutral-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            Nosotros
          </button>
          <button
            onClick={() => { clickFeedback(); onOpenInfoAndLegal('contact'); }}
            className="py-2.5 px-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 text-neutral-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Contacto
          </button>
          <button
            onClick={() => { clickFeedback(); onOpenInfoAndLegal('privacy'); }}
            className="py-2.5 px-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 text-neutral-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-rose-450 shrink-0" />
            Privacidad
          </button>
        </div>

        <button
          onClick={() => { clickFeedback(); onOpenInfoAndLegal('guides'); }}
          className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 group active:scale-98"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-pulse shrink-0" />
          <span>¡Más Información & Guías de Rendimiento!</span>
        </button>
      </motion.div>

      {/* 5. Version Info and Credits */}
      <motion.div variants={itemVariants} className="text-center pt-2 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-[10px] font-mono">
          <Info className="w-3.5 h-3.5" />
          <span>{t('app_version')}</span>
        </div>
        <p className="text-[9px] text-neutral-600 font-mono">
          {language === 'EN' 
            ? 'Active Edge Engine · Encrypted Local Cloud Run DB Node' 
            : language === 'PT' 
            ? 'Estação de Dados Ativa · Cache Local Privado Cryptografado' 
            : 'Estación AI Core: Activo · Red Local Segura en Cloud Run Container'}
        </p>
      </motion.div>
    </motion.div>
  );
}
