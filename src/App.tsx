import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, ActivityLog, DynamicGoal } from './types';
import SplashWelcome from './components/SplashWelcome';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import GoalsSection from './components/GoalsSection';
import StatisticsCharts from './components/StatisticsCharts';
import HistoryFeed from './components/HistoryFeed';
import ProfileCardView from './components/ProfileCardView';
import DailyLogModal from './components/DailyLogModal';
import UnrespiroAuth from './components/UnrespiroAuth';
import AICoachSection from './components/AICoachSection';
import SettingsSection from './components/SettingsSection';
import { supabase, isSupabaseConfigured } from './lib/supabase';

import { 
  Trophy, 
  Target, 
  Calendar, 
  BarChart2, 
  ShieldAlert, 
  LogOut,
  Sparkles,
  User,
  Settings
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

  // Fetch data from Supabase if user is logged in
  useEffect(() => {
    if (!supabase || !sessionUser) return;

    const loadUserData = async () => {
      try {
        // Load profile
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle();
        
        if (profileData && !profileErr) {
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
        
        if (logsData && !logsErr) {
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
        
        if (goalsData && !goalsErr) {
          setGoals(goalsData.map((g: any) => ({
            id: g.id,
            texto: g.texto,
            completado: g.completado,
            plazo: g.plazo
          })));
        }
      } catch (err) {
        console.warn('Falló la carga de datos desde Supabase (puede que las tablas no existan aún):', err);
      }
    };

    loadUserData();
  }, [sessionUser]);

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

  // 2. Navigation & Modal States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'coach' | 'config'>('dashboard');
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

  const handleSaveProfile = async (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    setShowSetup(false);

    if (supabase && sessionUser) {
      try {
        await supabase.from('profiles').upsert({
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
      } catch (err) {
        console.warn('No se pudo respaldar el perfil en Supabase (puede faltar crear la tabla):', err);
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
        await supabase.from('logs').upsert({
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
      } catch (err) {
        console.warn('No se pudo respaldar el diario en Supabase:', err);
      }
    }

    setIsRegisterOpen(false);
    setEditLogTarget(null);
  };

  const handleDeleteLog = async (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
    if (supabase && sessionUser) {
      try {
        await supabase.from('logs').delete().eq('id', id).eq('user_id', sessionUser.id);
      } catch (err) {
        console.warn('No se pudo eliminar de Supabase:', err);
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
        await supabase.from('goals').insert({
          id: newGoal.id,
          user_id: sessionUser.id,
          texto: newGoal.texto,
          completado: newGoal.completado,
          plazo: newGoal.plazo
        });
      } catch (err) {
        console.warn('No se pudo añadir meta en Supabase:', err);
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
        await supabase.from('goals').update({ completado: nextState }).eq('id', id).eq('user_id', sessionUser.id);
      } catch (err) {
        console.warn('No se pudo guardar estado de meta en Supabase:', err);
      }
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (supabase && sessionUser) {
      try {
        await supabase.from('goals').delete().eq('id', id).eq('user_id', sessionUser.id);
      } catch (err) {
        console.warn('No se pudo borrar meta en Supabase:', err);
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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
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
                          else if (tab === 'dashboard' || tab === 'goals' || tab === 'coach') setActiveTab(tab);
                        }}
                      />
                    )}

                    {activeTab === 'goals' && (
                      <GoalsSection
                        goals={goals}
                        logs={logs}
                        onAddGoal={handleAddDynamicGoal}
                        onToggleGoal={handleToggleGoal}
                        onDeleteGoal={handleDeleteGoal}
                      />
                    )}

                    {activeTab === 'coach' && (
                      <AICoachSection
                        profile={profile!}
                        logs={logs}
                      />
                    )}

                    {activeTab === 'config' && (
                      <SettingsSection
                        profile={profile!}
                        onEditProfile={() => setShowSetup(true)}
                        onResetApp={handleResetApp}
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
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'dashboard' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Trophy className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">Inicio</span>
            </button>

            <button
              onClick={() => setActiveTab('coach')}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'coach' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">Coach</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'goals' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Target className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">Metas</span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'config' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-sans">Ajustes</span>
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
    </div>
  );
}

