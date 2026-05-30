import React, { useState, useEffect } from 'react';
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
import { supabase, isSupabaseConfigured } from './lib/supabase';

import { 
  Trophy, 
  Target, 
  Calendar, 
  BarChart2, 
  ShieldAlert, 
  LogOut,
  Sparkles,
  User
} from 'lucide-react';

export default function App() {
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'charts' | 'history' | 'profile'>('dashboard');
  const [showSetup, setShowSetup] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
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

  const handleSaveProfile = (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    setShowSetup(false);
  };

  const handleCreateOrUpdateLog = (newLogData: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string }) => {
    if (newLogData.id) {
      // Edit mode
      setLogs((prev) =>
        prev.map((item) =>
          item.id === newLogData.id
            ? { ...item, ...newLogData, timestamp: item.timestamp }
            : item
        )
      );
    } else {
      // Creation mode
      const newLog: ActivityLog = {
        ...newLogData,
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
    setIsRegisterOpen(false);
    setEditLogTarget(null);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleEditLogTrigger = (log: ActivityLog) => {
    setEditLogTarget(log);
    setIsRegisterOpen(true);
  };

  const handleAddDynamicGoal = (texto: string, plazo: 'Corto' | 'Mediano' | 'Largo') => {
    const newGoal: DynamicGoal = {
      id: 'goal-' + Math.random().toString(36).substr(2, 9),
      texto,
      completado: false,
      plazo,
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completado: !g.completado } : g))
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleResetApp = () => {
    if (confirm('¿Estás seguro de que quieres restablecer tu ficha de jugador? Esto borrará tus metas y todos tus partidos registrados de forma irreversible.')) {
      setProfile(null);
      setLogs([]);
      setGoals([]);
      setGoalsGoal(10);
      setAssistsGoal(10);
      setActiveTab('dashboard');
      setShowSetup(false);
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-neutral-900">
      
      {/* Upper Global Navigation Header only on Active App */}
      {currentView === 'app' && (
        <header className="sticky top-0 bg-neutral-950/80 backdrop-blur-md border-b border-white/[0.04] px-4 py-3.5 flex items-center justify-between z-40 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-black border-2 border-white flex items-center justify-center shadow shadow-emerald-500/10 shrink-0">
              <span 
                className="text-white text-xs font-black italic tracking-tighter" 
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
            {activeTab === 'dashboard' && (
              <Dashboard
                profile={profile!}
                logs={logs}
                goalsGoal={goalsGoal}
                assistsGoal={assistsGoal}
                onEditProfile={() => setShowSetup(true)}
                onOpenRegisterModal={() => {
                  setEditLogTarget(null);
                  setIsRegisterOpen(true);
                }}
                onUpdateGoalsGoal={setGoalsGoal}
                onUpdateAssistsGoal={setAssistsGoal}
                onNavigateToTab={setActiveTab}
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

            {activeTab === 'charts' && (
              <StatisticsCharts logs={logs} />
            )}

            {activeTab === 'history' && (
              <HistoryFeed
                logs={logs}
                onEdit={handleEditLogTrigger}
                onDelete={handleDeleteLog}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileCardView
                profile={profile!}
                onEditProfile={() => setShowSetup(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Persistent Bottom Tab Shell Bar */}
      {currentView === 'app' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 py-2.5 z-40 max-w-2xl mx-auto w-full px-4 rounded-t-xl">
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'dashboard' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Trophy className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Inicio</span>
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
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'history' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Diario</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'charts' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <BarChart2 className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Estads</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'profile' ? 'text-emerald-400 font-extrabold scale-[1.03]' : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <User className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Ficha</span>
            </button>
          </div>
        </nav>
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
      />
    </div>
  );
}

