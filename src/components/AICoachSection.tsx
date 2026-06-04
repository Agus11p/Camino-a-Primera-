import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, ActivityLog } from '../types';
import { 
  Sparkles, 
  MessageSquare, 
  Send, 
  Dumbbell, 
  Apple, 
  Brain, 
  Zap, 
  Clipboard, 
  ChevronRight,
  ShieldCheck,
  Award,
  Loader2,
  RefreshCw,
  Trophy,
  Target,
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info
} from 'lucide-react';

interface AICoachSectionProps {
  profile: PlayerProfile;
  logs: ActivityLog[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface PositionDetails {
  rol: string;
  pautas: string[];
  asociacion: string;
  presion: string;
  heatmapCoords: { cx: number; cy: number; r: number; grad: string };
  coords: { x: number; y: number };
  pivoteCoords: { x: number; y: number };
  centralCoords: { x: number; y: number };
  rivalCoords: { x: number; y: number };
}

// 1. Detailed positional tactical database
const DETALLES_POR_POSICION: Record<string, PositionDetails> = {
  'Arquero': {
    rol: "Guardián de los Tres Palos & Iniciador",
    pautas: [
      "Voz de mando clara: Ordene la distancia de la barrera y mantenga despierta a su zaga.",
      "Salida limpia: Perfile su cuerpo y busque triangulaciones con laterales desmarcados.",
      "Espacio a la espalda: Controle la distancia respecto a sus defensas adelantadas."
    ],
    asociacion: "Asociarse rápido con los laterales o filtrando un balón raso directo al pivote creativo.",
    presion: "Achique rápido abriendo los brazos y conteniendo el cuerpo de pie en mano a mano.",
    heatmapCoords: { cx: 50, cy: 120, r: 18, grad: "glowArquero" },
    coords: { x: 50, y: 122 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 32, y: 104 },
    rivalCoords: { x: 50, y: 45 }
  },
  'Central Izquierdo': {
    rol: "Zaguero de Salida & Cobertura Izquierda",
    pautas: [
      "Salida perfilada: Reciba abierto para ver el juego amplio y de frente.",
      "Dupla coordinada: Guarde la basculación en sintonía con su lateral zurdo.",
      "Firmeza aérea: Gane juego físico y despejes de testarazo contundentes."
    ],
    asociacion: "Asegurar circulación segura al pivote o descolgar un cambio de juego largo al extremo opuesto.",
    presion: "Temporizar al atacante sin lanzarse; esperar su error de perfilación y trabar limpio.",
    heatmapCoords: { cx: 32, cy: 104, r: 20, grad: "glowDefensas" },
    coords: { x: 32, y: 104 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 68, y: 104 },
    rivalCoords: { x: 30, y: 70 }
  },
  'Central Derecho': {
    rol: "Zaguero de Salida & Cobertura Derecha",
    pautas: [
      "Perfilamiento abierto: Reciba abierto por derecha para explorar opciones libres.",
      "Distancia de recuperación: Cubra espalda velozmente si el lateral derecho se proyecta.",
      "Dominio terrestre: Controle los pases rápidos filtrados del rival de forma agresiva."
    ],
    asociacion: "Asociarse en corto al lateral o filtrar directo al enganche creativo de cara.",
    presion: "Cerrar espacio interior forzando al punta a salir hacia las bandas congestionadas.",
    heatmapCoords: { cx: 68, cy: 104, r: 20, grad: "glowDefensas" },
    coords: { x: 68, y: 104 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 32, y: 104 },
    rivalCoords: { x: 70, y: 70 }
  },
  'Lateral Izquierdo': {
    rol: "Locomotora de Banda & Amplitud",
    pautas: [
      "Amplitud de banda: Suba por el carril zurdo cuando el extremo interiorice con el balón.",
      "Recorrido férreo: Mantenga repliegues veloces bloqueando centros rasantes.",
      "Finalización: Busque rebasar líneas y sacar centros al espacio entre el arquero y los defensas."
    ],
    asociacion: "Tirar paredes rápidas por la cal o descargar al mediocentro de espaldas.",
    presion: "Bloquear carril de regate interior y forzar balonazos del contrario.",
    heatmapCoords: { cx: 14, cy: 92, r: 22, grad: "glowCentros" },
    coords: { x: 14, y: 92 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 32, y: 104 },
    rivalCoords: { x: 16, y: 60 }
  },
  'Lateral Derecho': {
    rol: "Locomotora de Banda & Amplitud",
    pautas: [
      "Proyección diestra: Doble como opción de pase when se junte la marca sobre el extremo.",
      "Cierre de zaga: Cubra el segundo poste en centros cruzados que vengan del otro costado.",
      "Paso al frente: Presione al extremo receptor para forzar que descargue incómodo."
    ],
    asociacion: "Filtrar pases lineales a banda o pivotear en corto con el volante defensivo.",
    presion: "Impedir centros cómodos tapando el esférico con presión activa de brazos y piernas.",
    heatmapCoords: { cx: 86, cy: 92, r: 22, grad: "glowCentros" },
    coords: { x: 86, y: 92 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 68, y: 104 },
    rivalCoords: { x: 84, y: 60 }
  },
  'Mediocampista Defensivo': {
    rol: "Pivote Organizador & Ancla Táctica",
    pautas: [
      "Visión periférica (360°): Gire el cuello constantemente antes de recibir el esférico.",
      "Manejo de tiempos: Juegue en corto a uno o dos toques para triturar la presión rival.",
      "Equilibrio táctico: Sea el guardián de espacio delante de su línea de zagueros."
    ],
    asociacion: "Repartir juego a las bandas en transiciones rápidas o filtrar pase vertical rasante.",
    presion: "Cerrar con astucia las líneas de pase centrales haciendo sombra táctica.",
    heatmapCoords: { cx: 50, cy: 82, r: 24, grad: "glowCentros" },
    coords: { x: 50, y: 82 },
    pivoteCoords: { x: 50, y: 56 },
    centralCoords: { x: 32, y: 104 },
    rivalCoords: { x: 50, y: 68 }
  },
  'Mediocampista Ofensivo': {
    rol: "Enganche Creativo & Habilitador",
    pautas: [
      "Espacio de intervalos: Flote entre el mediocampito y la defensa rival libre de marca.",
      "Urgencia ofensiva: Reciba perfilado para disparar desde la medialuna o asistir.",
      "Desmarques libres: Rompa la línea arrastrando centrales para abrir pasillos."
    ],
    asociacion: "Buscar paredes extremas en la frontal del área o pelotas entrelíneas de gol.",
    presion: "Liderar la presión de bloque medio, hostigando la distribución del mediocentro rival.",
    heatmapCoords: { cx: 50, cy: 56, r: 24, grad: "glowEspecialidades" },
    coords: { x: 50, y: 56 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 50, y: 24 },
    rivalCoords: { x: 50, y: 44 }
  },
  'Mediocampista Externo Izquierdo': {
    rol: "Volante Conector de Banda & Equilibrio",
    pautas: [
      "Lectura amplia: Ayude al lateral zurdo y conecte veloz con el extremo.",
      "Repliegue inteligente: Bascule protegiendo el carril central si el balón va al otro lado.",
      "Circulación constante: Ayude al equipo a cambiar de orientación de ataque rápido."
    ],
    asociacion: "Buscar entregas cortas de descompresión o pelotas flotadas a bandas.",
    presion: "Presionar la recepción del lateral rival obligándole a dividir el esférico.",
    heatmapCoords: { cx: 20, cy: 70, r: 22, grad: "glowCentros" },
    coords: { x: 20, y: 70 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 14, y: 92 },
    rivalCoords: { x: 24, y: 50 }
  },
  'Mediocampista Externo Derecho': {
    rol: "Volante Conector de Banda & Equilibrio",
    pautas: [
      "Banda diestra: Sostenga marcas y asista al lateral derecho en coberturas rápidas.",
      "Alternar ritmo: Frene la jugada para circular de cara o inyecte velocidad explosiva.",
      "Cierre interior: Cubra pasillos si el mediocentro defensivo salta a presionar."
    ],
    asociacion: "Combinar con el extremo por linea o pivotar with el volante recuperador.",
    presion: "Ahogar el circuito de pase del central rival tapando su volante interno de recepción.",
    heatmapCoords: { cx: 80, cy: 70, r: 22, grad: "glowCentros" },
    coords: { x: 80, y: 70 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 86, y: 92 },
    rivalCoords: { x: 76, y: 50 }
  },
  'Extremo Izquierdo': {
    rol: "Puñal de Banda & Desequilibrio Zurdo",
    pautas: [
      "Retar en banda: Busque el mano a mano abierto y encare en velocidad diagonal hacia portería.",
      "Ataque al fondo: Gane la espalda de su lateral utilizando su velocidad de sprint.",
      "Goleador lejano: Agregue sorpresa atacando el segundo poste de cabeza o volea."
    ],
    asociacion: "Centros rasos venenosos para el punta o paredes agresivas con el mediocentro ofensivo.",
    presion: "Tapar salida limpia de los centrales tapando el pase cómodo al lateral contrario.",
    heatmapCoords: { cx: 18, cy: 38, r: 22, grad: "glowEspecialidades" },
    coords: { x: 18, y: 38 },
    pivoteCoords: { x: 50, y: 56 },
    centralCoords: { x: 14, y: 92 },
    rivalCoords: { x: 15, y: 24 }
  },
  'Extremo Derecho': {
    rol: "Puñal de Banda & Desequilibrio Diestro",
    pautas: [
      "Desborde por banda: Pegarse a la cal para estirar el ancho del bloque rival.",
      "Diagonal cortante: Enganche hacia adentro si la marca le regala su pierna fuerte.",
      "Sprint preciso: Utilice amagos rápidos para desequilibrar en espacios ínfimos."
    ],
    asociacion: "Descargar pases rasos al punta o colgar pelotas templadas en área de cabeza.",
    presion: "Asfixiar inmediatamente la salida vertical del lateral rival mordiendo los toques de marca.",
    heatmapCoords: { cx: 82, cy: 38, r: 22, grad: "glowEspecialidades" },
    coords: { x: 82, y: 38 },
    pivoteCoords: { x: 50, y: 56 },
    centralCoords: { x: 86, y: 92 },
    rivalCoords: { x: 85, y: 24 }
  },
  'Mediapunta': {
    rol: "Delantero de Apoyo & Segunda Punta",
    pautas: [
      "Flotar libre: Caiga a bandas para arrastrar centrales y destrabar bloqueos.",
      "Gatillo inmediato: Remate al primer poste o tire de media distancia al menor hueco.",
      "Búsqueda de rebotes: Anticipe rechaces defensivos merodeando el área grande."
    ],
    asociacion: "Combinación de balones aéreos al desmarque, o paredes rápidas para disparar libres.",
    presion: "Dificultar la primera salida limpia de centrales hostigando sus perfiles.",
    heatmapCoords: { cx: 50, cy: 42, r: 22, grad: "glowEspecialidades" },
    coords: { x: 50, y: 42 },
    pivoteCoords: { x: 50, y: 56 },
    centralCoords: { x: 50, y: 24 },
    rivalCoords: { x: 66, y: 30 }
  },
  'Delantero Centro': {
    rol: "El Matador del Área & Referente",
    pautas: [
      "Fijación de centrales: Use su juego físico de espaldas para retener marcas en zona caliente.",
      "Desmarque de instinto: Finja desmarcarse al segundo palo para atacar el primero de primera.",
      "Eficacia implacable: Defina con brevedad, a un solo toque e impactando los postes bajos."
    ],
    asociacion: "Retener balones de espaldas con solidez para dar tiempo al arribo de extremos.",
    presion: "Asfixiar constantemente al portero en salida y taponar pases internos del central lento.",
    heatmapCoords: { cx: 50, cy: 24, r: 20, grad: "glowDelantero" },
    coords: { x: 50, y: 24 },
    pivoteCoords: { x: 50, y: 56 },
    centralCoords: { x: 82, y: 38 },
    rivalCoords: { x: 42, y: 15 }
  }
};

// Custom simple parser to render Markdown styling in elegant React elements
function MiniMarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-3 text-neutral-300 text-xs sm:text-sm font-sans leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={idx} className="text-sm sm:text-base font-black text-white uppercase tracking-tight mt-5 mb-2 border-b border-white/[0.04] pb-1 flex items-center gap-2 text-emerald-400">
              <span className="w-1.5 h-3 bg-emerald-500 rounded-sm inline-block" />
              {trimmed.replace(/^###\s*/, '')}
            </h4>
          );
        }
        if (trimmed.startsWith('##')) {
          return (
            <h3 key={idx} className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-6 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {trimmed.replace(/^##\s*/, '')}
            </h3>
          );
        }
        if (trimmed.startsWith('#')) {
          return (
            <h2 key={idx} className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-6 mb-3 text-emerald-400">
              {trimmed.replace(/^#\s*/, '')}
            </h2>
          );
        }

        // Bullet items
        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
          const content = trimmed.replace(/^[\*\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
              <span className="flex-1 font-light">{parseBoldText(content)}</span>
            </div>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('>')) {
          return (
            <blockquote key={idx} className="border-l-2 border-emerald-500 bg-emerald-500/5 p-3 rounded-r-xl my-4 italic text-neutral-200 text-xs sm:text-sm">
              {parseBoldText(trimmed.replace(/^>\s*/, ''))}
            </blockquote>
          );
        }

        // Horizontal Rule
        if (trimmed === '---') {
          return <hr key={idx} className="border-white/[0.06] my-5" />;
        }

        // Empty lines
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Plain line fallback with inline bold rendering
        return (
          <p key={idx} className="font-light pl-0.5">
            {parseBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Utility to parse safety **bolding** strings into React elements
function parseBoldText(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-extrabold text-white">{part}</strong>;
    }
    return part;
  });
}

export default function AICoachSection({ profile, logs }: AICoachSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile-analyser' | 'direct-chat' | 'tactical-chalkboard'>('profile-analyser');

  // Interactive Pitch Blackboard state
  const [selectedBlackboardNode, setSelectedBlackboardNode] = useState<'me' | 'midfielder' | 'defense' | 'rival_gk'>('me');
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);

  // Quiz game State
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<{
    pregunta: string;
    opciones: string[];
    explicaciones: string[];
    correcto: number;
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<{ attempts: number; correct: number }>(() => {
    const saved = localStorage.getItem('camino_coach_quiz_score');
    return saved ? JSON.parse(saved) : { attempts: 0, correct: 0 };
  });

  // Keep track of score
  useEffect(() => {
    localStorage.setItem('camino_coach_quiz_score', JSON.stringify(quizScore));
  }, [quizScore]);

  // Analysis State
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(() => {
    return localStorage.getItem('camino_coach_advice');
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('camino_coach_chat');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `¡Hola, ${profile?.nombre || 'atleta'}! Llegaste al vestuario de El Míster. ⚽ Aquí no hay espacio para la vagancia ni titubeos. Pregúntame lo que quieras sobre posicionamiento táctico en banda, trabajos físicos explosivos, cómo ganarte el respeto del vestuario o lidiar con el pánico escénico antes de jugar un derbi de primera división. ¿A por todas hoy?`,
        timestamp: Date.now()
      }
    ];
  });
  const [inputVal, setInputVal] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync state to local storage
  useEffect(() => {
    if (analysisReport) {
      localStorage.setItem('camino_coach_advice', analysisReport);
    }
  }, [analysisReport]);

  useEffect(() => {
    localStorage.setItem('camino_coach_chat', JSON.stringify(chatMessages));
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Aggregated technical statistics
  const totalGoles = logs.reduce((sum, log) => sum + (log.goles || 0), 0);
  const totalAsistencias = logs.reduce((sum, log) => sum + (log.asistencias || 0), 0);
  const totalPartidos = logs.filter((log) => log.tipo === 'Partido').length;
  const totalEntrenamientos = logs.filter((log) => log.tipo === 'Entrenamiento').length;

  // Streak logic (safely fetch streak)
  let currentStreak = 0;
  try {
    const savedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    if (savedLogs.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let streakCount = 0;
      let checkDate = todayStr;
      
      const logDates = new Set(savedLogs.map(l => l.fecha));
      
      if (!logDates.has(todayStr) && !logDates.has(yesterdayStr)) {
        currentStreak = 0;
      } else {
        if (!logDates.has(todayStr) && logDates.has(yesterdayStr)) {
          checkDate = yesterdayStr;
        }
        
        while (logDates.has(checkDate)) {
          streakCount++;
          const dateObj = new Date(checkDate + 'T12:00:00');
          dateObj.setDate(dateObj.getDate() - 1);
          checkDate = dateObj.toISOString().split('T')[0];
        }
        currentStreak = streakCount;
      }
    }
  } catch (err) {
    currentStreak = 0;
  }

  // Handle Request Analysis
  const triggerCoachAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await fetch('/api/coach/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          stats: {
            totalPartidos,
            totalEntrenamientos,
            totalGoles,
            totalAsistencias,
            streak: currentStreak
          },
          recentLogs: logs.slice(0, 5)
        }),
      });

      const data = await res.json();
      if (data?.success) {
        setAnalysisReport(data.coachAdvice);
      } else {
        throw new Error('Fallback report error');
      }
    } catch (err) {
      console.warn('Network issue or offline server, using fallback analysis', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Fetch Soccer IQ Tactical Scenario Quiz
  const fetchNewQuiz = async () => {
    setQuizLoading(true);
    setSelectedAnswer(null);
    try {
      const res = await fetch('/api/coach/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });
      const data = await res.json();
      if (data?.success && data?.quiz) {
        // Enforce that correct answer is ALWAYS index 0 (Option A)
        const adjustedQuiz = {
          ...data.quiz,
          correcto: 0
        };
        setCurrentQuiz(adjustedQuiz);
      } else {
        throw new Error('Could not parse quiz from backend');
      }
    } catch (err) {
      console.warn('Network issue or offline server, using offline quiz mock', err);
      // Hardcoded high-quality quiz mock as robust fallback
      setCurrentQuiz({
        pregunta: `Míster: "Chaval, vamos empatando 1-1 en el minuto 82. Recibes el balón como ${profile?.posicion || 'Jugador de Campo'} en tres cuartos de cancha, tu marcador viene encimado buscando el contacto físico y tienes a tu extremo desmarcado picando en diagonal por la banda contraria. ¿Qué decides?"`,
        opciones: [
          "Aguantar la embestida física de espaldas, girar para perfilar tu pierna fuerte, y filtrar un pase bombeado con rosca hacia el extremo que pica libre.",
          "Apoyarte de primera intención con el pivote defensivo que viene de cara, descargando el esférico y pidiendo la devolución inmediata en pared lineal.",
          "Hacer amago de pase, dar una media vuelta explosiva para sacudirte la marca por potencia, e intentar un disparo de empeine desde fuera del área."
        ],
        explicaciones: [
          "¡Soberbio! Eso es visión periférica de primera división chaval. Poner a correr al compañero a la espalda del lateral mata cualquier repliegue tardío.",
          "Es correcto para proteger la posesión del balón, pero a estas alturas del encuentro, hay que arriesgar en zona de tres cuartos para dañar.",
          "Demasiado individualista. La zaga rival está compactada e intentar un tiro incómodo es regalarles el contraataque final."
        ],
        correcto: 0
      });
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizAnswer = (idx: number) => {
    if (selectedAnswer !== null || !currentQuiz) return;
    setSelectedAnswer(idx);
    
    const isCorrect = idx === currentQuiz.correcto;
    setQuizScore(prev => ({
      attempts: prev.attempts + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));
  };

  // Handle Chat message sending
  const handleSendMessage = async (textToSend?: string) => {
    const msgText = textToSend || inputVal.trim();
    if (!msgText || sendingMessage) return;

    if (!textToSend) {
      setInputVal('');
    }

    const newUserMsg: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: msgText,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, newUserMsg]);
    setSendingMessage(true);

    try {
      const nextMessages = [...chatMessages, newUserMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-8),
          profile
        })
      });

      const data = await res.json();
      if (data?.success) {
        setChatMessages(prev => [...prev, {
          id: 'msg-' + Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now()
        }]);
      } else {
        throw new Error('Failed to get companion chat reply');
      }
    } catch (err) {
      console.warn('Network chat error, replying in offline mode', err);
      // Offline DT speech fallback
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: 'msg-' + Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: `Mira, chaval. Estamos analizando pizarrones en el vestuario sin conexión. Pero te diré una cosa sobre tu pregunta de "${msgText}": en un partido caliente, con el césped húmedo y el público apretando, lo único que te salva es la fe ciega en tu pierna hábil (${profile?.piernaHabil || 'bien entrenada'}) y la madurez táctica de jugar a dos toques de cara. ¡A meterle intensidad!`,
          timestamp: Date.now()
        }]);
      }, 1000);
    } finally {
      setSendingMessage(false);
    }
  };

  // Recommended queries for the direct chat
  const chatQueries = [
    { text: '¿Cómo aumentar explosividad en sprint corto de 10m?', label: 'Sprints ⚡' },
    { text: '¿Qué comer de carbohidratos 24 horas antes de competir?', label: 'Dieta 🍏' },
    { text: '¿Cómo perfilarme óptimamente para recibir y girar en un toque?', label: 'Perfilado ⚽' },
    { text: '¿Cómo convencer a un cazatalentos en menos de 15 minutos en cancha?', label: 'Scouts 🏆' }
  ];

  // Map coordinates for beautiful football pitch overlays
  const currentPosDetails: PositionDetails = DETALLES_POR_POSICION[profile.posicion] || {
    rol: "Futbolista Plurifuncional",
    pautas: [
      "Visión polivalente: Adáptese continuamente a la demarcación que requiera la pizarra.",
      "Disciplina: Guarde distancia táctica equilibrada.",
      "Liderazgo: Comunique movimientos con señas claras."
    ],
    asociacion: "Asegurar circulación de pases con triangulaciones rápidas al tercer hombre.",
    presion: "Cerrar con fiereza trayectorias internas del esférico coordinando repliegues.",
    heatmapCoords: { cx: 50, cy: 56, r: 22, grad: "glowCentros" },
    coords: { x: 50, y: 56 },
    pivoteCoords: { x: 50, y: 82 },
    centralCoords: { x: 32, y: 104 },
    rivalCoords: { x: 50, y: 30 }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header Banner & Floating Coach Profile */}
      <div className="glass border-emerald-500/20 p-5 relative overflow-hidden">
        {/* Decorative Grid Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-full bg-black border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 relative shrink-0">
              <span className="text-emerald-400 font-extrabold italic text-sm leading-none" style={{ fontFamily: '"Arial Black", sans-serif' }}>MR</span>
              <span className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>
            
            <div className="text-left">
              <h2 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 leading-none">
                El Míster <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">AI Coach</span>
              </h2>
              <p className="text-xs text-neutral-400 font-light mt-1.5 leading-tight">
                Instrucciones técnicas de máxima exigencia para dar el salto al profesionalismo.
              </p>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-full self-stretch sm:self-auto justify-center">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-neutral-300 font-semibold font-mono">IQ de Cancha:</span>
            <span className="text-emerald-400 font-black font-mono">
              {quizScore.attempts > 0 ? `${Math.round((quizScore.correct / quizScore.attempts) * 100)}%` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Selection Tabs */}
      <div className="bg-neutral-900 p-1 rounded-2xl border border-white/[0.04] grid grid-cols-3 gap-1.5 max-w-lg mx-auto">
        <button
          onClick={() => setActiveSubTab('profile-analyser')}
          className={`py-2 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'profile-analyser'
              ? 'bg-neutral-850 text-emerald-400 font-extrabold shadow-sm'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Clipboard className="w-3.5 h-3.5 shrink-0" />
          Análisis Táctico
        </button>
        <button
          onClick={() => setActiveSubTab('direct-chat')}
          className={`py-2 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'direct-chat'
              ? 'bg-neutral-850 text-emerald-400 font-extrabold shadow-sm'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          Charla Técnica
        </button>
        <button
          onClick={() => setActiveSubTab('tactical-chalkboard')}
          className={`py-2 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'tactical-chalkboard'
              ? 'bg-neutral-850 text-emerald-400 font-extrabold shadow-sm'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Target className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          Pizarrón Táctico
        </button>
      </div>

      {/* 3. Tab Contents Layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          {activeSubTab === 'profile-analyser' ? (
            <div className="space-y-5">
              {!analysisReport && !loadingAnalysis ? (
                // Welcome / Trigger Analysis Box
                <div className="glass p-8 text-center border-dashed border-emerald-500/20 space-y-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-md">
                    <Trophy className="w-6.5 h-6.5" />
                  </div>
                  
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">
                      Obtén tu Devolución Profesional
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-light">
                      El Míster analizará tu ficha técnica, peso, club, posición de **{profile.posicion}**, y rendimiento de tus entrenamientos registrados para brindarte ejercicios y tips específicos de primera división.
                    </p>
                  </div>

                  <button
                    onClick={triggerCoachAnalysis}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] transition rounded-2xl text-xs font-black uppercase tracking-widest text-neutral-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-neutral-950" />
                    Solicitar Análisis del Míster
                  </button>
                </div>
              ) : loadingAnalysis ? (
                // Loading State
                <div className="glass p-12 text-center space-y-6">
                  <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider animate-pulse">
                      EL MÍSTER ESTÁ REVISANDO TUS PLANILLAS...
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-light max-w-xs mx-auto leading-relaxed">
                      Calculando IMC, auditando tu constancia de entrenamientos y diseñando 3 entrenamientos especializados para tu demarcación de **{profile.posicion}**.
                    </p>
                  </div>
                </div>
              ) : (
                // Display Analysis Report
                <div className="space-y-4">
                  <div className="glass p-5 sm:p-6 shadow-xl space-y-5 relative">
                    {/* Upper decorative absolute marker */}
                    <div className="absolute top-4 right-5 flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10 font-bold font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      Informe Listo
                    </div>

                    <MiniMarkdownRenderer text={analysisReport || ''} />

                    {/* Bottom action button */}
                    <div className="border-t border-white/[0.05] pt-4 mt-5 flex justify-end">
                      <button
                        onClick={triggerCoachAnalysis}
                        className="py-2.5 px-4 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.05] transition rounded-xl text-[10px] uppercase font-black tracking-wider flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                        Refrescar Análisis
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeSubTab === 'direct-chat' ? (
            // Chat View
            <div className="glass p-4 sm:p-5 flex flex-col h-[460px] relative overflow-hidden">
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 pb-4 max-h-[300px]">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-emerald-500 text-neutral-950 font-medium rounded-tr-xs' 
                          : 'bg-white/[0.03] text-neutral-250 border border-white/[0.04] rounded-tl-xs'
                      }`}>
                        
                        {!isUser && (
                          <span className="block text-[9px] uppercase font-black text-emerald-400/80 tracking-widest mb-1.5 font-mono">
                            Míster
                          </span>
                        )}

                        <p className="font-light whitespace-pre-line text-left">{msg.content}</p>
                        
                        {/* Time stamp */}
                        <span className={`block text-[8px] mt-1.5 text-right font-mono ${isUser ? 'text-neutral-950/60' : 'text-neutral-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips Carousel */}
              <div className="border-t border-white/[0.04] pt-3.5 pb-2">
                <span className="block text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1.5 pl-1.5 text-left">
                  Preguntas Recomendadas para {profile.posicion}:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-[64px] overflow-y-auto">
                  {chatQueries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q.text)}
                      disabled={sendingMessage}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition text-[10px] text-neutral-300 font-bold shrink-0 cursor-pointer flex items-center gap-1 active:scale-[0.98]"
                    >
                      <Zap className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input controls */}
              <div className="pt-2">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Escribe tu duda de posicionamiento o táctica chaval..."
                    disabled={sendingMessage}
                    className="flex-1 bg-black border border-white/[0.07] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none placeholder-neutral-500"
                  />
                  
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || sendingMessage}
                    className={`p-2.5 rounded-xl transition shrink-0 flex items-center justify-center cursor-pointer ${
                      inputVal.trim() && !sendingMessage
                        ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 hover:scale-[1.03] active:scale-[0.97]'
                        : 'bg-white/[0.02] text-neutral-500 border border-white/[0.04]'
                    }`}
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    ) : (
                      <Send className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Strategic Guidelines Card (simplified as requested by user) */}
              <div className="glass p-5 sm:p-6 text-left border-emerald-500/15 space-y-4">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                      Tu Posición: {profile.posicion}
                    </span>
                    <h4 className="text-base font-extrabold text-white uppercase tracking-tight mt-2.5">
                      {currentPosDetails.rol}
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block font-medium font-mono">
                      Directrices de Oro del Míster:
                    </span>
                    <div className="space-y-2 pl-1">
                      {currentPosDetails.pautas.map((p, pIdx) => (
                        <div key={pIdx} className="text-xs sm:text-sm font-light text-neutral-300 leading-relaxed flex items-start gap-2.5">
                          <span className="text-emerald-400 font-mono font-bold mt-0.5">{pIdx + 1}.</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs font-light text-neutral-400 italic pt-2 border-t border-white/[0.04]">
                    * Tus habilidades de <strong className="text-white">{profile.habilidad1}</strong> y <strong className="text-white">{profile.habilidad2}</strong> potencian de forma directa estas directrices.
                  </p>
                </div>
              </div>


              {/* ---------------- FUTBOL IQ TEST PANEL ---------------- */}
              <div className="glass p-5 text-left border-emerald-500/15 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">
                        Examen de IQ de Cancha de El Míster
                      </h3>
                      <p className="text-[10px] text-neutral-400">
                        Demuestra tu madurez para tomar decisiones profesionales al límite.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-900 border border-white/5 py-1 px-2.5 rounded-lg">
                    Rendimiento: {quizScore.correct} / {quizScore.attempts}
                  </span>
                </div>

                {!currentQuiz && !quizLoading ? (
                  // Intial state
                  <div className="py-8 text-center space-y-4 max-w-sm mx-auto">
                    <p className="text-xs text-neutral-300 leading-relaxed font-light">
                      El Míster preparará una situación táctica realista e intensa de partido basada en tu posición certificada de <strong>{profile.posicion}</strong>. ¿Qué decisión tomarías bajo presión extrema?
                    </p>
                    <button
                      onClick={fetchNewQuiz}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition text-xs font-black uppercase text-neutral-950 tracking-widest rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      Generar Situación de Juego
                    </button>
                  </div>
                ) : quizLoading ? (
                  // Loading Quiz Scenario
                  <div className="py-12 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-neutral-400 font-mono uppercase animate-pulse">
                      EL MÍSTER ESTÁ DIBUJANDO EN EL PIZARRÓN...
                    </p>
                  </div>
                ) : (
                  // Render Quiz Scenario
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Scenario card */}
                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3.5">
                      <HelpCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-neutral-250 font-light leading-relaxed">
                        {currentQuiz?.pregunta}
                      </p>
                    </div>

                    {/* Multiple choices */}
                    <div className="space-y-2.5">
                      {currentQuiz?.opciones.map((op, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === currentQuiz.correcto;
                        const isEvaluated = selectedAnswer !== null;

                        let styleClasses = "border-white/5 bg-white/[0.02] hover:border-white/10 text-neutral-300";
                        if (isEvaluated) {
                          if (isCorrect) {
                            styleClasses = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold";
                          } else if (isSelected) {
                            styleClasses = "border-rose-500 bg-rose-500/10 text-rose-400 font-bold";
                          } else {
                            styleClasses = "opacity-45 border-white/5 bg-transparent text-neutral-500";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isEvaluated}
                            onClick={() => handleSelectQuizAnswer(idx)}
                            className={`w-full py-3.5 px-4 rounded-xl border text-left transition duration-250 text-xs sm:text-sm flex justify-between items-center ${styleClasses} ${!isEvaluated ? 'cursor-pointer active:scale-[0.99]' : ''}`}
                          >
                            <span className="flex-1 pr-2">{op}</span>
                            
                            {isEvaluated && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {isEvaluated && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Explanation card */}
                    {selectedAnswer !== null && currentQuiz && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border text-xs sm:text-sm text-left flex gap-3 ${
                          selectedAnswer === currentQuiz.correcto
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-neutral-250'
                            : 'bg-rose-500/10 border-rose-500/20 text-neutral-250'
                        }`}
                      >
                        <span className="text-xl shrink-0">
                          {selectedAnswer === currentQuiz.correcto ? '⚽' : '📣'}
                        </span>
                        <div>
                          <h4 className="font-extrabold uppercase tracking-wider text-xs mb-1">
                            {selectedAnswer === currentQuiz.correcto ? '¡Así de Claro, Chaval!' : '¡¿Pero Qué Haces, Hombre?!'}
                          </h4>
                          <p className="font-light italic text-xs leading-relaxed text-neutral-300">
                            "{currentQuiz.explicaciones[selectedAnswer]}"
                          </p>
                          
                          <button
                            type="button"
                            onClick={fetchNewQuiz}
                            className="mt-3 py-1.5 px-3 bg-white/5 hover:bg-white/10 active:scale-95 text-[10px] font-black uppercase text-neutral-300 hover:text-white border border-white/10 transition rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 text-emerald-400" />
                            Analizar Siguiente Jugada
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
