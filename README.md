# ⚽ Camino a Primera

> **Camino a Primera** es una plataforma web completa de seguimiento, análisis estadístico y gamificación diseñada exclusivamente para futbolistas amateurs y en formación. Permite registrar entrenamientos y partidos, visualizar métricas de rendimiento (goles, asistencias, atajadas, vallas invictas, ritmo cardíaco y distancias), trazar metas a corto, mediano y largo plazo, y ganar medallas por consistencia y rendimiento deportivo.

---

## 🛠️ Tecnologías Utilizadas

La aplicación ha sido construida bajo estándares modernos de desarrollo full-stack, priorizando la velocidad, la consistencia visual y la seguridad:

*   **Frontend & UI Avanzada:**
    *   **React 19** con arquitectura basada en componentes funcionales modernos y Hooks personalizados.
    *   **Vite 6** como motor ultrarrápido de compilación y bundling de cliente.
    *   **TypeScript** como lenguaje tipado estricto para asegurar la robustez de los modelos de datos en tiempo de desarrollo.
    *   **Tailwind CSS v4** para un diseño adaptativo y estilizado de alto impacto visual ("Midnight Slate Theme") con acentos verde esmeralda y contrastes optimizados.
    *   **Motion** (del ecosistema `motion/react`) para dotar de transiciones fluidas, animaciones de micro-interacción y efectos de entrada orgánicos.
    *   **Lucide React** para un catálogo estilizado de iconos geométricos de alta fidelidad.

*   **Backend & Servidor Host:**
    *   **Node.js & Express** para proveer APIs y servir el bundle de producción sin latencia excesiva.
    *   **Esbuild** y **TSX** integrados en la tubería de compilación para preprocesar y empaquetar el backend de manera ágil hacia formatos eficientes (`dist/server.cjs`).

*   **Persistencia, Base de Datos y Autenticación:**
    *   **Supabase (PostgreSQL):** Base de datos relacional para resguardar la información de usuario, historiales de partidos y metas.
    *   **PostgreSQL Row Level Security (RLS):** Emplea políticas de aislamiento estricto por `auth.uid()` para evitar que un jugador pueda acceder o adulterar los datos de otro.
    *   **Dual-Storage Persistence (LocalStorage + Postgres Cloud Sync):** Arquitectura local-first para que la falta de base de datos o de conexión de red no interrumpa la experiencia del atleta.

---

## 🏗️ Arquitectura y Flujos de Diseño Clave

El core técnico de la aplicación se rige por tres pilares de experiencia de usuario y resiliencia:

### 1. Motor de Sincronización Inteligente (Local-to-Cloud)
Para evitar la frustración de perder datos debido a configuraciones de red, la app implementa un flujo adaptativo:
*   Si el usuario no ha iniciado sesión o la base de datos central en la nube no está inicializada, la aplicación opera bajo **LocalStorage** local.
*   En el momento de realizar el login/registro, el sistema detecta que hay "datos huérfanos" locales y despliega de manera proactiva un banner de invitación y un **Modal de Sincronización Inteligente** con un **Copiador de Código SQL automatizado**. Esto asiste al usuario para crear o migrar sus tablas en Supabase (agregando dinámicamente columnas como `atajadas`, `valla_invicta` o `timestamp` mediante `ALTER TABLE ADD COLUMN IF NOT EXISTS` sin poner en riesgo sus registros anteriores).

### 2. Estructura de Datos Unificada
El dominio del software está modelado estrictamente en `/src/types.ts`:
*   `PlayerProfile`: Almacena la identidad de juego del jugador (club, edad, altura, peso, pierna hábil, posición táctica y habilidades fundamentales).
*   `ActivityLog`: Registra los hitos cuantitativos y cualitativos de cada actividad (clasificados como "Entrenamiento" o "Partido", goles, asistencias, atajadas para porteros, vallas invictas, reflexiones emocionales e indicadores de reloj inteligente como pulso medio BMP y kilómetros recorridos).
*   `DynamicGoal`: Listado interactivo de metas jerárquicas según plazo temporal (Corto, Mediano y Largo Plazo).

### 3. Monetización Sutil Listas para AdSense (Non-Blocking UX)
Se integró de manera quirúrgica un espacio fijo denominado `#ad-container` en el fondo absoluto de la aplicación:
*   **Contención no intrusiva:** El contenedor tiene un acabado semitransparente oscuro y sutil que armoniza perfectamente con el estilo visual «Midnight Slate», con un identificador de etiqueta `"Anuncio"`.
*   **Prevención de oclusión de UI:** El cuerpo del documento se expande dinámicamente agregando un espaciado de seguridad inferior (`pb-[115px]` en la experiencia activa de entrenamiento y `pb-[70px]` en flujos de onboarding), asegurando que los botones cruciales como el panel de navegación flotante del jugador y el botón de "Registro" sigan siendo accesibles al tacto/clic en todo momento sin solapamientos incómodos.

---

## 🤖 Desarrollo Colaborativo con Inteligencia Artificial

Este repositorio es el resultado de un ciclo iterativo y sinérgico entre un desarrollador y un **Agente de IA de Google AI Studio**. La IA no solo actuó como un autocompletador, sino que resolvió desafíos arquitectónicos complejos:

1.  **Diseño Seguro de Esquema de Datos:** La IA co-creó la estructura SQL original con políticas RLS robustas y generó las interfaces de TypeScript alineadas para mitigar desfases de tipado.
2.  **Resolución de Conflictos de Caché de Supabase:** Al surgir un error de sincronización recurrente (`Could not find the 'atajadas' column of 'logs' in the schema cache`), la IA intervino encapsulando el problema, aislando el estado local y construyendo un asistente visual interactivo integrado que provee instrucciones claras y los comandos SQL específicos para complementar las tablas existentes del usuario en producción mediante un parche no destructivo.
3.  **Refactorización del Layout React-Tailwind:** El proceso de integración de futuros bloques de anuncios requirió el rediseño dimensional en varias capas. La IA recalculó el posicionamiento absoluto y el flex-layout de la barra de navegación persistente inferior (`nav`) para elevarlo con exactitud por sobre el nuevo bloque publicitario, garantizando simetría perfecta tanto en smartphones como en equipos de escritorio.
4.  **Algoritmo de Streaks y Racha:** Se diseñó el sistema `streakHelper.ts` que calcula la persistencia de entrenamientos filtrando marcas duplicadas en un mismo día cronológico y evaluando interrupciones de racha de manera precisa para premiar la constancia real del jugador amateur.

---

## 🚀 Puesta en Marcha en Entornos Locales

Sigue estos pasos sencillos para clonar y ejecutar el entorno de desarrollo:

1.  **Instalar Dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar Variables de Entorno (.env):**
    Crea tu archivo local y adhiere tus credenciales de base de datos de Supabase si deseas sincronización en la nube:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
    ```
3.  **Lanzar Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```
    El servidor enlazará la salida en tu localhost (puerto `3000`).

4.  **Compilación para Producción (Build):**
    ```bash
    npm run build
    npm run start
    ```
    Este comando compila los estáticos con optimizaciones de última generación de Vite y empaqueta el servidor unificado de Node con Esbuild en `dist/server.cjs`.

---
*«El camino a primera no es solo talento, es disciplina, registro y superación constante.»* ⚽🏆
