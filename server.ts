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
      ? recentLogs.map((l: any) => {
          return `- Fecha: ${l.fecha}, Tipo: ${l.tipo}, Goles: ${l.goles}, Asistencias: ${l.asistencias}, Reflexión/Observación: "${l.reflexion || 'Sin reflexión'}"`;
        }).join('\n')
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
2. **🧬 Condición Física & Consejos Nutricionales**: Analiza su relación estatura-peso y calcula idealmente su IMC. Brinda recomendaciones de hidratación, alimentación específica (hidratos de carbono, grasas saludables, proteínas) y tiempos de descanso óptimos antes y después de competencias duras para asegurar su asombroso rendimiento neuromuscular y evitar lesiones.
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
    // Elegant, formal and neutral offline fallback response with intelligent keyword matching
    const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase().trim();
    let reply = '';

    if (lastUserMsg.includes('reflejo') || lastUserMsg.includes('reaccion') || lastUserMsg.includes('reacción')) {
      reply = `Hola, ${profile?.nombre || 'Deportista'}. Para mejorar sus reflejos y tiempo de reacción, le sugiero las siguientes prácticas estructuradas:

1. **Entrenamiento con pelota de reacción:** Utilice una pelota de rebote irregular para agilizar la agudeza visual y la captura física de reflejos rápidos.
2. **Pared de rebote rápido:** Realice pases continuos e intensos a un toque contra un muro plano a corta distancia para forzar la toma de decisión veloz con el balón.
3. **Estímulos de colores interactivos:** Entrene tocando conos de colores específicos o reaccionando a señales auditivas espontáneas de su compañero.
4. **Coordinación óculo-manual de soporte:** Trabaje con pelotas de tenis rebotando en ángulos oblicuos e imprevisibles.
5. **Luces reactivas cognitivas:** Utilice sistemas de pulsadores de luz aleatoria para mejorar la respuesta neural instantánea.

Para un desarrollo óptimo, le recomiendo comenzar alternando constantemente entre los métodos **1 y 5** semanalmente.`;
    } else if (lastUserMsg.includes('comida') || lastUserMsg.includes('dieta') || lastUserMsg.includes('nutricion') || lastUserMsg.includes('comer') || lastUserMsg.includes('alimentacion') || lastUserMsg.includes('regimen') || lastUserMsg.includes('nutrición') || lastUserMsg.includes('alimentación')) {
      reply = `Hola, ${profile?.nombre || 'Deportista'}. Una nutrición deportiva estructurada y formal es fundamental para maximizar su potencia y recuperación en la posición de **${profile?.posicion || 'Jugador'}**:

1. **Carbohidratos complejos pre-partido:** Consuma arroz integral, avena o pasta integral 3 horas antes del juego para mantener estables los niveles de glucógeno.
2. **Proteínas magras de absorción rápida:** Consuma carnes magras, pescados o proteínas vegetales durante la primera hora post-entrenamiento para reconstruir tejidos.
3. **Hidratación celular constante:** Beba entre 2 y 3 litros de agua limpia diariamente para prevenir calambres y estiramientos musculares dolorosos.
4. **Grasas saludables:** Incorpore porciones óptimas de aguacate, aceite de oliva virgen y frutos secos ricos en ácidos grasos antiinflamatorios.
5. **Supresión de ultraprocesados:** Evite alimentos ricos en azúcares libres, harinas refinadas o fritos pesados que ralentizan la asimilación energética.

Le sugiero dar máxima prioridad a los puntos **1 y 3** para asegurar que mantenga una resistencia insuperable durante la totalidad del encuentro.`;
    } else if (lastUserMsg.includes('fisico') || lastUserMsg.includes('físico') || lastUserMsg.includes('gimnasio') || lastUserMsg.includes('entrenar') || lastUserMsg.includes('fuerza') || lastUserMsg.includes('resistencia') || lastUserMsg.includes('rendimiento') || lastUserMsg.includes('potencia')) {
      reply = `Hola, ${profile?.nombre || 'Deportista'}. Para el desarrollo integral de sus capacidades físicas de cara al fútbol profesional de alto rendimiento, incorpore las siguientes pautas:

1. **Sentadillas búlgaras y zancadas pliométricas:** Excelentes ejercicios unilaterales para fortalecer flexores, cuádriceps y proteger la rótula de giros bruscos.
2. **Saltos verticales y horizontales en cajón:** Desarrolle potencia explosiva muscular clave para la aceleración y los sprints iniciales de desmarque.
3. **Estabilización de zona media (Core):** Ejercite planchas dinámicas y rotativas para ganar solidez en choques físicos con oponentes directos.
4. **Planificación de intervalos variables (Fartlek):** Alternar carreras explosivas rápidas con ritmos anaeróbicos controlados recreando fielmente las transiciones del fútbol.
5. **Peso muerto rumano formal:** Crucial para el reclutamiento motor y fortalecimiento de isquiotibiales para aminorar riesgos de desgarro.

Le sugiero concentrarse principalmente en los puntos **1 y 4** para progresar a un ritmo aeróbico explosivo idóneo.`;
    } else {
      reply = `Hola, ${profile?.nombre || 'Deportista'}. En este momento la IA de rendimiento se encuentra analizando directrices en formato de almacenamiento local fuera de línea, pero le brindo la siguiente sugerencia formal en relación a su consulta:

Como futbolista enfocado en la posición de **${profile?.posicion || 'Jugador'}**, el entrenamiento diario con un método estructurado, un descanso biológico reparador de 8 horas y la constancia de su diario deportivo son los pilares para aspirar a clubes profesionales de primera línea. Mantenga un régimen sobrio y enfocado en pulir detalles. ¡Siga sumando constancia en el campo!`;
    }

    return res.json({
      success: true,
      mode: 'offline',
      reply: reply
    });
  }

  try {
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // System instruction setting up the formal soccer performance coach persona
    const systemInstruction = `
Eres "Tu Coach Técnico de Rendimiento", un profesional respetuoso, serio, analítico, sumamente educado, formal y neutral, experto en ciencias del deporte y táctica de fútbol de primera división.
Tu tono es elegante, directo, sumamente constructivo y motivador, similar al de un metodólogo o preparador deportivo de alto rendimiento.
No utilices bajo ninguna circunstancia modismos excesivamente informales, frases coloquiales o jerga pesada como "chaval", "Míster", "colega", "mola", "flipar", "pesao", "zagueros", etc.
Debes dirigirte de manera respetuosa y formal al usuario ("Usted"), felicitándolo de manera medida por su compromiso táctico y dándole explicaciones ordenadas y claras.
El usuario se llama ${profile?.nombre || 'Atleta'}, juega de ${profile?.posicion || 'futbolista'} en el club ${profile?.club || 'su equipo local'} y tiene una pierna hábil ${profile?.piernaHabil || 'indefinida'}.
Mantén las respuestas concisas (menos de 180 palabras), estructuradas, preferiblemente con listas ordenadas muy limpias y cargadas de sugerencias prácticas de campo.
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
      error: 'Error al conectar con la mente de su Coach Técnico de Rendimiento.',
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
        pregunta: `Como ${profile?.posicion || 'Jugador de Campo'}, va conduciendo en velocidad y le sale al cruce el último defensor central perfilado hacia su pierna hábil (${profile?.piernaHabil || 'Diestro'}). ¿Cuál es su decisión inmediata para resolver la jugada?`,
        options: [
          "Amagar el tiro a portería y acelerar en diagonal hacia la pierna débil del central para rebasarlo físicamente.",
          "Frenar en seco, enganchar hacia afuera buscando tu perfil para centrar o rematar con rosca.",
          "Tocar el balón de espaldas hacia el mediocampista de apoyo que viene de frente libre de marca."
        ],
        explicaciones: [
          "Excelente decisión táctica. El amago de remate desestabiliza la postura corporal del defensor y la aceleración en diagonal desborda su pierna débil.",
          "Es una opción válida de desmarque, pero frena la velocidad ofensiva global permitiendo el repliegue de los zagueros rivales.",
          "Una alternativa conservadora que resguarda el balón, pero en los últimos tres cuartos de campo es óptimo buscar el desborde o duelo individual."
        ],
        correcto: 0
      }
    });
  }

  try {
    const skillsList = profile?.habilidades?.join(', ') || `${profile?.habilidade1 || 'Pase'}, ${profile?.habilidades2 || 'Velocidad'}`;
    const gameScenarios = [
      "fase de transición ofensiva de alta velocidad por las bandas tras recuperación de balón",
      "situación en bloque bajo contra rival con posesión asfixiante buscando el desmarque de ruptura",
      "disputa en zona intermedia con presión intensa de dos defensores rivales encimando",
      "tiro libre indirecto ofensivo o jugada de pizarrón ensayada de balón detenido",
      "recepción de espaldas al arco rival bajo acoso físico del central zaguero",
      "transición rápida coordinada tras robo en mitad de cancha con campo abierto para centrar o rematar",
      "desborde individual o pase en diagonal contra una última línea adelantada rival"
    ];
    const randomScenario = gameScenarios[Math.floor(Math.random() * gameScenarios.length)];

    const prompt = `
Actúa como "Tu Coach Técnico de Rendimiento": un preparador, scout deportivo de proyección y mentor experto en fútbol formal y ciencias aplicadas al deporte. El tono debe ser altamente analítico, neutral, educado, respetuoso e inspirador, dirigiéndose de "Usted".
Genera una situación de juego en un partido real, tácticamente desafiante, específica para la fase de juego: "${randomScenario}" para el perfil de este jugador:
- Nombre: ${profile?.nombre || 'Jugador'}
- Posición Táctica Principal: ${profile?.posicion || 'Jugador de Campo'}
- Pierna Hábil: ${profile?.piernaHabil || 'No especificada'}
- Destrezas Clave: ${skillsList}
- Edad: ${profile?.edad || 'No especificada'} años

Crea una sola pregunta y exactamente 3 opciones de respuestas múltiples basadas en situaciones tácticas reales de un partido.
Una de las opciones debe ser tácticamente excelente (la correcta), una regular (buena pero conservadora) y otra incorrecta (un error táctico de novato).

Debes devolver obligatoriamente un objeto JSON que coincida con el siguiente esquema:
{
  "pregunta": "Descripción breve e intensa (de 2-3 líneas) de la jugada del partido en la que se encuentra el jugador, terminando con una pregunta directa de qué debe hacer.",
  "opciones": [
    "Opción A: Acción detallada (LA MEJOR DECISIÓN TÁCTICA)",
    "Opción B: Acción detallada (acción mediocre/conservadora)",
    "Opción C: Acción detallada (un error táctico de posición)"
  ],
  "explicaciones": [
    "Breve explicación (máximo 20 palabras) formal de felicitación técnica para la opción A.",
    "Breve explicación (máximo 20 palabras) indicando por qué es un recurso conservador para la opción B.",
    "Breve explicación (máximo 20 palabras) señalando el error técnico táctico de posición para la opción C."
  ],
  "correcto": 0
}
La opción A (índice 0) debe ser obligatoriamente la mejor respuesta tácticamente en cada escenario creado.
La redacción debe estar en español castellano formal, sobrio y neutral. Evita totalmente modismos ásperos o coloquiales como "chaval", "Míster", etc. Usa términos tácticos claros y profesionales como "perfilación", "anticipo", "repliegue defensivo", "transición ofensiva", "bloque bajo", "presión alta", "desmarque de ruptura".
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
    
    // Original correct index is 0 according to the instructions
    const originalCorrectIdx = typeof parsedQuiz.correcto === 'number' ? parsedQuiz.correcto : 0;
    
    const options = parsedQuiz.opciones || [];
    const explanations = parsedQuiz.explicaciones || [];
    
    // Fisher-Yates shuffle
    const indices = [0, 1, 2];
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const shuffledOptions = indices.map(idx => options[idx] || "Opción");
    const shuffledExplanations = indices.map(idx => explanations[idx] || "Explicación");
    const newCorrectIdx = indices.indexOf(originalCorrectIdx);

    parsedQuiz.opciones = shuffledOptions;
    parsedQuiz.explicaciones = shuffledExplanations;
    parsedQuiz.correcto = newCorrectIdx !== -1 ? newCorrectIdx : 0;

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
        pregunta: `Como ${profile?.posicion || 'Jugador de Campo'}, vas conduciendo en velocidad y te sale al acoso el último defensa zaguero perfilado hacia su pierna hábil (${profile?.piernaHabil || 'Diestro'}). ¿Cuál es su decisión inmediata para resolver técnicamente la posesión?`,
        opciones: [
          "Ejecutar un amago dinámico hacia el perfil interno para definir con presteza de borde externo.",
          "Frenar la progresión y buscar asistencia de cara con el lateral cooperativo libre de marca.",
          "Intentar desborde sobre el perfil fuerte del defensor arriesgando el cruce biomecánico."
        ],
        explicaciones: [
          "Excelente decisión. Desestabiliza el balance corporal de la línea defensiva y genera un ángulo nítido de cara a portería.",
          "Es un recurso defensivo maduro de seguridad, aunque reduce el dinamismo en zona de finalización de jugada.",
          "Opción arriesgada. Propende a la interceptación limpia del central rival debido al retraso en el desmarque."
        ],
        correcto: 0
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
