import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY holds no value. Running in safety mock mode.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Endpoint for AI Coach Technical and Physical Analysis
app.post('/api/coach/analyze', async (req, res) => {
  const { profile, stats, recentLogs } = req.body;

  const client = getAiClient();
  if (!client) {
    // Return high-quality localized soccer coach advice if API key is not configured or offline
    return res.json({
      success: true,
      mode: 'offline',
      coachAdvice: `### 📋 Análisis Inicial del Míster

**Ficha de Jugador:** ${profile?.nombre || 'Crack'} · **Posición:** ${profile?.posicion || 'Polivalente'} · **Club:** ${profile?.club || 'Formación'}

¡Hola atleta! Veo que registraste **${stats?.totalPartidos || 0} partidos** y **${stats?.totalEntrenamientos || 0} entrenamientos**. Estás construyendo las bases, pero el profesionalismo exige obsesión por los detalles.

---

### 🧬 Condición Física & Consejos Nutricionales
* **Perfil:** ${profile?.altura || 170} cm y ${profile?.peso || 70} kg. 
* **Consejo:** Para un **${profile?.posicion || 'futbolista de tu posición'}**, el enfoque debe de ser la **potencia explosiva** y la agilidad. Incrementa el consumo de carbohidratos complejos (pasta, arroz integral, avena) 24 horas antes de los partidos para llenar los depósitos de glucógeno y prioriza la proteína magra para la reconstrucción de fibras musculares.

---

### ⚽ Ejercicios de Campo Recomendados (Específicos para ${profile?.posicion || 'tu rol'})
1. **Carreras de Intervalos de Alta Intensidad (Fartlek):** 5 series de 100m al 90%, regresando trotando. Emula el ritmo explosivo de un partido.
2. **Definición / Entrega en Velocidad bajo Presión:** Haz 10 descargas a un toque y corre a recibir entre conos para perfilarte hacia el arco.
3. **Coordinación y Agilidad con Escalera:** Trabaja cambios de ritmo y giros rápidos enfocado en fortalecer tus tobillos y rodillas.

---

### 🥋 Mentalidad de Primera
> "El talento te abre las puertas, pero el carácter te mantiene en la élite." 
No te saltes ningún entrenamiento. Sigue sumando de forma constante en tu racha diaria y tu oportunidad en primera llegará.`
    });
  }

  try {
    const skillsList = profile?.habilidades?.join(', ') || `${profile?.hability1 || 'Velocidad'}, ${profile?.hability2 || 'Pase'}`;
    const recentActivityText = recentLogs && recentLogs.length > 0
      ? recentLogs.map((l: any) => `- Fecha: ${l.fecha}, Tipo: ${l.tipo}, Goles: ${l.goles}, Asistencias: ${l.asistencias}, Reflexión/Observación: "${l.reflexion || 'Sin reflexión'}"`).join('\n')
      : 'Sin registros de actividad recientes todavía.';

    const prompt = `
Actúa como "El Míster": un director técnico, scout de talentos y mentor de fútbol profesional español con un tono serio, exigente, sumamente motivador, paternalista pero directo, obsesionado con la disciplina, la táctica y la constancia de los atletas en formación que aspiran a la Primera División.

Vas a realizar un análisis completo del siguiente futbolista de acuerdo a su ficha técnica y rendimiento histórico para ayudarlo a alcanzar su máximo potencial.

=== FICHA DEL JUGADOR ===
- Nombre: ${profile?.nombre || 'Jugador'}
- Club Actual: ${profile?.club || 'Club Amateur'}
- Edad: ${profile?.edad || 'No especificada'} años
- Estatura: ${profile?.altura || 'No especificada'} cm
- Peso: ${profile?.peso || 'No especificado'} kg
- Pierna Hábil: ${profile?.piernaHabil || 'No especificada'}
- Posición Táctica Principal: ${profile?.posicion || 'Jugador de Campo'}
- Destrezas Clave Autodeclaradas: ${skillsList}

=== ESTADÍSTICAS ACUMULADAS ===
- Partidos Jugados: ${stats?.totalPartidos || 0}
- Entrenamientos Realizados: ${stats?.totalEntrenamientos || 0}
- Racha de Constancia Actual: ${stats?.streak || 0} días
- Goles Totales: ${stats?.totalGoles || 0}
- Asistencias Totales: ${stats?.totalAsistencias || 0}

=== REGISTROS DIARIOS RECIENTES ===
${recentActivityText}

Por favor, estructura tu devolución de manera clara y amena usando formato Markdown exactamente con los siguientes encabezados de segundo o tercer nivel:

1. **📋 Análisis Táctico & Rendimiento**: Evalúa su posición táctica (${profile?.posicion}) de acuerdo a sus destrezas autodeclaradas, su edad, y sus estadísticas (goles/asistencias). Di qué está haciendo bien y qué área táctica es urgente refinar para encajar en el fútbol profesional actual de esa demarcación.
2. **🧬 Condición Física & Consejos Nutricionales**: Analiza su relación estatura-peso y calcula idealmente su IMC. Brinda recomendaciones de hidratación, alimentación específica (hidratos de carbono, grasas saludables, proteínas) y tiempos de descanso óptimos antes y después de competencias duras.
3. **⚽ Ejercicios de Campo Recomendados**: Propón 3 tareas o ejercicios sumamente de campo o gimnasio que el jugador pueda hacer solo o con un compañero, detallando: Objetivo, Estructura y Repeticiones. Los ejercicios deben ser 100% lógicos para la demarcación: un central necesita pases largos, cabezazos y anticipo; un extremo necesita desborde, sprint y centros, etc.
4. **🥋 Mentalidad de Primera**: Escribe un párrafo de alta intensidad mental. Inspíralo a no romper su racha de constancia de ${stats?.streak || 0} días, recuérdale el rigor que requiere llegar a Primera División, y dale un lema imbatible.

Usa jerga futbolística realista (ej: "perfilado", "anticipo", "repliegue", "transición ofensiva", "bloque bajo", "presión alta", "romper líneas"). Sé constructivo pero firme. Tu respuesta debe estar completamente en español castellano y bien maquetada.
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      mode: 'online',
      coachAdvice: response.text,
    });
  } catch (err: any) {
    console.error('Error in AI Coach analysis API:', err);
    return res.status(500).json({
      success: false,
      error: 'Error al comunicarse con el Míster AI.',
    });
  }
});

// 2. Interactive Chat with the Soccer Assistant
app.post('/api/coach/chat', async (req, res) => {
  const { messages, profile } = req.body;

  const client = getAiClient();
  if (!client) {
    // Fallback response inside the chat
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    return res.json({
      success: true,
      mode: 'offline',
      reply: `Hola, soy tu Míster. En este momento estoy analizando pizarrones en el pizarrón táctico fuera de línea, pero te diré algo sobre tu pregunta: "${lastUserMsg}". 
Como futbolista de la posición **${profile?.posicion || 'Jugador'}**, la disciplina diaria lo es todo. Entrena duro, cuida lo que comes y no te rindas. ¡A por la Primera!`
    });
  }

  try {
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // System instruction setting up the strict soccer coach persona
    const systemInstruction = `
Eres "El Míster", un prestigioso y exigente director técnico español, entrenador asistente de divisiones formativas y mentor de futbolistas jóvenes que sueñan con saltar al fútbol profesional de primera división.
Tu tono es el de un veterano del vestuario: usas modismos del fútbol español e iberoamericano, eres directo, desafiante, pero profundamente sabio y paterno. 
No dejas pasar que jueguen sin intensidad. Te enfocas siempre en la disciplina táctica, el sacrificio físico, el descanso científico y la inteligencia mental para soportar la presión del público y los cazatalentos.
El usuario se llama ${profile?.nombre || 'Atleta'}, juega como ${profile?.posicion || 'futbolista'} en el club ${profile?.club || 'su equipo local'} y tiene una pierna hábil ${profile?.piernaHabil || 'indefinida'}. 
Mantén las respuestas concisas (menos de 180 palabras), llenas de energía competitiva y consejos futbolísticos reales de campo. Usa metáforas del balón, el césped y los 90 minutos de juego.
`;

    const contents = [...formattedMessages];

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return res.json({
      success: true,
      mode: 'online',
      reply: response.text,
    });
  } catch (err: any) {
    console.error('Error in AI Coach chat API:', err);
    return res.status(500).json({
      success: false,
      error: 'Error al conectar con la mente del Míster.',
    });
  }
});

// 3. Dynamic Technical Quiz Endpoint
app.post('/api/coach/quiz', async (req, res) => {
  const { profile } = req.body;

  const client = getAiClient();
  if (!client) {
    return res.json({
      success: true,
      mode: 'offline',
      quiz: {
        pregunta: `Como ${profile?.posicion || 'Jugador de Campo'}, vas conduciendo en velocidad y te sale al cruce el último defensor central perfilado hacia tu pierna hábil (${profile?.piernaHabil || 'Diestro'}). ¿Cuál es tu decisión inmediata chaval?`,
        opciones: [
          "Frenar en seco, enganchar hacia afuera buscando tu perfil para centrar o rematar con rosca.",
          "Amagar el tiro a portería y acelerar en diagonal hacia la pierna débil del central para rebasarlo físicamente.",
          "Tocar el balón de espaldas hacia el mediocampista de apoyo que viene de frente libre de marca."
        ],
        explicaciones: [
          "Frenar y enganchar hacia tu perfil fuerte aprovecha tu destreza fuerte, pero dale más velocidad chaval, que el lateral rival te va a comer la espalda.",
          "¡Soberbio! Es la jugada que busco en mis extremos: amagar el chut, reventarle la cadera al central y definir cruzado con clase.",
          "Es una opción prudente para salvaguardar la posesión, pero en los últimos tres cuartos de campo quiero rebeldía y uno contra uno."
        ],
        correcto: 1
      }
    });
  }

  try {
    const skillsList = profile?.habilidades?.join(', ') || `${profile?.habilidade1 || 'Pase'}, ${profile?.habilidades2 || 'Velocidad'}`;
    const prompt = `
Actúa como "El Míster" (director técnico español de primera división, severo, sabio y motivador).
Genera una situación de juego en un partido real, tácticamente desafiante, específica para el perfil de este jugador:
- Nombre: ${profile?.nombre || 'Jugador'}
- Posición Táctica Principal: ${profile?.posicion || 'Jugador de Campo'}
- Pierna Hábil: ${profile?.piernaHabil || 'No especificada'}
- Destrezas Clave: ${skillsList}
- Edad: ${profile?.edad || 'No especificada'} años

Crea una sola pregunta y exactamente 3 opciones de respuestas múltiples basadas en situaciones tácticas reales de un partido (por ejemplo: presión de salida, marcar en córner, romper el fuera de juego, cobertura defensiva, o definición en inferioridad numérica).
Una de las opciones debe ser tácticamente excelente (la correcta), una regular (buena pero conservadora) y otra incorrecta (un error táctico común de novato de tu división).

Debes devolver obligatoriamente un objeto JSON que coincida con el siguiente esquema:
{
  "pregunta": "Descripción breve e intensa (de 2-3 líneas) de la jugada del partido en la que se encuentra el jugador, terminando con una pregunta directa de qué debe hacer.",
  "opciones": [
    "Opción A: Acción detallada",
    "Opción B: Acción detallada",
    "Opción C: Acción detallada"
  ],
  "explicaciones": [
    "Breve explicación (máximo 20 palabras) en tono de El Míster para la opción A.",
    "Breve explicación (máximo 20 palabras) en tono de El Míster para la opción B.",
    "Breve explicación (máximo 20 palabras) en tono de El Míster para la opción C."
  ],
  "correcto": 0, 1 o 2 (el índice de la opción tácticamente correcta)
}
La redacción debe estar en español castellano y contener jerga de vestuario realista: "chaval", "zagueros", "pivote", "perfilado", "bascular", "repliegue", "desmarque", "segundo palo" etc.
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pregunta: { type: Type.STRING },
            opciones: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explicaciones: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correcto: { type: Type.INTEGER }
          },
          required: ['pregunta', 'opciones', 'explicaciones', 'correcto']
        }
      }
    });

    const parsedQuiz = JSON.parse(response.text.trim());
    return res.json({
      success: true,
      mode: 'online',
      quiz: parsedQuiz
    });
  } catch (err: any) {
    console.error('Error generating AI coach quiz:', err);
    // Secure fallback
    return res.json({
      success: true,
      mode: 'offline',
      quiz: {
        pregunta: `Como ${profile?.posicion || 'Jugador de Campo'}, vas conduciendo en velocidad y te sale al cruce el último defensor central perfilado hacia tu pierna hábil (${profile?.piernaHabil || 'Diestro'}). ¿Cuál es tu decisión inmediata chaval?`,
        opciones: [
          "Frenar en seco, enganchar hacia afuera buscando tu perfil para centrar o rematar con rosca.",
          "Amagar el tiro a portería y acelerar en diagonal hacia la pierna débil del central para rebasarlo físicamente.",
          "Tocar el balón de espaldas hacia el mediocampista de apoyo que viene de frente libre de marca."
        ],
        explicaciones: [
          "Frenar y enganchar hacia tu perfil fuerte aprovecha tu destreza fuerte, pero dale más velocidad chaval, que el lateral rival te va a comer la espalda.",
          "¡Soberbio! Es la jugada que busco en mis extremos: amagar el chut, reventarle la cadera al central y definir cruzado con clase.",
          "Es una opción prudente para salvaguardar la posesión, pero en los últimos tres cuartos de campo quiero rebeldía y uno contra uno."
        ],
        correcto: 1
      }
    });
  }
});

// Serve static assets in production or use Vite middleware in development
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
