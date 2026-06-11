import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, ActivityLog, DynamicGoal } from './types';
import SplashWelcome from './components/SplashWelcome';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import HomeHub from './components/HomeHub';
import GoalsSection from './components/GoalsSection';
import StatisticsCharts from './components/StatisticsCharts';
import HistoryFeed from './components/HistoryFeed';
import ProfileCardView from './components/ProfileCardView';
import DailyLogModal from './components/DailyLogModal';
import UnrespiroAuth from './components/UnrespiroAuth';
import SettingsSection from './components/SettingsSection';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { LanguageCode, getTranslation } from './lib/i18n';
import { playClickSound, playSuccessSound } from './lib/audio';

import { 
  Trophy, 
  Target, 
  Calendar, 
  BarChart2, 
  ShieldAlert, 
  LogOut,
  User,
  Settings,
  Home
} from 'lucide-react';

export default function App() {
  // Check if we are inside the OAuth popup handler
  const isPopup = typeof window !== 'undefined' && window.opener && window.name === 'supabase_oauth_popup';

  useEffect(() => {
    if (!isPopup || !supabase) return;

    // Listen for auth state change in popup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', session }, '*');
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    });

    // Double-check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', session }, '*');
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    });

    // Backup close timer
    const fallbackTimer = setTimeout(() => {
      window.close();
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [isPopup]);

  // 0. Authentication States (Unrespiro/Supabase Style)
  const [sessionUser, setSessionUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('camino_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('camino_is_guest') === 'true';
  });

  const [dbSyncError, setDbSyncError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [showCloudSyncPrompt, setShowCloudSyncPrompt] = useState<boolean>(false);
  const [syncingCloud, setSyncingCloud] = useState<boolean>(false);
  const [showSqlHelperModal, setShowSqlHelperModal] = useState<boolean>(false);

  // 1. Core Persistent States
  const [profile, setProfile] = useState<PlayerProfile | null>(() => {
    const saved = localStorage.getItem('camino_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('camino_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [goalsGoal, setGoalsGoal] = useState<number>(() => {
    const saved = localStorage.getItem('camino_goals_goal');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [assistsGoal, setAssistsGoal] = useState<number>(() => {
    const saved = localStorage.getItem('camino_assists_goal');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [goals, setGoals] = useState<DynamicGoal[]>(() => {
    const saved = localStorage.getItem('camino_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('camino_language') || localStorage.getItem('mister_language');
    if (saved === 'PT' || saved === 'EN' || saved === 'ES') return saved as LanguageCode;
    return 'ES';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('camino_sound_enabled');
    return saved !== 'false';
  });

  // Listen to Supabase auth flow changes
  useEffect(() => {
    if (!supabase) return;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user);
        localStorage.setItem('camino_user', JSON.stringify(session.user));
        setIsGuest(false);
        localStorage.setItem('camino_is_guest', 'false');
      }
    });

    // Sub to token changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        localStorage.setItem('camino_user', JSON.stringify(session.user));
        setIsGuest(false);
        localStorage.setItem('camino_is_guest', 'false');
      } else if (event === 'SIGNED_OUT') {
        setSessionUser(null);
        localStorage.removeItem('camino_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async () => {
    if (!supabase || !sessionUser) return;
    try {
      // Load profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();
      
      if (profileErr) throw profileErr;
      
      if (profileData) {
        setProfile({
          nombre: profileData.nombre,
          club: profileData.club,
          edad: profileData.edad,
          peso: profileData.peso,
          altura: profileData.altura,
          piernaHabil: profileData.pierna_habil || profileData.piernaHabil,
          posicion: profileData.posicion,
          habilidad1: profileData.habilidades?.[0] || 'Velocidad',
          habilidad2: profileData.habilidades?.[1] || 'Pase',
          habilidades: profileData.habilidades || []
        });
      }

      // Load logs
      const { data: logsData, error: logsErr } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', sessionUser.id)
        .order('timestamp', { ascending: false });
      
      if (logsErr) throw logsErr;
      
      if (logsData) {
        setLogs(logsData.map((l: any) => ({
          id: l.id,
          tipo: l.tipo,
          fecha: l.fecha,
          goles: l.goles || 0,
          asistencias: l.asistencias || 0,
          atajadas: l.atajadas || 0,
          vallaInvicta: !!l.valla_invicta,
          reflexion: l.reflexion || '',
          timestamp: l.timestamp || Date.now()
        })));
      }

      // Load goals
      const { data: goalsData, error: goalsErr } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', sessionUser.id);
      
      if (goalsErr) throw goalsErr;
      
      if (goalsData) {
        setGoals(goalsData.map((g: any) => ({
          id: g.id,
          texto: g.texto,
          completado: g.completado,
          plazo: g.plazo
        })));
      }

      // Smart local-to-cloud sync prompt
      const savedProfile = localStorage.getItem('camino_profile');
      const savedLogs = localStorage.getItem('camino_logs');
      const savedGoals = localStorage.getItem('camino_goals');

      const hasLocalData = savedProfile || (savedLogs && JSON.parse(savedLogs).length > 0) || (savedGoals && JSON.parse(savedGoals).length > 0);
      const isCloudEmpty = (!profileData) && (!logsData || logsData.length === 0) && (!goalsData || goalsData.length === 0);
      
      if (hasLocalData && isCloudEmpty) {
        setShowCloudSyncPrompt(true);
      }

      setDbSyncError(null);
    } catch (err: any) {
      console.warn('Falló la carga de datos desde Supabase:', err);
      setDbSyncError(`Error al cargar datos de Base de Datos: ${err.message || err.details || err}`);
    }
  };

  // Fetch data from Supabase if user is logged in
  useEffect(() => {
    loadUserData();
  }, [sessionUser]);

  // Global translation dispatcher
  const t = (key: Parameters<typeof getTranslation>[0]) => {
    return getTranslation(key, language);
  };

  // 2. Navigation & Modal States
  const [activeTab, setActiveTab] = useState<'inicio' | 'dashboard' | 'goals' | 'config'>('inicio');
  const [showSetup, setShowSetup] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showDiarioModal, setShowDiarioModal] = useState(false);
  const [editLogTarget, setEditLogTarget] = useState<ActivityLog | null>(null);

  // Sync to local storage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('camino_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('camino_profile');
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('camino_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('camino_goals_goal', goalsGoal.toString());
  }, [goalsGoal]);

  useEffect(() => {
    localStorage.setItem('camino_assists_goal', assistsGoal.toString());
  }, [assistsGoal]);

  useEffect(() => {
    localStorage.setItem('camino_goals', JSON.stringify(goals));
  }, [goals]);

  // View state machine resolver
  const currentView = (!sessionUser && !isGuest)
    ? 'auth'
    : showSetup 
      ? 'setup' 
      : !profile 
        ? 'welcome' 
        : 'app';

  // 3. Handlers
  const handleAuthSuccess = (sessionUser: any, isGuestMode: boolean) => {
    if (isGuestMode) {
      setIsGuest(true);
      localStorage.setItem('camino_is_guest', 'true');
      setSessionUser(null);
      localStorage.removeItem('camino_user');
    } else {
      setSessionUser(sessionUser);
      setIsGuest(false);
      localStorage.setItem('camino_is_guest', 'false');
      localStorage.setItem('camino_user', JSON.stringify(sessionUser));
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setSessionUser(null);
    setIsGuest(false);
    localStorage.removeItem('camino_user');
    localStorage.setItem('camino_is_guest', 'false');
  };

  const handleUploadLocalToCloud = async () => {
    if (!supabase || !sessionUser) return;
    try {
      setSyncingCloud(true);
      setDbSyncError(null);

      // 1. Upload Profile
      if (profile) {
        const { error } = await supabase.from('profiles').upsert({
          id: sessionUser.id,
          nombre: profile.nombre,
          club: profile.club,
          edad: Number(profile.edad || 0),
          peso: Number(profile.peso || 0),
          altura: Number(profile.altura || 0),
          pierna_habil: profile.piernaHabil,
          posicion: profile.posicion,
          habilidades: profile.habilidades || [profile.habilidad1, profile.habilidad2]
        });
        if (error) throw error;
      }

      // 2. Upload Logs
      if (logs.length > 0) {
        for (const log of logs) {
          const { error } = await supabase.from('logs').upsert({
            id: log.id,
            user_id: sessionUser.id,
            tipo: log.tipo,
            fecha: log.fecha,
            goles: Number(log.goles || 0),
            asistencias: Number(log.asistencias || 0),
            atajadas: Number(log.atajadas || 0),
            valla_invicta: !!log.vallaInvicta,
            reflexion: log.reflexion || '',
            timestamp: log.timestamp
          });
          if (error) throw error;
        }
      }

      // 3. Upload Goals
      if (goals.length > 0) {
        for (const goal of goals) {
          const { error } = await supabase.from('goals').upsert({
            id: goal.id,
            user_id: sessionUser.id,
            texto: goal.texto,
            completado: goal.completado,
            plazo: goal.plazo
          });
          if (error) throw error;
        }
      }

      setShowCloudSyncPrompt(false);
      setSuccessBanner("🔄 ¡Excelente! Todo tu historial de partidos (goles y asistencias) se ha guardado en la nube de forma permanente.");
      setDbSyncError(null);
      await loadUserData();
    } catch (err: any) {
      console.warn('Fallo al migrar datos:', err);
      setDbSyncError(`No se pudieron subir tus datos: ${err.message || err.details || err}`);
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleSaveProfile = async (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    setShowSetup(false);

    if (supabase && sessionUser) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: sessionUser.id,
          nombre: newProfile.nombre,
          club: newProfile.club,
          edad: Number(newProfile.edad),
          peso: Number(newProfile.peso),
          altura: Number(newProfile.altura),
          pierna_habil: newProfile.piernaHabil,
          posicion: newProfile.posicion,
          habilidades: newProfile.habilidades || [newProfile.habilidad1, newProfile.habilidad2]
        });
        if (error) throw error;
        setDbSyncError(null);
      } catch (err: any) {
        console.warn('No se pudo respaldar el perfil en Supabase:', err);
        setDbSyncError(`Error al sincronizar perfil: ${err.message || err.details || err}`);
      }
    }
  };

  const handleCreateOrUpdateLog = async (newLogData: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string }) => {
    let targetId = newLogData.id || 'log-' + Math.random().toString(36).substr(2, 9);
    let targetTimestamp = Date.now();

    if (newLogData.id) {
      // Edit mode
      setLogs((prev) =>
        prev.map((item) => {
          if (item.id === newLogData.id) {
            targetTimestamp = item.timestamp;
            return { ...item, ...newLogData, timestamp: item.timestamp };
          }
          return item;
        })
      );
    } else {
      // Creation mode
      const newLog: ActivityLog = {
        ...newLogData,
        id: targetId,
        timestamp: targetTimestamp,
      };
      setLogs((prev) => [newLog, ...prev]);
    }

    if (supabase && sessionUser) {
      try {
        const { error } = await supabase.from('logs').upsert({
          id: targetId,
          user_id: sessionUser.id,
          tipo: newLogData.tipo,
          fecha: newLogData.fecha,
          goles: Number(newLogData.goles || 0),
          asistencias: Number(newLogData.asistencias || 0),
          atajadas: Number(newLogData.atajadas || 0),
          valla_invicta: !!newLogData.vallaInvicta,
          reflexion: newLogData.reflexion || '',
          timestamp: targetTimestamp
        });
        if (error) throw error;
        setDbSyncError(null);
      } catch (err: any) {
        console.warn('No se pudo respaldar el diario en Supabase:', err);
        setDbSyncError(`Error al respaldar registro (goles/asistencias) en Base de Datos: ${err.message || err.details || err}`);
      }
    }

    setIsRegisterOpen(false);
    setEditLogTarget(null);
  };

  const handleDeleteLog = async (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
    if (supabase && sessionUser) {
      try {
        const { error } = await supabase.from('logs').delete().eq('id', id).eq('user_id', sessionUser.id);
        if (error) throw error;
        setDbSyncError(null);
      } catch (err: any) {
        console.warn('No se pudo eliminar de Supabase:', err);
        setDbSyncError(`Error al eliminar registro en Base de Datos: ${err.message || err.details || err}`);
      }
    }
  };

  const handleEditLogTrigger = (log: ActivityLog) => {
    setEditLogTarget(log);
    setIsRegisterOpen(true);
  };

  const handleAddDynamicGoal = async (texto: string, plazo: 'Corto' | 'Mediano' | 'Largo') => {
    const newGoal: DynamicGoal = {
      id: 'goal-' + Math.random().toString(36).substr(2, 9),
      texto,
      completado: false,
      plazo,
    };
    setGoals((prev) => [newGoal, ...prev]);

    if (supabase && sessionUser) {
      try {
        const { error } = await supabase.from('goals').insert({
          id: newGoal.id,
          user_id: sessionUser.id,
          texto: newGoal.texto,
          completado: newGoal.completado,
          plazo: newGoal.plazo
        });
        if (error) throw error;
        setDbSyncError(null);
      } catch (err: any) {
        console.warn('No se pudo añadir meta en Supabase:', err);
        setDbSyncError(`Error al guardar meta en Base de Datos: ${err.message || err.details || err}`);
      }
    }
  };

  const handleToggleGoal = async (id: string) => {
    let nextState = false;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          nextState = !g.completado;
          return { ...g, completado: nextState };
        }
        return g;
      })
    );

    if (supabase && sessionUser) {
      try {
        const { error } = await supabase.from('goals').update({ completado: nextState }).eq('id', id).eq('user_id', sessionUser.id);
        if (error) throw error;
        setDbSyncError(null);
      } catch (err: any) {
        console.warn('No se pudo guardar estado de meta en Supabase:', err);
        setDbSyncError(`Error al actualizar meta en Base de Datos: ${err.message || err.details || err}`);
      }
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (supabase && sessionUser) {
      try {
        const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', sessionUser.id);
        if (error) throw error;
        setDbSyncError(null);
      } catch (err: any) {
        console.warn('No se pudo borrar meta en Supabase:', err);
        setDbSyncError(`Error al eliminar meta en Base de Datos: ${err.message || err.details || err}`);
      }
    }
  };

  const handleResetApp = () => {
    setProfile(null);
    setLogs([]);
    setGoals([]);
    setGoalsGoal(10);
    setAssistsGoal(10);
    setActiveTab('dashboard');
    setShowSetup(false);
    localStorage.clear();
  };

  if (isPopup) {
    return (
      <div className="min-h-screen bg-[#070908] text-neutral-200 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-lg font-black tracking-tight text-white mb-2">CONECTANDO CUENTA</h2>
        <p className="text-xs text-neutral-500 max-w-xs">
          Autenticando tu sesión de forma segura. Esta ventana se cerrará sola al finalizar.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-900">
      
      {/* Upper Global Navigation Header only on Active App */}
      {currentView === 'app' && (
        <header className="sticky top-0 bg-neutral-950/80 backdrop-blur-md border-b border-white/[0.04] px-4 py-3.5 flex items-center justify-between z-40 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-black border-2 border-white flex items-center justify-center shadow shadow-emerald-500/10 shrink-0">
              <span 
                translate="no"
                className="notranslate text-white text-xs font-black italic tracking-tighter" 
                style={{ fontFamily: '"Arial Black", "Impact", sans-serif' }}
              >
                90+
              </span>
            </div>
            
            <div>
              <span className="block text-xs font-black text-white leading-none uppercase tracking-wider font-sans">
                Camino a Primera
              </span>
              <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest block mt-0.5 font-mono">
                {profile?.nombre} · {profile?.club}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.05] transition cursor-pointer flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5 text-emerald-400" />
            Salir
          </button>
        </header>
      )}

      {/* Main Panel Core Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {currentView === 'auth' && (
              <UnrespiroAuth
                onAuthSuccess={handleAuthSuccess}
              />
            )}

            {currentView === 'welcome' && (
              <SplashWelcome
                profile={profile}
                onEnterDashboard={() => setShowSetup(false)}
                onStartOnboarding={() => setShowSetup(true)}
              />
            )}

            {currentView === 'setup' && (
              <ProfileSetup
                initialProfile={profile}
                onSave={handleSaveProfile}
                showBackButton={!!profile}
                onBack={() => setShowSetup(false)}
              />
            )}

            {currentView === 'app' && (
              <div className="pt-4">
                {/* 1. Success Sync Notification Banner */}
                {successBanner && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-5 text-left flex items-start justify-between gap-3 animate-fade-in relative">
                    <div className="flex items-start gap-2.5">
                      <span className="text-emerald-400 text-base">✨</span>
                      <div>
                        <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono">Sincronización Exitosa</h4>
                        <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">{successBanner}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSuccessBanner(null)} 
                      className="text-neutral-500 hover:text-white text-xs font-bold leading-none p-1 transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* 2. Database Sync Error Banner */}
                {dbSyncError && (
                  <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 mb-5 text-left animate-fade-in text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="text-rose-400 shrink-0 text-base">⚠️</span>
                      <div className="space-y-1">
                        <h5 className="font-bold text-rose-300">Base de Datos Sin Inicializar</h5>
                        <p className="text-[11px] text-neutral-400 leading-normal">
                          Tus estadísticas están a salvo en este dispositivo, pero no se guardan en la nube porque falto crear las tablas en tu consola de Supabase.
                        </p>
                        <p className="text-[10px] text-rose-300/80 font-mono select-all bg-black/30 p-1.5 rounded border border-rose-500/10 max-h-20 overflow-y-auto">
                          Detalle técnico: {dbSyncError}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 flex items-center gap-2.5">
                      <button
                        onClick={() => setShowSqlHelperModal(true)}
                        className="px-3 py-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-200 hover:bg-rose-500/30 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                         ⚙️ Solucionar Ahora (Ver SQL)
                      </button>
                      <button
                        onClick={() => setDbSyncError(null)}
                        className="px-3 py-1.5 bg-transparent text-neutral-400 hover:text-white text-[10px] uppercase font-semibold cursor-pointer"
                      >
                        Cerrar aviso
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Smart Guest-to-Cloud Account Sync Suggestion */}
                {showCloudSyncPrompt && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-5 text-left space-y-3 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        🔄 ¡Tienes estadísticas locales!
                      </h4>
                      <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                        Detectamos goles y asistencias de tu sesión previa. ¿Quieres migrarlos a tu cuenta de Google en la nube ahora mismo para sincronizar tu celular y PC?
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={handleUploadLocalToCloud}
                        disabled={syncingCloud}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        {syncingCloud ? 'Sincronizando...' : 'Sí, Migrar Datos'}
                      </button>
                      <button
                        onClick={() => setShowCloudSyncPrompt(false)}
                        className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-white/5 text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        Preservar Vacío / Descartar
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {activeTab === 'inicio' && (
                      <HomeHub
                        profile={profile!}
                        logs={logs}
                        onNavigateToTab={(tab) => {
                          if (tab === 'inicio' || tab === 'dashboard' || tab === 'goals' || tab === 'config') {
                            setActiveTab(tab);
                          }
                        }}
                        onOpenRegisterModal={() => {
                          setEditLogTarget(null);
                          setIsRegisterOpen(true);
                        }}
                        onOpenDiario={() => setShowDiarioModal(true)}
                        language={language}
                      />
                    )}

                    {activeTab === 'dashboard' && (
                      <Dashboard
                        profile={profile!}
                        logs={logs}
                        goalsGoal={goalsGoal}
                        assistsGoal={assistsGoal}
                        onEditProfile={() => setShowSetup(true)}
                        onResetApp={handleResetApp}
                        onOpenRegisterModal={() => {
                          setEditLogTarget(null);
                          setIsRegisterOpen(true);
                        }}
                        onOpenDiario={() => setShowDiarioModal(true)}
                        onUpdateGoalsGoal={setGoalsGoal}
                        onUpdateAssistsGoal={setAssistsGoal}
                        onNavigateToTab={(tab) => {
                          if (tab === 'history') setShowDiarioModal(true);
                          else if (tab === 'inicio' || tab === 'dashboard' || tab === 'goals') setActiveTab(tab);
                        }}
                        language={language}
                      />
                    )}

                    {activeTab === 'goals' && (
                      <GoalsSection
                        goals={goals}
                        logs={logs}
                        onAddGoal={handleAddDynamicGoal}
                        onToggleGoal={handleToggleGoal}
                        onDeleteGoal={handleDeleteGoal}
                        language={language}
                      />
                    )}

                    {activeTab === 'config' && (
                      <SettingsSection
                        profile={profile!}
                        onEditProfile={() => setShowSetup(true)}
                        onResetApp={handleResetApp}
                        language={language}
                        onLanguageChange={(l) => {
                          setLanguage(l);
                          localStorage.setItem('camino_language', l);
                        }}
                        soundEnabled={soundEnabled}
                        onSoundEnabledChange={(s) => {
                          setSoundEnabled(s);
                          localStorage.setItem('camino_sound_enabled', s ? 'true' : 'false');
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Tab Shell Bar */}
      {currentView === 'app' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 py-2.5 z-40 max-w-2xl mx-auto w-full px-4 rounded-t-xl">
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('inicio');
              }}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'inicio' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">{t('tab_inicio')}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('dashboard');
              }}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'dashboard' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Trophy className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">{t('tab_dashboard')}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('goals');
              }}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'goals' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Target className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">{t('tab_goals')}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('config');
              }}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'config' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">{t('tab_config')}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Historical logs sliding diary modal overlay */}
      {showDiarioModal && (
        <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-50 overflow-y-auto px-4 py-6">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 sticky top-0 bg-neutral-950/95 pt-2 z-10">
              <div className="text-left">
                <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Diario Personal Escrito
                </h2>
                <p className="text-xs text-neutral-450 font-light mt-0.5">
                  Bitácora de todos sus partidos y entrenamientos registrados.
                </p>
              </div>
              
              <button
                onClick={() => setShowDiarioModal(false)}
                className="p-1 px-3.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <HistoryFeed
              logs={logs}
              onEdit={(log) => {
                setShowDiarioModal(false);
                handleEditLogTrigger(log);
              }}
              onDelete={handleDeleteLog}
              profile={profile}
            />
          </div>
        </div>
      )}

      {/* Global register modal */}
      <DailyLogModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setEditLogTarget(null);
        }}
        onSave={handleCreateOrUpdateLog}
        editLog={editLogTarget}
        profile={profile}
      />

      {/* Supabase Schema SQL helper modal */}
      {showSqlHelperModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto px-4 py-8 flex items-center justify-center">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 text-left relative scrollbar-none">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
              🔧 Crear Tablas en Supabase
            </h3>
            
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Para guardar tus goles, asistencias y objetivos en la nube de Supabase, necesitas crear las tablas correspondientes. Sigue estos 3 sencillos pasos:
            </p>

            <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside font-sans">
              <li>Ingresa a tu panel de control de <b>Supabase</b>.</li>
              <li>Busca y abre la pestaña de <b>"SQL Editor"</b> en el menú lateral.</li>
              <li>Crea un "New Query", pega el código de abajo y haz clic en <b>"Run"</b>.</li>
            </ol>

            <div className="relative">
              <span className="absolute right-3 top-3 text-[9px] font-mono text-neutral-500 uppercase">Esquema SQL</span>
              <pre className="text-[10px] font-mono text-emerald-400 bg-neutral-950 p-4 rounded-xl border border-white/5 overflow-x-auto max-h-56 select-all whitespace-pre">
{`--- 1. Perfiles de Jugador
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  club TEXT NOT NULL,
  edad INTEGER,
  peso NUMERIC,
  altura NUMERIC,
  pierna_habil TEXT,
  posicion TEXT,
  habilidades TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert policy" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

--- 2. Historial de Partidos (Goles y Asistencias)
CREATE TABLE IF NOT EXISTS public.logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  fecha DATE NOT NULL,
  goles INTEGER DEFAULT 0,
  asistencias INTEGER DEFAULT 0,
  atajadas INTEGER DEFAULT 0,
  valla_invicta BOOLEAN DEFAULT false,
  reflexion TEXT,
  timestamp BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logs select policy" ON public.logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Logs insert policy" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Logs update policy" ON public.logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Logs delete policy" ON public.logs FOR DELETE USING (auth.uid() = user_id);

--- 3. Metas de la Temporada
CREATE TABLE IF NOT EXISTS public.goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  completado BOOLEAN DEFAULT false NOT NULL,
  plazo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Goals select policy" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Goals insert policy" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Goals update policy" ON public.goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Goals delete policy" ON public.goals FOR DELETE USING (auth.uid() = user_id);`}
              </pre>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`--- 1. Perfiles de Jugador
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  club TEXT NOT NULL,
  edad INTEGER,
  peso NUMERIC,
  altura NUMERIC,
  pierna_habil TEXT,
  posicion TEXT,
  habilidades TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert policy" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

--- 2. Historial de Partidos (Goles y Asistencias)
CREATE TABLE IF NOT EXISTS public.logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  fecha DATE NOT NULL,
  goles INTEGER DEFAULT 0,
  asistencias INTEGER DEFAULT 0,
  atajadas INTEGER DEFAULT 0,
  valla_invicta BOOLEAN DEFAULT false,
  reflexion TEXT,
  timestamp BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logs select policy" ON public.logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Logs insert policy" ON public.logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Logs update policy" ON public.logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Logs delete policy" ON public.logs FOR DELETE USING (auth.uid() = user_id);

--- 3. Metas de la Temporada
CREATE TABLE IF NOT EXISTS public.goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  completado BOOLEAN DEFAULT false NOT NULL,
  plazo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Goals select policy" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Goals insert policy" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Goals update policy" ON public.goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Goals delete policy" ON public.goals FOR DELETE USING (auth.uid() = user_id);`);
                  alert("Código SQL copiado al portapapeles. ¡Pégalo en Supabase!");
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Copiar Código SQL
              </button>
              <button
                onClick={() => setShowSqlHelperModal(false)}
                className="px-4 py-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer border border-white/5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

