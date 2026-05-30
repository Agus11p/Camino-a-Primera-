import React from 'react';
import { PlayerProfile } from '../types';
import { 
  Flame, 
  Scale, 
  Edit, 
  Sparkles, 
  User, 
  Shield, 
  Dribbble, 
  ChevronRight, 
  Heart,
  Activity
} from 'lucide-react';

interface ProfileCardViewProps {
  profile: PlayerProfile;
  onEditProfile: () => void;
}

export default function ProfileCardView({ profile, onEditProfile }: ProfileCardViewProps) {
  // Real-time BMI Calculation
  const alturaM = profile.altura / 100;
  const imc = parseFloat((profile.peso / (alturaM * alturaM)).toFixed(1));
  
  let imcStatusLabel = 'Peso Ideal';
  let imcColor = 'text-emerald-400';
  let imdBg = 'bg-emerald-500/10 border-emerald-500/20';
  let imcDescription = 'Tu relación de peso y estatura se encuentra en un rango atlético óptimo.';
  
  if (imc < 18.5) {
    imcStatusLabel = 'Bajo Peso';
    imcColor = 'text-amber-400';
    imdBg = 'bg-amber-500/10 border-amber-500/20';
    imcDescription = 'Considera enfocar tu nutrición en superávit calórico para potenciar tu fuerza.';
  } else if (imc >= 25) {
    imcStatusLabel = 'Sobrepeso';
    imcColor = 'text-rose-400';
    imdBg = 'bg-rose-500/10 border-rose-500/20';
    imcDescription = 'Asegura entrenamientos de alta intensidad y un plan de recomposición corporal.';
  }

  // Get active skills list
  const activeSkills = profile.habilidades && profile.habilidades.length > 0
    ? profile.habilidades
    : [profile.habilidad1, profile.habilidad2].filter(Boolean);

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* Header section with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Ficha del Jugador
          </h3>
          <p className="text-xs text-neutral-400 font-light">
            Información técnica, antropometría e identidad scout.
          </p>
        </div>

        <button
          onClick={onEditProfile}
          className="flex items-center gap-1.5 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer uppercase tracking-wider shadow shadow-emerald-501/10"
        >
          <Edit className="w-3.5 h-3.5 stroke-[2]" />
          <span>Editar</span>
        </button>
      </div>

      {/* 1. FUT Style Scout Card Layout */}
      <div className="relative overflow-hidden glass emerald-glow p-6 sm:p-8 shadow-2xl rounded-2xl flex flex-col items-center justify-center">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-36 h-36 bg-amber-500/[0.03] rounded-full blur-2xl pointer-events-none" />
        
        {/* Card Badge Styling */}
        <div className="w-full flex flex-col items-center">
          <div className="relative shrink-0 mb-4">
            {/* FIFA Ultimate Team Circle badge preview */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black border-[6px] border-white rounded-full flex items-center justify-center text-white skew-logo shrink-0 shadow-xl shadow-emerald-500/10 relative">
              <span className="text-white text-3xl sm:text-4xl font-black italic tracking-tighter">90+</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 w-6.5 h-6.5 rounded-full border border-black flex items-center justify-center text-[10px] font-black shadow-lg">
              {profile.piernaHabil === 'Diestro' ? 'R' : 'L'}
            </div>
          </div>

          <div className="text-center space-y-1.5 w-full">
            <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-extrabold uppercase tracking-widest pl-3.5 pr-3.5 mb-1.5">
              {profile.posicion}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight italic">
              {profile.nombre}
            </h2>
            <p className="text-sm text-neutral-450 font-light">
              Representante Oficial · <span className="text-emerald-400 font-bold">{profile.club}</span>
            </p>
          </div>
        </div>

        {/* Tactical Position Coordinates Block */}
        <div className="mt-6 pt-5 border-t border-white/5 w-full">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
              <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Perfil</span>
              <span className="text-xs font-extrabold text-white">{profile.piernaHabil}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
              <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Edad</span>
              <span className="text-xs font-extrabold text-white">{profile.edad} años</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
              <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">Ficha</span>
              <span className="text-xs font-extrabold text-emerald-400">SCOUT OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Biometrics & Athletic metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Anthropometry details (Height, weight, IMC Status) */}
        <div className="glass p-5 space-y-4">
          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-400" />
            Antropometría Corporal
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-neutral-500 block uppercase font-mono tracking-wider">Altura</span>
              <span className="text-base font-extrabold text-white">{profile.altura} <span className="text-xs font-normal text-neutral-400">cm</span></span>
            </div>
            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] text-neutral-500 block uppercase font-mono tracking-wider">Peso Corporal</span>
              <span className="text-base font-extrabold text-white">{profile.peso} <span className="text-xs font-normal text-neutral-400">kg</span></span>
            </div>
          </div>

          {/* BMI Card Indicator */}
          <div className={`p-4 rounded-xl border ${imdBg} space-y-1.5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 font-bold uppercase tracking-wider">Índice Masa Corporal (IMC)</span>
              <span className={`text-sm font-black uppercase ${imcColor}`}>{imcStatusLabel} ({imc})</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
              {imcDescription}
            </p>
          </div>
        </div>

        {/* Interactive Highlighted Skills Block */}
        <div className="glass p-5 space-y-4">
          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Habilidades Técnicas Destacadas
          </h4>

          <p className="text-xs text-neutral-400 font-light">
            Destrezas especiales configuradas para destacar en los informes de juego de tus partidos.
          </p>

          <div className="space-y-2">
            {activeSkills.map((skill, index) => (
              <div 
                key={skill}
                className="flex items-center justify-between bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-black border border-emerald-500/10">
                    {index + 1}
                  </span>
                  <span className="text-neutral-200 uppercase tracking-wide">{skill}</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-mono">
                  +10% COMP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Footer Scout advice */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
        <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">Planificación de Rendimiento</h5>
          <p className="text-[10px] text-neutral-400 leading-normal mt-0.5 font-light">
            Esta ficha técnica es el reflejo de tus condiciones futbolísticas guardadas. Actualiza tus datos corporales cada mes para mantener tus promedios e índices en orden estratégico y visual.
          </p>
        </div>
      </div>
    </div>
  );
}
