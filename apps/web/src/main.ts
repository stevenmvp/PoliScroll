import "./styles.css";
import "./modules/arcade/arcade.css";
import { mountArcade, unmountArcade } from "./modules/arcade/mount";
import { getAllGames } from "./modules/arcade/games/registry";
import type { EducationalLevel } from "./domain/identity";
import type { AuthSession, UserRole } from "./domain/identity";
import {
  beginPasswordReset,
  confirmRegistration,
  configureAmplify,
  finishPasswordReset,
  getSession,
  login,
  logout,
  register,
} from "./services/amplify";
import {
  createActivitySession,
  ensureUserProfile,
  finishActivitySession,
  recordActivityEvent,
} from "./services/data";
import {
  createCampusEvent,
  createCourse,
  createTutoringOffer,
  bookTutoring,
  createChatConversation,
  createGradeRecord,
  createNewsArticle,
  createStudyGroup,
  dashboardRoleTitle,
  getDashboardSummary,
  askTutor,
  findStudyGroupByCode,
  joinStudyGroup,
  enrollInCourse,
  listCampusEvents,
  listCourses,
  listCourseEnrollments,
  listAuditLogs,
  listActivitySessions,
  listGradeRecords,
  listNewsArticles,
  listNotifications,
  listStudyGroups,
  listTutoringOffers,
  listTutoringBookings,
  updateTutoringBookingStatus,
  listUserProfiles,
  updateUserProfileStatus,
  deleteUserProfile,
  archiveNewsArticle,
  listArcadeGameConfigs,
  upsertArcadeGameConfig,
  markChatRead,
  sendChatMessage,
  type DashboardSummary,
} from "./services/platform";

interface FeedItem {
  id: string;
  title: string;
  description: string;
  meta: string;
  tag: string;
  available?: boolean;
  createdByMe?: boolean;
}

interface ModuleData {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  tone: string;
  metric: string;
  total: string;
  action: string;
  items: FeedItem[];
}

interface EducationalGame {
  id: string;
  title: string;
  description: string;
  mechanic: string;
  skills: string;
  difficulty: "Inicial" | "Intermedio" | "Avanzado";
  icon: string;
  topics: string[];
  levels?: EducationalLevel[];
  sourceGame: string;
  sourcePath: string;
  originalMechanic: string;
}

interface ActivityGroup {
  id: string;
  title: string;
  description: string;
  icon: string;
  mode: string;
  topic?: string;
  stages: { title: string; source: string; icon: string }[];
}

interface Question {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

const educationalLevels: EducationalLevel[] = ["Primaria", "Secundaria", "Universitaria"];
const gameTopics = [
  "Huesos del cuerpo humano",
  "Matemáticas",
  "Biología",
  "Ingeniería",
  "Procesos administrativos",
  "Física",
  "Química",
  "Programación",
  "Economía",
  "Comunicación",
  "Medio ambiente",
  "Ciencias",
  "Historia",
  "Lenguaje",
  "Bienestar",
];

type SourceGame = Omit<EducationalGame, "topics" | "levels">;

const sourceGames: SourceGame[] = [
  ["Memory Game", "memory-game", "Memoria", "Encuentra todas las parejas antes de terminar.", "▦"],
  ["Logic-Chain", "logic-chain", "Construcción lógica", "Conecta objetos y ejecuta una simulación.", "⌘"],
  ["Pattern Pulse", "pattern-pulse", "Secuencia", "Repite una secuencia que crece en cada ronda.", "⌁"],
  ["Number-Pop", "number-pop", "Reflejos numéricos", "Pulsa los números válidos antes de que desaparezcan.", "＋"],
  ["Timing-Bar", "timing-bar", "Precisión", "Detén la barra móvil dentro de la zona objetivo.", "━"],
  ["odd-one-out", "odd-one-out", "Diferencias", "Identifica el elemento distinto en una cuadrícula.", "◎"],
  ["Simon-Says-Game", "simon-says", "Memoria auditiva", "Repite luces y sonidos en el mismo orden.", "♫"],
  ["Color Sequence Memory", "color-sequence-memory", "Memoria visual", "Memoriza y reproduce colores.", "◈"],
  ["Catch_The_Dot", "catch-the-dot", "Reacción", "Atrapa el punto que cambia de posición.", "●"],
  ["Connect-four", "connect-four", "Estrategia", "Conecta cuatro fichas antes que el rival.", "▤"],
  ["Dodge-the-blocks", "dodge-the-blocks", "Evasión", "Esquiva bloques en movimiento.", "↗"],
  ["EchoBeats", "echo-beats", "Ritmo", "Repite patrones rítmicos.", "♫"],
  ["Emoji Match Game", "emoji-match", "Asociación", "Relaciona pares de emojis.", "☻"],
  ["Frogger", "frogger", "Cruce", "Cruza obstáculos hasta la meta.", "↟"],
  ["Hidden object", "hidden-object", "Búsqueda", "Encuentra los objetos escondidos.", "⌕"],
  ["LexiQuest", "lexiquest", "Palabras", "Resuelve retos de vocabulario.", "Aa"],
  ["Luma Maze", "luma-maze", "Laberinto", "Encuentra la salida con guía luminosa.", "⌖"],
  ["Memory matrix", "memory-matrix", "Matriz", "Recuerda las celdas iluminadas.", "▦"],
  ["memory-match", "memory-match", "Parejas", "Voltea cartas y encuentra coincidencias.", "◇"],
  ["Number Nexus", "number-nexus", "Conexión numérica", "Une números siguiendo una regla.", "∞"],
  ["Number Cruncher", "number-cruncher", "Cálculo", "Resuelve operaciones bajo presión.", "÷"],
  ["code-breaker-mini", "code-breaker", "Código", "Descifra una combinación con pistas.", "#"],
  ["quick-math-battle-quiz", "quick-math-battle", "Duelo matemático", "Responde más rápido que el tiempo.", "⚡"],
  ["quiz-game", "quiz-game", "Trivia", "Selecciona la respuesta correcta.", "?"],
  ["race-track", "race-track", "Carrera", "Avanza por una pista evitando errores.", "↠"],
  ["maze-runner", "maze-runner", "Laberinto", "Llega a la salida por el camino correcto.", "⌖"],
  ["math-chain", "math-chain", "Cadena matemática", "Completa una secuencia de operaciones.", "∑"],
  ["math-sprint", "math-sprint", "Velocidad matemática", "Acumula aciertos en tiempo limitado.", "↗"],
  ["math-duel", "math-duel", "Duelo", "Resuelve primero la operación planteada.", "⚔"],
  ["balance-scale", "balance-scale", "Equilibrio", "Equilibra cantidades en una balanza.", "⚖"],
  ["bubble-shooter", "bubble-shooter", "Tiro y combinación", "Agrupa burbujas para despejar el tablero.", "○"],
  ["block-stack", "block-stack", "Apilamiento", "Coloca bloques sin perder estabilidad.", "▤"],
  ["bridge-puzzle", "bridge-puzzle", "Puente lógico", "Crea una ruta funcional.", "⌒"],
  ["circuit-connect", "circuit-connect", "Circuitos", "Conecta componentes para completar un circuito.", "⌁"],
  ["color-switch-maze", "color-switch-maze", "Cambio de color", "Navega un laberinto por reglas de color.", "◉"],
  ["concentration_game", "concentration", "Concentración", "Encuentra pares con pocos intentos.", "◌"],
  ["energy-flow", "energy-flow", "Flujo", "Dirige energía hasta el destino.", "↝"],
  ["escape_game", "escape-game", "Escape", "Resuelve pistas para salir.", "⇱"],
  ["flag_guess", "flag-guess", "Identificación", "Reconoce banderas correctamente.", "⚑"],
  ["geography-explorer", "geography-explorer", "Exploración geográfica", "Ubica lugares en un mapa.", "⌖"],
  ["hangman", "hangman", "Palabra oculta", "Descubre una palabra con intentos limitados.", "Aa"],
  ["history-timeline", "history-timeline", "Cronología", "Ordena hechos en el tiempo.", "◷"],
  ["lights-out", "lights-out", "Interruptores", "Apaga todas las luces con la menor cantidad de movimientos.", "◐"],
  ["logic-grid", "logic-grid", "Cuadrícula lógica", "Descarta opciones hasta resolver el tablero.", "▦"],
  ["match-pair", "match-pair", "Emparejamiento", "Relaciona elementos equivalentes.", "◇"],
  ["minesweeper", "minesweeper", "Deducción", "Descubre celdas sin activar minas.", "✦"],
  ["pattern-match", "pattern-match", "Patrones", "Completa una configuración visual.", "⌁"],
  ["pipe-mania", "pipe-mania", "Tuberías", "Conecta segmentos para crear un flujo.", "⌘"],
  ["portal-logic", "portal-logic", "Portales", "Elige el recorrido lógico hasta la salida.", "◉"],
  ["Tower of Hanoi", "tower-of-hanoi", "Torres", "Mueve discos respetando las reglas.", "△"],
].map(([sourceGame, id, mechanic, description, icon]): SourceGame => ({
  id, sourceGame, sourcePath: `recursos/mini-js-games-hub-main/games/${sourceGame}/script.js`, title: sourceGame, description, mechanic, originalMechanic: mechanic, skills: mechanic, difficulty: "Intermedio", icon,
}));

const educationalGames: EducationalGame[] = sourceGames.map((game) => ({
  ...game,
  topics: gameTopics,
  levels: educationalLevels,
}));

const activityGroups: ActivityGroup[] = [
  { id: "trivia", title: "Reto relámpago", description: "Seis desafíos de decisión rápida con preguntas breves.", icon: "?", mode: "Trivia", topic: "Huesos del cuerpo humano", stages: [{ title: "Arranque rápido", source: "Quiz Game", icon: "?" }, { title: "Duelo matemático", source: "Math Duel", icon: "⚡" }, { title: "Código veloz", source: "Code Breaker", icon: "#" }, { title: "Cronología", source: "History Timeline", icon: "◷" }, { title: "Banderas", source: "Flag Guess", icon: "⚑" }, { title: "Jefe de trivia", source: "Quiz Game", icon: "★" }] },
  { id: "memoria", title: "Archivo de memoria", description: "Seis retos de parejas, secuencias y concentración.", icon: "▦", mode: "Memoria", stages: [{ title: "Parejas", source: "Memory Game", icon: "▦" }, { title: "Matriz", source: "Memory Matrix", icon: "▦" }, { title: "Simón", source: "Simon Says", icon: "♫" }, { title: "Secuencia", source: "Pattern Pulse", icon: "⌁" }, { title: "Color", source: "Color Sequence Memory", icon: "◈" }, { title: "Concentración", source: "Concentration", icon: "◇" }] },
  { id: "organizar", title: "Orden y velocidad", description: "Organiza, conecta y completa antes de que se agote el tiempo.", icon: "⌘", mode: "Organización", stages: [{ title: "Cadena", source: "Logic-Chain", icon: "⌘" }, { title: "Tuberías", source: "Pipe Mania", icon: "⌘" }, { title: "Circuito", source: "Circuit Connect", icon: "⌁" }, { title: "Puente", source: "Bridge Puzzle", icon: "⌒" }, { title: "Flujo", source: "Energy Flow", icon: "↝" }, { title: "Equilibrio", source: "Balance Scale", icon: "⚖" }] },
  { id: "reaccion", title: "Reacción total", description: "Velocidad, ritmo, precisión y reflejos.", icon: "⚡", mode: "Reacción", stages: [{ title: "Timing", source: "Timing-Bar", icon: "━" }, { title: "Caza el punto", source: "Catch The Dot", icon: "●" }, { title: "Número pop", source: "Number-Pop", icon: "＋" }, { title: "Eco rítmico", source: "EchoBeats", icon: "♫" }, { title: "Esquiva", source: "Dodge the Blocks", icon: "↗" }, { title: "Sprint", source: "Math Sprint", icon: "⚡" }] },
  { id: "ruta", title: "Rutas y decisiones", description: "Elige caminos, evita obstáculos y llega a la meta.", icon: "⌖", mode: "Decisión", stages: [{ title: "Laberinto", source: "Maze Runner", icon: "⌖" }, { title: "Portales", source: "Portal Logic", icon: "◉" }, { title: "Frogger", source: "Frogger", icon: "↟" }, { title: "Carrera", source: "Race Track", icon: "↠" }, { title: "Cambio de color", source: "Color Switch Maze", icon: "◉" }, { title: "Escape", source: "Escape Game", icon: "⇱" }] },
  { id: "maestros", title: "Desafío maestro", description: "Seis juegos elaborados de estrategia, tablero y resolución.", icon: "★", mode: "Maestro", stages: [{ title: "Torre de Hanoi", source: "Tower of Hanoi", icon: "△" }, { title: "Buscaminas", source: "Minesweeper", icon: "✦" }, { title: "Cuatro en línea", source: "Connect Four", icon: "▤" }, { title: "Luces fuera", source: "Lights Out", icon: "◐" }, { title: "Cuadrícula lógica", source: "Logic Grid", icon: "▦" }, { title: "Estrategia final", source: "Block Stack", icon: "▤" }] },
];

const questionsByTopic: Record<string, Question[]> = {
  "Huesos del cuerpo humano": [
    { prompt: "¿Cuál es el hueso más largo del cuerpo humano?", options: ["Fémur", "Radio", "Esternón", "Clavícula"], answer: 0, explanation: "El fémur está en el muslo y es el hueso más largo y resistente del cuerpo." },
    { prompt: "¿Qué estructura protege directamente al cerebro?", options: ["La pelvis", "El cráneo", "La escápula", "La tibia"], answer: 1, explanation: "El cráneo rodea y protege el cerebro frente a impactos." },
    { prompt: "¿Qué huesos forman la caja torácica junto con el esternón?", options: ["Las costillas", "Las falanges", "Las vértebras lumbares", "Los metatarsos"], answer: 0, explanation: "Las costillas y el esternón forman la caja torácica que protege órganos como el corazón y los pulmones." },
    { prompt: "¿Qué función cumple principalmente la médula ósea?", options: ["Producir células sanguíneas", "Digestionar alimentos", "Regular la visión", "Mover los pulmones"], answer: 0, explanation: "La médula ósea produce células sanguíneas dentro de muchos huesos." },
    { prompt: "¿Qué articulación conecta el fémur con la pelvis?", options: ["El codo", "La cadera", "El tobillo", "La muñeca"], answer: 1, explanation: "La cabeza del fémur encaja en la cavidad de la pelvis para formar la cadera." },
  ],
  Biología: [
    { prompt: "¿Qué organelo contiene la información genética de la célula?", options: ["El núcleo", "La membrana", "El ribosoma", "La vacuola"], answer: 0, explanation: "En las células eucariotas, el núcleo contiene la mayor parte del ADN." },
    { prompt: "¿Qué relación beneficia a ambas especies?", options: ["Mutualismo", "Parasitismo", "Competencia", "Depredación"], answer: 0, explanation: "En el mutualismo, ambas especies obtienen un beneficio." },
  ],
  Ingeniería: [
    { prompt: "¿Qué etapa convierte una necesidad en requisitos verificables?", options: ["Diseño", "Definición del problema", "Desmontaje", "Decoración"], answer: 1, explanation: "Definir el problema permite precisar necesidades y requisitos antes de diseñar." },
    { prompt: "¿Qué principio busca mejorar un proceso eliminando desperdicios?", options: ["Lean", "Aleatorio", "Estático", "Decorativo"], answer: 0, explanation: "Lean busca entregar valor reduciendo actividades que no aportan al resultado." },
  ],
  "Procesos administrativos": [
    { prompt: "¿Qué función establece objetivos y acciones para alcanzarlos?", options: ["Planeación", "Improvisación", "Archivo", "Auditoría"], answer: 0, explanation: "La planeación define objetivos, recursos, responsables y acciones." },
    { prompt: "¿Qué documento permite seguir tareas, responsables y fechas?", options: ["Matriz de seguimiento", "Portada", "Glosario", "Bibliografía"], answer: 0, explanation: "Una matriz de seguimiento hace visible el avance y las responsabilidades." },
  ],
  Física: [
    { prompt: "¿Qué magnitud mide la oposición de un cuerpo al cambio de movimiento?", options: ["Masa", "Temperatura", "Voltaje", "Frecuencia"], answer: 0, explanation: "La masa representa la inercia de un cuerpo." },
    { prompt: "Si aumenta la misma fuerza aplicada a una masa, ¿qué ocurre con la aceleración?", options: ["Aumenta", "Desaparece", "Siempre se duplica", "No cambia nunca"], answer: 0, explanation: "Según la segunda ley de Newton, la aceleración aumenta con la fuerza neta." },
  ],
  Química: [
    { prompt: "¿Qué indica el pH de una sustancia?", options: ["Su acidez o basicidad", "Su masa", "Su color", "Su volumen"], answer: 0, explanation: "El pH expresa la acidez o basicidad de una disolución." },
    { prompt: "¿Qué partículas tienen carga negativa?", options: ["Electrones", "Protones", "Neutrones", "Núcleos"], answer: 0, explanation: "Los electrones tienen carga eléctrica negativa." },
  ],
  Programación: [
    { prompt: "¿Qué estructura repite instrucciones mientras se cumple una condición?", options: ["Un ciclo", "Una constante", "Un comentario", "Un archivo"], answer: 0, explanation: "Un ciclo permite repetir un bloque de instrucciones bajo una regla." },
    { prompt: "¿Qué estructura almacena varios valores relacionados?", options: ["Un arreglo", "Un booleano", "Un operador", "Un retorno"], answer: 0, explanation: "Un arreglo organiza varios valores en una misma colección." },
  ],
  Economía: [
    { prompt: "¿Qué ocurre cuando la demanda supera a la oferta, manteniendo lo demás constante?", options: ["Tiende a subir el precio", "Siempre baja el precio", "Desaparece la demanda", "No ocurre nada"], answer: 0, explanation: "Una demanda mayor que la oferta suele generar presión al alza sobre el precio." },
    { prompt: "¿Qué representa un presupuesto?", options: ["Una planificación de ingresos y gastos", "Una opinión", "Un inventario visual", "Una contraseña"], answer: 0, explanation: "El presupuesto anticipa recursos disponibles y cómo se distribuirán." },
  ],
  Comunicación: [
    { prompt: "¿Qué elemento adapta el mensaje a quien lo recibe?", options: ["La audiencia", "El margen", "La portada", "La firma"], answer: 0, explanation: "Conocer la audiencia permite elegir tono, ejemplos y nivel de detalle." },
    { prompt: "¿Qué práctica mejora la escucha activa?", options: ["Parafrasear lo entendido", "Interrumpir siempre", "Mirar el teléfono", "Cambiar de tema"], answer: 0, explanation: "Parafrasear confirma que el mensaje fue comprendido." },
  ],
  "Medio ambiente": [
    { prompt: "¿Qué acción reduce directamente el consumo de materiales nuevos?", options: ["Reutilizar", "Desechar", "Imprimir más", "Comprar duplicado"], answer: 0, explanation: "Reutilizar prolonga la vida útil de los objetos y reduce el consumo de recursos." },
    { prompt: "¿Qué fuente es renovable?", options: ["Solar", "Carbón", "Petróleo", "Gas natural"], answer: 0, explanation: "La energía solar se renueva de forma natural a escala humana." },
  ],
  Ciencias: [
    { prompt: "¿Qué proceso permite a las plantas transformar luz en energía química?", options: ["Fotosíntesis", "Erosión", "Evaporación", "Fermentación"], answer: 0, explanation: "La fotosíntesis convierte la energía luminosa en energía química." },
    { prompt: "¿Cuál es la unidad básica de los seres vivos?", options: ["El átomo", "La célula", "El tejido", "El órgano"], answer: 1, explanation: "La célula es la unidad estructural y funcional básica de la vida." },
  ],
  Matemáticas: [
    { prompt: "Si una receta usa 3/4 de taza y preparas media receta, ¿cuánto necesitas?", options: ["1/4", "3/8", "1/2", "3/2"], answer: 1, explanation: "3/4 × 1/2 = 3/8 de taza." },
    { prompt: "¿Qué número continúa la secuencia 2, 4, 8, 16…?", options: ["18", "20", "24", "32"], answer: 3, explanation: "Cada término se duplica: 16 × 2 = 32." },
  ],
  Historia: [
    { prompt: "¿Qué herramienta ayuda a ordenar hechos según cuándo ocurrieron?", options: ["Una línea del tiempo", "Un diccionario", "Una brújula", "Un diagrama de Venn"], answer: 0, explanation: "La línea del tiempo representa hechos en orden cronológico." },
    { prompt: "¿Qué debemos revisar para evaluar una fuente histórica?", options: ["Solo su extensión", "Autoría y contexto", "El color del papel", "Su popularidad"], answer: 1, explanation: "La autoría y el contexto ayudan a valorar la fiabilidad y perspectiva de una fuente." },
  ],
  Lenguaje: [
    { prompt: "¿Qué recurso conecta dos ideas para expresar una relación?", options: ["Un conector", "Una sílaba", "Un margen", "Un título"], answer: 0, explanation: "Los conectores organizan y relacionan las ideas de un texto." },
    { prompt: "¿Cuál es el propósito principal de una tesis?", options: ["Decorar el texto", "Presentar la idea central", "Enumerar páginas", "Cerrar una palabra"], answer: 1, explanation: "La tesis plantea la idea central que el texto desarrolla o defiende." },
  ],
  Bienestar: [
    { prompt: "¿Qué hábito favorece una pausa de estudio sostenible?", options: ["Cambiar de tarea cada 5 segundos", "Hacer pausas breves", "No beber agua", "Dormir menos"], answer: 1, explanation: "Las pausas breves ayudan a recuperar atención y sostener el aprendizaje." },
    { prompt: "¿Qué es una meta alcanzable?", options: ["Una intención sin plazo", "Un objetivo concreto y medible", "Una tarea imposible", "Una comparación"], answer: 1, explanation: "Una meta concreta y medible permite planificarla y revisar el avance." },
  ],
};
void questionsByTopic;

const activities: FeedItem[] = [
  { id: "act-3d", title: "Taller de impresión 3D", description: "Diseña una pieza y llévala del modelo digital al laboratorio.", meta: "Prof. Mariana Solís · Laboratorio maker · Vie 16:00", tag: "12 cupos", available: true },
  { id: "act-debate", title: "Club de debate universitario", description: "Argumentación, pensamiento crítico y encuentros entre carreras.", meta: "Prof. Andrés Pardo · Aula múltiple · Mar 15:30", tag: "Inscripciones abiertas", available: true },
  { id: "act-futbol", title: "Torneo relámpago de fútbol 5", description: "Arma tu equipo y participa en la jornada deportiva del campus.", meta: "Entrenadora Lucía Mora · Cancha central · Sáb 09:00", tag: "8 equipos", available: true },
  { id: "act-arduino", title: "Arduino desde cero", description: "Una sesión práctica para crear tu primer circuito interactivo.", meta: "Prof. Daniel Ríos · FabLab · Jue 14:00", tag: "Creada por ti", available: true, createdByMe: true },
  { id: "act-cine", title: "Cineforo: ciencia en pantalla", description: "Proyección y conversación sobre ciencia, ética y sociedad.", meta: "Prof. Elena Cruz · Auditorio B · Mié 17:00", tag: "Creada por ti", available: true, createdByMe: true },
  { id: "act-bienestar", title: "Pausa activa al aire libre", description: "Un encuentro breve para recargar energía entre clases.", meta: "Bienestar universitario · Jardín norte · Lun 12:30", tag: "Últimos cupos", available: false, createdByMe: true },
];

const modules: ModuleData[] = [
  {
    id: "juegos", title: "Juegos", category: "Aprender jugando", description: "Biblioteca de mecánicas originales migradas a TypeScript, preparada para añadir contenido académico sin alterar su juego base.", icon: "★", tone: "purple", metric: "Experiencias", total: "50 juegos", action: "Jugar ahora",
    items: educationalGames.map((game) => ({
      id: game.id,
      title: game.title,
      description: game.description,
      meta: `${game.mechanic} · ${game.skills}`,
      tag: `${game.difficulty} · ${game.topics.length} temas`,
      available: true,
    })),
  },
  {
    id: "actividades", title: "Actividades", category: "Vive el campus", description: "Encuentra talleres, encuentros y experiencias creadas por la comunidad universitaria.", icon: "✦", tone: "coral", metric: "Experiencias", total: "24 esta semana", action: "Inscribirme",
    items: activities,
  },
  {
    id: "cursos", title: "Cursos", category: "Aprendizaje", description: "Amplía tu carrera con cursos breves, laboratorios y rutas complementarias.", icon: "⌘", tone: "blue", metric: "Rutas abiertas", total: "12 cursos", action: "Ver programa",
    items: [
      { id: "curso-python", title: "Python para resolver problemas", description: "Fundamentos de programación con retos aplicados.", meta: "Prof. Mateo Gil · 4 semanas · Híbrido", tag: "Nivel inicial", available: true },
      { id: "curso-diseno", title: "Diseño de servicios", description: "Investiga necesidades y crea soluciones centradas en las personas.", meta: "Prof. Sara Méndez · 6 semanas · Presencial", tag: "Inscripción abierta", available: true },
      { id: "curso-datos", title: "Datos para decisiones", description: "Visualización y análisis de datos para proyectos universitarios.", meta: "Escuela de Tecnología · 5 semanas · Virtual", tag: "Próximamente", available: false },
    ],
  },
  {
    id: "comunidades", title: "Comunidades", category: "Encuentra tu gente", description: "Conecta con grupos estudiantiles, clubes creativos y comunidades de interés.", icon: "◌", tone: "green", metric: "Comunidades", total: "18 activas", action: "Unirme",
    items: [
      { id: "com-foto", title: "Colectivo de fotografía", description: "Salidas, retos visuales y exposiciones hechas por estudiantes.", meta: "42 integrantes · Cultura", tag: "Actividad semanal", available: true },
      { id: "com-robotica", title: "Robótica Poli", description: "Construcción colaborativa y preparación para competencias.", meta: "31 integrantes · Tecnología", tag: "Recibe nuevos miembros", available: true },
      { id: "com-lectura", title: "Lecturas al margen", description: "Un espacio tranquilo para conversar sobre libros e ideas.", meta: "19 integrantes · Letras", tag: "Encuentro mensual", available: true },
    ],
  },
  {
    id: "bienestar", title: "Bienestar", category: "Cuídate", description: "Accede a orientación, actividades y recursos para sentirte bien durante el semestre.", icon: "♡", tone: "yellow", metric: "Servicios", total: "6 disponibles", action: "Agendar",
    items: [
      { id: "bien-psico", title: "Orientación psicológica", description: "Agenda un espacio confidencial de escucha y acompañamiento.", meta: "Atención individual · Edificio de Bienestar", tag: "Citas disponibles", available: true },
      { id: "bien-nutri", title: "Asesoría de nutrición", description: "Conversa con el equipo de salud sobre hábitos y alimentación.", meta: "Atención presencial · Consultorio 204", tag: "Esta semana", available: true },
      { id: "bien-pausa", title: "Pausas activas", description: "Sesiones guiadas para estirar y despejarte entre clases.", meta: "Jardín norte · Lunes a viernes", tag: "Sin inscripción", available: true },
    ],
  },
  {
    id: "noticias", title: "Noticias", category: "Lo que pasa", description: "Novedades, convocatorias y anuncios importantes de tu comunidad académica.", icon: "▤", tone: "cyan", metric: "Novedades", total: "8 sin leer", action: "Guardar",
    items: [
      { id: "not-becas", title: "Abre la convocatoria de movilidad 2026", description: "Postúlate a intercambios académicos en universidades aliadas.", meta: "Relaciones internacionales · Hace 2 h", tag: "Convocatoria", available: true },
      { id: "not-feria", title: "Feria de proyectos estudiantiles", description: "Conoce las ideas que están transformando el campus.", meta: "Innovación · Hace 1 día", tag: "Campus", available: true },
      { id: "not-biblio", title: "La biblioteca amplía su horario", description: "Más tiempo para estudiar durante el cierre de semestre.", meta: "Servicios · Hace 2 días", tag: "Aviso", available: true },
    ],
  },
  {
    id: "espacios", title: "Espacios", category: "Lugares para crear", description: "Consulta espacios del campus y encuentra dónde estudiar, reunirte o ensayar.", icon: "⌂", tone: "purple", metric: "Espacios", total: "9 reservables", action: "Reservar",
    items: [
      { id: "esp-maker", title: "Laboratorio maker", description: "Herramientas de fabricación digital y mesas de prototipado.", meta: "Bloques de 90 min · Edificio C", tag: "Disponible hoy", available: true },
      { id: "esp-sala", title: "Sala de proyectos 04", description: "Sala colaborativa con pantalla y pizarra móvil.", meta: "Hasta 8 personas · Biblioteca", tag: "Reserva abierta", available: true },
      { id: "esp-musica", title: "Sala de ensayo", description: "Espacio acústico para práctica musical y ensambles.", meta: "Bloques de 60 min · Centro cultural", tag: "Agenda semanal", available: true },
    ],
  },
  {
    id: "tutorias", title: "Tutorías", category: "Aprendemos en equipo", description: "Encuentra acompañamiento entre pares para avanzar en las materias que más cuestan.", icon: "↗", tone: "orange", metric: "Áreas", total: "7 con tutoría", action: "Solicitar",
    items: [
      { id: "tut-calculo", title: "Cálculo diferencial", description: "Repaso de límites, derivadas y resolución de problemas.", meta: "Tutor: Nicolás Vega · Mar y jue 13:00", tag: "2 lugares", available: true },
      { id: "tut-quimica", title: "Química general", description: "Sesiones para preparar el laboratorio y los parciales.", meta: "Tutora: Paula León · Lun 16:00", tag: "Inscripción abierta", available: true },
      { id: "tut-redaccion", title: "Escritura académica", description: "Estructura argumentos claros y fortalece tus trabajos.", meta: "Centro de escritura · Mié 11:00", tag: "Con cita", available: true },
    ],
  },
  {
    id: "perfil", title: "Mi perfil", category: "Tu espacio", description: "Revisa tus intereses, actividades guardadas y avances dentro de PoliScroll.", icon: "◉", tone: "ink", metric: "Tu recorrido", total: "4 actividades", action: "Actualizar",
    items: [
      { id: "perfil-intereses", title: "Intereses académicos", description: "Tecnología, diseño y bienestar estudiantil.", meta: "Visible para personalizar recomendaciones", tag: "3 intereses", available: true },
      { id: "perfil-actividades", title: "Mis actividades", description: "Arduino desde cero y Cineforo: ciencia en pantalla.", meta: "Próxima actividad · Jue 14:00", tag: "2 inscripciones", available: true },
      { id: "perfil-logros", title: "Logros del semestre", description: "Has participado en talleres y apoyado a tu comunidad.", meta: "Actualizado hoy", tag: "En progreso", available: true },
    ],
  },
];

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("No se encontro el contenedor principal.");
const root: HTMLDivElement = appRoot;

let screen: "home" | "module" = "home";
let selectedModuleId = modules[0].id;
let activeDeckIndex = 0;
let searchQuery = "";
let activityFilter = "all";
let toastTimer = 0;
const savedItems = new Set<string>();
let authReady = false;
let authSession: AuthSession | null = null;
let adminPreviewRole: "admin" | "teacher" | "student" | null = null;
let authView: "login" | "register" | "confirm" | "forgot" = "login";
let selectedLoginRole: UserRole = "student";
let pendingEmail = "";
let authFeedback = "";
let authFeedbackKind: "error" | "success" = "error";
let authBusy = false;
let dashboardSummary: DashboardSummary | null = null;
let chatConversationId: string | null = null;
let roleWorkspaceCollapsed = true;
let routeInitialized = false;

interface AppRoute {
  screen: "home" | "module";
  moduleId?: string;
}

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function render(): void {
  if (!authReady) {
    root.innerHTML = `<main class="ps-auth-shell"><div class="ps-auth-card"><span class="ps-auth-mark">P</span><p class="ps-module-kicker">POLISCROLL</p><h1>Conectando tu campus.</h1><p class="ps-auth-copy">Preparando tu sesión segura.</p><span class="ps-auth-loader" aria-label="Cargando"></span></div></main>`;
    return;
  }

  if (!authSession) {
    root.innerHTML = renderAuth();
    wireAuth();
    return;
  }

  unmountArcade();
  const selectedModule = modules.find((module) => module.id === selectedModuleId) ?? modules[0];
  root.innerHTML = `
    <div class="ps-app">
      <header class="ps-topbar">
        <button class="ps-brand" id="go-home" type="button" aria-label="Volver al menu principal">
          <span class="ps-brand-mark" aria-hidden="true">P</span><span>PoliScroll</span>
        </button>
        <button class="ps-module-menu-trigger" id="open-module-menu" type="button" aria-expanded="false"><span aria-hidden="true">☰</span> Módulos</button>
        <aside class="ps-module-drawer" id="module-drawer" aria-label="Módulos del campus" aria-hidden="true">
          <div class="ps-module-drawer-heading"><strong>PoliScroll</strong><button id="close-module-menu" type="button" aria-label="Cerrar menú">×</button></div>
          <div class="ps-desktop-menu-panel" role="menu">
            ${modules.map((module) => `<button type="button" data-bottom-module="${module.id}" role="menuitem"><span aria-hidden="true">${module.icon}</span><span><strong>${module.title}</strong><small>${module.category}</small></span><b aria-hidden="true">↗</b></button>`).join("")}
          </div>
        </aside>
        <div class="ps-module-drawer-backdrop" id="module-drawer-backdrop" hidden></div>
        <div class="ps-topbar-right">
          <span class="ps-campus"><span class="ps-online-dot"></span> Campus conectado</span>
          ${screen === "module" ? `<button class="ps-back" id="back-to-menu" type="button"><span aria-hidden="true">←</span> Menú principal</button>` : ""}
          ${authSession.user.role === "admin" || authSession.user.role === "super_admin" ? `<div class="ps-perspective-switcher" aria-label="Perspectiva administrativa"><span>Vista</span><button type="button" class="${adminPreviewRole === "student" ? "is-active" : ""}" data-preview-role="student">Estudiante</button><button type="button" class="${adminPreviewRole === "teacher" ? "is-active" : ""}" data-preview-role="teacher">Docente</button><button type="button" class="${!adminPreviewRole ? "is-active" : ""}" data-preview-role="admin">Admin</button></div>` : ""}
          <span class="ps-role-badge">${roleLabel(adminPreviewRole ?? authSession.user.role)}</span>
          <button class="ps-user-mark" id="sign-out" type="button" aria-label="Cerrar sesión">${initialsForSession()}</button>
        </div>
      </header>
      <main class="ps-main">
        ${screen === "home" ? renderHome() : renderModule(selectedModule)}
      </main>
      <nav class="ps-bottom-nav" aria-label="Navegación principal">
        <button class="ps-bottom-link${screen === "module" && selectedModuleId === "noticias" ? " is-active" : ""}" type="button" data-bottom-module="noticias" aria-current="${screen === "module" && selectedModuleId === "noticias" ? "page" : "false"}"><span class="ps-bottom-icon" aria-hidden="true">▤</span><span>Noticias</span></button>
        <button class="ps-bottom-link${screen === "module" && selectedModuleId === "actividades" ? " is-active" : ""}" type="button" data-bottom-module="actividades" aria-current="${screen === "module" && selectedModuleId === "actividades" ? "page" : "false"}"><span class="ps-bottom-icon" aria-hidden="true">◷</span><span>Actividades</span></button>
        <button class="ps-bottom-link ps-polichat-button" id="open-polichat" type="button" aria-label="Abrir PoliChat"><span class="ps-chat-medallion" aria-hidden="true"><span>P</span></span><span>PoliChat</span></button>
        <button class="ps-bottom-link${screen === "module" && selectedModuleId === "comunidades" ? " is-active" : ""}" type="button" data-bottom-module="comunidades" aria-current="${screen === "module" && selectedModuleId === "comunidades" ? "page" : "false"}"><span class="ps-bottom-icon" aria-hidden="true">◌</span><span>Grupos</span></button>
        <button class="ps-bottom-link${screen === "module" && selectedModuleId === "perfil" ? " is-active" : ""}" type="button" data-bottom-module="perfil" aria-current="${screen === "module" && selectedModuleId === "perfil" ? "page" : "false"}"><span class="ps-bottom-icon" aria-hidden="true">♙</span><span>Perfil</span></button>
      </nav>
      <dialog class="ps-chat-dialog" id="polichat-dialog" aria-labelledby="polichat-title">
        <div class="ps-chat-heading"><div class="ps-chat-brand"><span class="ps-chat-small-mark" aria-hidden="true">P</span><div><h2 id="polichat-title">PoliChat</h2><span>Mensajería del campus · persistente</span></div></div><button class="ps-dialog-close" id="close-polichat" type="button" aria-label="Cerrar PoliChat">×</button></div>
        <div class="ps-chat-messages" id="polichat-messages" aria-live="polite"><p class="ps-chat-message is-bot">Escribe tu mensaje y quedará guardado en tu conversación del campus.</p></div>
        <form class="ps-chat-form" id="polichat-form"><input id="polichat-input" type="text" maxlength="240" placeholder="Escribe tu pregunta" aria-label="Escribe tu pregunta" required /><button type="submit" aria-label="Enviar mensaje">↑</button></form>
      </dialog>
      <div class="ps-toast" id="toast" role="status" aria-live="polite" hidden></div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>("#go-home")?.addEventListener("click", goHome);
  const moduleDrawer = document.querySelector<HTMLElement>("#module-drawer");
  const moduleDrawerBackdrop = document.querySelector<HTMLDivElement>("#module-drawer-backdrop");
  const closeModuleDrawer = () => {
    moduleDrawer?.classList.remove("is-open");
    moduleDrawer?.setAttribute("aria-hidden", "true");
    document.querySelector<HTMLButtonElement>("#open-module-menu")?.setAttribute("aria-expanded", "false");
    if (moduleDrawerBackdrop) moduleDrawerBackdrop.hidden = true;
  };
  document.querySelector<HTMLButtonElement>("#open-module-menu")?.addEventListener("click", () => {
    moduleDrawer?.classList.add("is-open");
    moduleDrawer?.setAttribute("aria-hidden", "false");
    document.querySelector<HTMLButtonElement>("#open-module-menu")?.setAttribute("aria-expanded", "true");
    if (moduleDrawerBackdrop) moduleDrawerBackdrop.hidden = false;
  });
  document.querySelector<HTMLButtonElement>("#close-module-menu")?.addEventListener("click", closeModuleDrawer);
  moduleDrawerBackdrop?.addEventListener("click", closeModuleDrawer);
  document.querySelector<HTMLButtonElement>("#back-to-menu")?.addEventListener("click", goHome);
  document.querySelector<HTMLButtonElement>("#sign-out")?.addEventListener("click", async () => {
    await logout();
    authSession = null;
    screen = "home";
    history.replaceState({ screen: "auth" }, "", "#login");
    render();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-preview-role]").forEach((button) => button.addEventListener("click", () => {
    const role = button.dataset.previewRole;
    adminPreviewRole = role === "student" || role === "teacher" ? role : null;
    render();
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-bottom-module]").forEach((button) => {
    button.addEventListener("click", () => {
      closeModuleDrawer();
      openModule(button.dataset.bottomModule ?? modules[0].id);
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-role-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const actionIndex = Number(button.dataset.roleAction ?? 0);
      const destinations: Record<UserRole, string[]> = {
        student: ["actividades", "perfil", "juegos"],
        teacher: ["cursos", "actividades", "tutorias"],
        admin: ["perfil", "actividades", "noticias"],
        super_admin: ["perfil", "actividades", "noticias"],
      };
      openModule(destinations[authSession?.user.role ?? "student"][actionIndex] ?? "actividades");
    });
  });

  const chatDialog = document.querySelector<HTMLDialogElement>("#polichat-dialog");
  document.querySelector<HTMLButtonElement>("#open-polichat")?.addEventListener("click", () => {
    chatDialog?.showModal();
    if (chatConversationId && authSession) void markChatRead(chatConversationId, authSession.user.id).catch(() => undefined);
  });
  document.querySelector<HTMLButtonElement>("#close-polichat")?.addEventListener("click", () => chatDialog?.close());
  document.querySelector<HTMLFormElement>("#polichat-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#polichat-input");
    const messages = document.querySelector<HTMLDivElement>("#polichat-messages");
    const text = input?.value.trim();
    if (!input || !messages || !text) return;

    input.value = "";
    appendChatMessage(messages, text, "is-user");
    const send = async (): Promise<void> => {
      try {
        if (!chatConversationId) {
          chatConversationId = await createChatConversation({
            title: `Conversación de ${authSession?.user.displayName ?? "usuario"}`,
            createdBy: authSession!.user.id,
          });
        }
        await sendChatMessage({
          conversationId: chatConversationId,
          senderId: authSession!.user.id,
          body: text,
        });
        appendChatMessage(messages, "Mensaje guardado en tu conversación del campus.", "is-bot");
        const answer = await askTutor(text, "El estudiante está usando PoliChat dentro de una plataforma educativa universitaria.");
        appendChatMessage(messages, answer, "is-bot");
        messages.scrollTop = messages.scrollHeight;
      } catch (error) {
        appendChatMessage(messages, error instanceof Error ? error.message : "No se pudo guardar el mensaje.", "is-bot");
      }
    };
    void send();
  });

  if (screen === "home") wireHome();
  else wireModule(selectedModule);
}

function roleLabel(role: UserRole | "admin" | "teacher" | "student"): string {
  return role === "admin" ? "Administrador" : role === "teacher" ? "Docente" : "Estudiante";
}

function visibleRole(): UserRole {
  if ((authSession?.user.role === "admin" || authSession?.user.role === "super_admin") && adminPreviewRole) return adminPreviewRole;
  return authSession?.user.role ?? "student";
}

function initialsForSession(): string {
  return authSession?.user.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

function renderAuth(): string {
  const isLogin = authView === "login";
  const isRegister = authView === "register";
  const isConfirm = authView === "confirm";
  const isForgot = authView === "forgot";
  const title = isRegister ? "Crea tu recorrido." : isConfirm ? "Confirma tu correo." : isForgot ? "Recupera tu acceso." : "Entra a PoliScroll.";
  const description = isRegister
    ? "Regístrate como estudiante. Los accesos docentes y administrativos son asignados por el equipo de PoliScroll."
    : isConfirm
      ? `Enviamos un código a ${escapeHTML(pendingEmail)}.`
      : isForgot
        ? "Te enviaremos instrucciones para restablecer tu contraseña."
        : "Un campus conectado a tu forma de aprender.";

  return `
    <main class="ps-auth-shell">
      <section class="ps-auth-card" aria-labelledby="auth-title">
        <div class="ps-auth-heading"><span class="ps-auth-mark">P</span><span class="ps-auth-overline">POLISCROLL / ACCESO</span></div>
        <h1 id="auth-title">${title}</h1>
        <p class="ps-auth-copy">${description}</p>
        ${isLogin ? `<div class="ps-role-tabs" role="tablist" aria-label="Tipo de acceso">
          ${(["student", "teacher", "admin"] as UserRole[]).map((role) => `<button class="ps-role-tab${selectedLoginRole === role ? " is-active" : ""}" type="button" data-role="${role}" role="tab" aria-selected="${selectedLoginRole === role}">${roleLabel(role)}</button>`).join("")}
        </div><p class="ps-role-help">${selectedLoginRole === "student" ? "Puedes crear tu cuenta directamente." : selectedLoginRole === "teacher" ? "El acceso docente se habilita mediante invitación institucional." : "El acceso administrativo se provisiona de forma segura por el equipo de PoliScroll."}</p>` : ""}
        ${authFeedback ? `<p class="ps-auth-feedback is-${authFeedbackKind}" role="alert">${escapeHTML(authFeedback)}</p>` : ""}
        <form class="ps-auth-form" id="auth-form">
          ${isRegister ? `<label>Nombre completo<input name="displayName" type="text" autocomplete="name" required minlength="2" placeholder="Tu nombre" /></label>` : ""}
          <label>Correo electrónico<input name="email" type="email" autocomplete="email" required value="${isConfirm || isForgot ? escapeHTML(pendingEmail) : ""}" placeholder="tu@correo.com" /></label>
          ${isConfirm ? `<label>Código de verificación<input name="code" inputmode="numeric" autocomplete="one-time-code" required minlength="6" placeholder="123456" /></label>` : ""}
          ${isForgot && !isConfirm ? "" : !isForgot ? `<label>Contraseña<input id="auth-password" name="password" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" required minlength="8" placeholder="${isRegister ? "Crea una contraseña segura" : "Tu contraseña"}" />${isRegister ? `<ul class="ps-password-policy" id="password-policy" aria-label="Requisitos de contraseña"><li data-rule="length">8 caracteres como mínimo</li><li data-rule="uppercase">Una letra mayúscula</li><li data-rule="lowercase">Una letra minúscula</li><li data-rule="number">Un número</li><li data-rule="symbol">Un símbolo</li></ul>` : ""}</label>` : ""}
          ${isForgot && pendingEmail ? `<label>Código<input name="code" inputmode="numeric" required minlength="6" placeholder="Código de correo" /></label><label>Nueva contraseña<input name="newPassword" type="password" autocomplete="new-password" required minlength="8" placeholder="Mínimo 8 caracteres" /></label>` : ""}
          <button class="ps-auth-submit${authBusy ? " is-loading" : ""}" type="submit" ${authBusy ? "disabled" : ""}>${authBusy ? `<span class="ps-auth-spinner" aria-hidden="true"></span>Procesando...` : `${isRegister ? "Crear cuenta" : isConfirm ? "Confirmar correo" : isForgot && pendingEmail ? "Guardar contraseña" : isForgot ? "Enviar código" : "Iniciar sesión"} <span aria-hidden="true">↗</span>`}</button>
        </form>
        <div class="ps-auth-links">
          ${isLogin ? `<button type="button" data-auth-view="register">Crear cuenta de estudiante</button><button type="button" data-auth-view="forgot">Olvidé mi contraseña</button>` : `<button type="button" data-auth-view="login">Volver al acceso</button>`}
        </div>
      </section>
    </main>
  `;
}

function wireAuth(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-role]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLoginRole = (button.dataset.role as UserRole | undefined) ?? "student";
      authFeedback = "";
      render();
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-auth-view]").forEach((button) => {
    button.addEventListener("click", () => {
      authView = (button.dataset.authView as typeof authView | undefined) ?? "login";
      authFeedback = "";
      render();
    });
  });
  document.querySelector<HTMLFormElement>("#auth-form")?.addEventListener("submit", (event) => {
    void submitAuth(event);
  });
  document.querySelector<HTMLInputElement>("#auth-password")?.addEventListener("input", (event) => {
    updatePasswordPolicy((event.currentTarget as HTMLInputElement).value);
  });
  updatePasswordPolicy("");
}

function updatePasswordPolicy(password: string): void {
  const checks: Record<string, boolean> = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  document.querySelectorAll<HTMLElement>("[data-rule]").forEach((rule) => {
    rule.classList.toggle("is-valid", checks[rule.dataset.rule ?? ""] === true);
  });
}

function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("UserAlreadyExists") || message.includes("UsernameExists")) return "Ya existe una cuenta con este correo. Intenta iniciar sesión.";
  if (message.includes("NotAuthorized") || message.includes("Incorrect username or password")) return "El correo o la contraseña no son correctos.";
  if (message.includes("UserNotFound")) return "No encontramos una cuenta con ese correo.";
  if (message.includes("CodeMismatch")) return "El código no coincide. Revísalo e inténtalo otra vez.";
  return "No pudimos completar la operación. Revisa los datos e inténtalo nuevamente.";
}

function showAuthError(message: string): void {
  authFeedback = message;
  authFeedbackKind = "error";
  const form = document.querySelector<HTMLFormElement>("#auth-form");
  if (!form) {
    render();
    return;
  }
  let feedback = document.querySelector<HTMLParagraphElement>(".ps-auth-feedback");
  if (!feedback) {
    feedback = document.createElement("p");
    form.before(feedback);
  }
  feedback.className = "ps-auth-feedback is-error";
  feedback.setAttribute("role", "alert");
  feedback.textContent = message;
  feedback.animate([{ opacity: 0, transform: "translateY(-5px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 220, easing: "ease-out" });
}

async function submitAuth(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const password = String(data.get("password") ?? "");
  try {
    authFeedback = "";
    authBusy = true;
    const submitButton = form.querySelector<HTMLButtonElement>(".ps-auth-submit");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add("is-loading");
      submitButton.innerHTML = `<span class="ps-auth-spinner" aria-hidden="true"></span>Procesando...`;
    }
    if (authView === "register") {
      const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
      if (!passwordValid) {
        authBusy = false;
        showAuthError("Completa los requisitos de contraseña indicados para continuar.");
        return;
      }
      pendingEmail = (email);
      const confirmationEmail = await register(email, password, String(data.get("displayName") ?? "").trim());
      if (confirmationEmail) {
        authView = "confirm";
        authFeedback = "Revisa tu correo para confirmar la cuenta.";
        authFeedbackKind = "success";
      }
    } else if (authView === "confirm") {
      await confirmRegistration(email, String(data.get("code") ?? "").trim());
      authView = "login";
      authFeedback = "Cuenta confirmada. Ya puedes iniciar sesión.";
      authFeedbackKind = "success";
    } else if (authView === "forgot") {
      if (!pendingEmail) {
        pendingEmail = email;
        await beginPasswordReset(email);
        authFeedback = "Te enviamos un código de recuperación.";
        authFeedbackKind = "success";
      } else {
        await finishPasswordReset(email, String(data.get("code") ?? "").trim(), String(data.get("newPassword") ?? ""));
        authView = "login";
        pendingEmail = "";
        authFeedback = "Contraseña actualizada. Ya puedes entrar.";
        authFeedbackKind = "success";
      }
    } else {
      await login(email, password);
      const session = await getSession();
      if (!session) throw new Error("No se pudo recuperar la sesión.");
      if (selectedLoginRole !== "student" && session.user.role !== selectedLoginRole) {
        await logout();
        throw new Error(`Tu cuenta no tiene acceso de ${roleLabel(selectedLoginRole).toLowerCase()}.`);
      }
      authSession = session;
      initializeRoute();
      render();
      return;
    }
  } catch (error) {
    authBusy = false;
    showAuthError(authErrorMessage(error));
    return;
  }
  authBusy = false;
  render();
}

function appendChatMessage(container: HTMLDivElement, text: string, className: string): void {
  const message = document.createElement("p");
  message.className = `ps-chat-message ${className}`;
  message.textContent = text;
  container.append(message);
}

function renderHome(): string {
  return `
    ${renderRoleWorkspace()}
    <section class="ps-deck-stage" aria-label="Menú principal de módulos">
      <div class="ps-deck-scroll" id="module-deck" tabindex="0" aria-label="Desplazamiento vertical entre módulos">
        ${modules.map((module, index) => `
          <section class="ps-slide tone-${module.tone}" data-module-index="${index}" aria-label="Módulo ${index + 1}: ${module.title}">
            <span class="ps-slide-watermark" aria-hidden="true">${module.icon}</span>
            <div class="ps-slide-content">
              <div class="ps-slide-meta"><span class="ps-module-category"><i></i>${module.category}</span><span class="ps-module-number">POLI / ${String(index + 1).padStart(2, "0")} — ${String(modules.length).padStart(2, "0")}</span></div>
              <div class="ps-slide-main">
                <div class="ps-slide-copy">
                  <span class="ps-module-icon" aria-hidden="true">${module.icon}</span>
                  <h1>${module.title}<span class="ps-heading-period">.</span></h1>
                  <p>${module.description}</p>
                  <div class="ps-slide-actions"><button class="ps-open-module" type="button" data-open-module="${module.id}">Entrar al módulo <span aria-hidden="true">↗</span></button><span class="ps-module-metric"><span>${module.metric}</span><strong>${module.total}</strong></span></div>
                </div>
                <aside class="ps-slide-activity" aria-label="Contenido destacado de ${module.title}">
                  <div class="ps-slide-activity-heading"><span>EN ESTE MÓDULO</span><span>${String(module.items.length).padStart(2, "0")}</span></div>
                  <ol>${module.items.slice(0, 3).map((item, itemIndex) => `<li><span class="ps-slide-item-index">${String(itemIndex + 1).padStart(2, "0")}</span><span class="ps-slide-item-copy"><strong>${item.title}</strong><small>${item.meta}</small></span><span class="ps-slide-item-arrow" aria-hidden="true">↗</span></li>`).join("")}</ol>
                  <span class="ps-slide-activity-foot">Desliza para descubrir más <span aria-hidden="true">↓</span></span>
                </aside>
              </div>
              <div class="ps-slide-footer"><span>Tu vida universitaria, en movimiento</span><span>SCROLL <b aria-hidden="true">↓</b></span></div>
            </div>
          </section>
        `).join("")}
      </div>
      <button class="ps-edge-preview ps-edge-top" id="previous-preview" type="button" aria-label="Módulo anterior"></button>
      <button class="ps-edge-preview ps-edge-bottom" id="next-preview" type="button" aria-label="Módulo siguiente"></button>
      <div class="ps-deck-controls">
        <span class="ps-scroll-cue"><span aria-hidden="true">↕</span> Recorrido del campus</span>
        <div class="ps-pagination" id="deck-pagination" aria-label="Paginación de módulos"></div>
        <span class="ps-deck-count" id="deck-count" aria-live="polite"></span>
      </div>
    </section>
  `;
}

function renderRoleWorkspace(): string {
  if (!authSession) return "";
  const role = authSession.user.role;
  const workspace = role === "admin"
    ? {
      eyebrow: "CENTRO DE ADMINISTRACIÓN",
      title: "Controla el campus.",
      description: "Gestiona usuarios, contenidos, permisos y trazabilidad de PoliScroll.",
      actions: ["Administrar usuarios", "Gestionar contenidos", "Revisar auditoría"],
    }
    : role === "teacher"
      ? {
        eyebrow: "ESPACIO DOCENTE",
        title: "Acompaña cada progreso.",
        description: "Diseña actividades, revisa resultados y orienta a tus grupos.",
        actions: ["Crear cursos", "Diseñar actividades", "Gestionar tutorías"],
      }
      : {
        eyebrow: "TU RECORRIDO",
        title: `Hola, ${escapeHTML(authSession.user.displayName.split(/\s+/)[0] ?? "estudiante")}.`,
        description: "Continúa tus actividades y descubre nuevos retos adaptados a tu nivel.",
        actions: ["Continuar actividad", "Mis logros", "Mi progreso"],
      };

  const summary = dashboardSummary;
  return `<section class="ps-role-workspace ps-role-${role}${roleWorkspaceCollapsed ? " is-collapsed" : ""}" aria-label="${workspace.eyebrow}">
    <div class="ps-role-copy"><div class="ps-role-heading"><div><p class="ps-eyebrow"><span class="ps-eyebrow-line"></span>${workspace.eyebrow}</p><h2>${workspace.title}</h2></div><button class="ps-role-collapse" type="button" data-role-workspace-toggle aria-expanded="${!roleWorkspaceCollapsed}" aria-controls="role-workspace-details">${roleWorkspaceCollapsed ? "Mostrar resumen" : "Ocultar resumen"} <span aria-hidden="true">${roleWorkspaceCollapsed ? "↓" : "↑"}</span></button></div><p>${workspace.description}</p><strong class="ps-role-title">${dashboardRoleTitle(role)}</strong></div>
    <div class="ps-role-details" id="role-workspace-details"><div class="ps-role-actions">${workspace.actions.map((action, index) => `<button type="button" class="ps-role-action" data-role-action="${index}"><span>0${index + 1}</span>${action}<b aria-hidden="true">↗</b></button>`).join("")}</div>
    <div class="ps-role-metrics" aria-label="Resumen de datos">${summary ? [summary.primaryLabel, summary.secondaryLabel, summary.tertiaryLabel, summary.pendingLabel].map((label, index) => `<span><small>${label}</small><strong>${[summary.primaryValue, summary.secondaryValue, summary.tertiaryValue, summary.pendingValue][index]}</strong></span>`).join("") : `<span class="ps-metrics-loading">Sincronizando datos del campus…</span>`}</div></div>
  </section>`;
}

function renderModule(module: ModuleData): string {
  const isActivities = module.id === "actividades";
  const isGames = module.id === "juegos";
  if (module.id === "cursos") return renderCoursesModule(module);
  if (module.id === "tutorias") return renderTutoringModule(module);
  if (module.id === "actividades" && visibleRole() === "student") return renderActivitiesModule(module);
  if (module.id === "comunidades" && visibleRole() === "student") {
    return renderManagementModule("join", "Únete a un grupo", "Ingresa el código que te compartió tu docente y comienza a participar.");
  }

  function renderCoursesModule(module: ModuleData): string {
    const publisher = visibleRole() !== "student" ? `<form class="ps-management-form ps-inline-publisher" id="course-publisher"><strong>Publicar curso</strong><div class="ps-management-grid"><label>Título<input name="title" required maxlength="100" /></label><label>Nivel<select name="educationalLevel"><option>Primaria</option><option>Secundaria</option><option selected>Universitaria</option></select></label><label>Modalidad<select name="modality"><option value="Presencial">Presencial</option><option value="Virtual">Virtual</option><option value="Hibrido">Híbrido</option></select></label><label>Duración (semanas)<input name="durationWeeks" type="number" min="1" max="52" value="4" required /></label><label>Imagen de portada<input name="coverImageUrl" type="url" placeholder="https://..." /></label><label>Enlace de materiales<input name="resourceLinks" type="url" placeholder="https://drive.google.com/..." /></label></div><label>Descripción<textarea name="description" required maxlength="500"></textarea></label><label>Materiales y documentación<textarea name="materialsDescription" maxlength="1000" placeholder="Describe lecturas, documentos o instrucciones de acceso"></textarea></label><button class="ps-create-button" type="submit">Publicar curso <span>↗</span></button></form>` : "";
    const enrollmentPanel = visibleRole() !== "student" ? `<section class="ps-management-panel ps-course-enrollments"><div class="ps-management-form-heading"><strong>Estudiantes inscritos</strong><span>Seguimiento de matrícula</span></div><div class="ps-management-list" id="course-enrollment-list"><p class="ps-empty-state">Cargando inscripciones…</p></div></section>` : "";
    return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title"><div class="ps-module-heading"><div><p class="ps-eyebrow">Aprendizaje / Cursos</p><h1 id="module-title">Rutas de aprendizaje.</h1><p class="ps-module-description">${escapeHTML(module.description)}</p></div><div class="ps-module-total"><span>Cursos publicados</span><strong id="course-count">—</strong></div></div>${publisher}<div class="ps-data-grid" id="courses-list"><p class="ps-empty-state">Cargando cursos publicados…</p></div>${enrollmentPanel}<p class="ps-management-feedback" id="courses-feedback" role="status"></p></section>`;
  }

  function renderActivitiesModule(module: ModuleData): string {
    return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title"><div class="ps-module-heading"><div><p class="ps-eyebrow">Campus / Actividades</p><h1 id="module-title">Actividades disponibles.</h1><p class="ps-module-description">${escapeHTML(module.description)}</p></div><div class="ps-module-total"><span>Eventos publicados</span><strong id="event-count">—</strong></div></div><div class="ps-data-grid" id="events-list"><p class="ps-empty-state">Cargando actividades…</p></div></section>`;
  }

  function renderTutoringModule(module: ModuleData): string {
    const publisher = authSession?.user.role !== "student" ? `<form class="ps-management-form ps-inline-publisher" id="tutoring-publisher"><strong>Publicar disponibilidad</strong><div class="ps-management-grid"><label>Área o materia<input name="subject" required maxlength="100" /></label><label>Modalidad<select name="modality"><option value="Presencial">Presencial</option><option value="Virtual">Virtual</option><option value="Hibrido">Híbrido</option></select></label><label>Disponibilidad<input name="availability" required maxlength="120" placeholder="Mar y jue 14:00–16:00" /></label></div><label>Descripción<textarea name="description" required maxlength="500"></textarea><button class="ps-create-button" type="submit">Publicar tutoría <span>↗</span></button></form>` : "";
    const bookingPanel = authSession?.user.role !== "student" ? `<section class="ps-management-panel ps-tutoring-bookings"><div class="ps-management-form-heading"><strong>Solicitudes recibidas</strong><span>Confirma o reprograma el acompañamiento</span></div><div class="ps-management-list" id="tutoring-bookings-list"><p class="ps-empty-state">Cargando solicitudes…</p></div></section>` : "";
    return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title"><div class="ps-module-heading"><div><p class="ps-eyebrow">Acompañamiento / Tutorías</p><h1 id="module-title">Agenda una tutoría.</h1><p class="ps-module-description">${escapeHTML(module.description)}</p></div><div class="ps-module-total"><span>Áreas activas</span><strong id="tutoring-count">—</strong></div></div>${publisher}<div class="ps-data-grid" id="tutoring-list"><p class="ps-empty-state">Cargando tutores disponibles…</p></div>${bookingPanel}<p class="ps-management-feedback" id="tutoring-feedback" role="status"></p></section>`;
  }
  if (module.id === "comunidades" && authSession && visibleRole() !== "student") {
    return renderManagementModule("groups", "Grupos de estudio", "Crea grupos, organiza cohortes y acompaña el trabajo de tus estudiantes.");
  }
  if (module.id === "noticias" && (visibleRole() === "admin" || authSession?.user.role === "super_admin")) {
    return renderManagementModule("news", "Noticias del campus", "Publica comunicaciones oficiales y conserva un historial de versiones.");
  }
  if (module.id === "perfil" && (visibleRole() === "admin" || authSession?.user.role === "super_admin")) {
    return renderAdminModule();
  }
  if (module.id === "perfil" && visibleRole() === "student") {
    return renderStudentProgressModule();
  }
  if (module.id === "perfil" && visibleRole() === "teacher") {
    return renderTeacherReviewModule();
  }
  if (module.id === "actividades" && authSession && visibleRole() !== "student") {
    return renderManagementModule("events", "Eventos del campus", "Programa talleres, encuentros y experiencias para tu comunidad académica.");
  }
  if (isGames) {
    return `<section class="ps-module-view ps-arcade-module" aria-labelledby="module-title">
      <div class="ps-module-heading"><div><p class="ps-eyebrow"><span class="ps-eyebrow-line"></span>Juegos <span class="ps-breadcrumb">/ PoliArcade</span></p><h1 id="module-title">PoliArcade<span class="ps-heading-period">.</span></h1><p class="ps-module-description">El arcade educativo de PoliScroll: 16 juegos 2D y 3D, entrenamientos, metrónomo, sonidos y tutor académico.</p></div><div class="ps-module-total"><span>Juegos portados</span><strong>16</strong></div></div>
      <div id="arcade-root" class="ps-arcade-root"></div>
    </section>`;
  }

  function renderManagementModule(type: "groups" | "news" | "events" | "join", title: string, description: string): string {
    const isGroups = type === "groups";
    const isNews = type === "news";
    const isJoin = type === "join";
    const formId = isGroups ? "group-form" : isNews ? "news-form" : "event-form";
    if (isJoin) return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title">
      <div class="ps-module-heading"><div><p class="ps-eyebrow"><span class="ps-eyebrow-line"></span>Comunidades <span class="ps-breadcrumb">/ Inscripción</span></p><h1 id="module-title">${title}<span class="ps-heading-period">.</span></h1><p class="ps-module-description">${description}</p></div><div class="ps-module-total"><span>Acceso con código</span><strong>+</strong></div></div>
      <form class="ps-management-form" id="join-form">
        <div class="ps-management-form-heading"><strong>Buscar grupo</strong><span>Solicita el código a tu docente</span></div>
        <label>Código del grupo<input name="code" required maxlength="20" pattern="[A-Za-z0-9-]{4,20}" placeholder="ANAT-01" /></label>
        <button class="ps-create-button" type="submit">Buscar grupo <span>↗</span></button>
        <p class="ps-management-feedback" id="management-feedback" role="status"></p>
      </form>
      <div class="ps-management-list" id="management-list"><p class="ps-empty-state">Busca un grupo para comenzar.</p></div>
    </section>`;
    return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title">
      <div class="ps-module-heading"><div><p class="ps-eyebrow"><span class="ps-eyebrow-line"></span>Gestión <span class="ps-breadcrumb">/ ${title}</span></p><h1 id="module-title">${title}<span class="ps-heading-period">.</span></h1><p class="ps-module-description">${description}</p></div><div class="ps-module-total"><span>${isGroups ? "Gestión académica" : isNews ? "Publicación" : "Agenda"}</span><strong>+</strong></div></div>
      <form class="ps-management-form" id="${formId}">
        <div class="ps-management-form-heading"><strong>${isGroups ? "Nuevo grupo" : isNews ? "Nueva publicación" : "Nuevo evento"}</strong><span>Los cambios se guardan en el campus</span></div>
        <label>${isGroups || isNews ? (isGroups ? "Nombre del grupo" : "Título") : "Título del evento"}<input name="title" required maxlength="120" placeholder="${isGroups ? "Ej. Anatomía Secundaria 01" : isNews ? "Título de la publicación" : "Ej. Taller de robótica"}" /></label>
        <label>Descripción<textarea name="description" required maxlength="500" placeholder="${isGroups ? "Describe el propósito del grupo" : isNews ? "Resumen visible en el campus" : "Describe la actividad y sus objetivos"}"></textarea></label>
        ${isGroups ? `<div class="ps-management-grid"><label>Código<input name="code" required pattern="[A-Za-z0-9-]{4,20}" placeholder="ANAT-01" /></label><label>Nivel<select name="educationalLevel"><option>Primaria</option><option>Secundaria</option><option>Universitaria</option></select></label></div>` : isNews ? `<label>Contenido<textarea name="body" required maxlength="5000" placeholder="Escribe el contenido completo"></textarea></label>` : `<div class="ps-management-grid"><label>Lugar<input name="location" required maxlength="120" placeholder="Auditorio principal" /></label><label>Aforo<input name="capacity" type="number" min="1" max="10000" placeholder="100" /></label><label>Inicio<input name="startsAt" type="datetime-local" required /></label><label>Fin<input name="endsAt" type="datetime-local" /></label></div>`}
        <button class="ps-create-button" type="submit">${isGroups ? "Crear grupo" : isNews ? "Publicar noticia" : "Crear evento"} <span>↗</span></button>
        <p class="ps-management-feedback" id="management-feedback" role="status"></p>
      </form>
      <div class="ps-management-list" id="management-list"><p class="ps-empty-state">Cargando información…</p></div>
    </section>`;
  }
  return `
    <section class="ps-module-view tone-${module.tone}" aria-labelledby="module-title">
      <div class="ps-module-heading">
        <div>
          <p class="ps-eyebrow"><span class="ps-eyebrow-line"></span>${module.category} <span class="ps-breadcrumb">/ ${module.title}</span></p>
          <h1 id="module-title">${module.title}<span class="ps-heading-period">.</span></h1>
          <p class="ps-module-description">${module.description}</p>
        </div>
        <div class="ps-module-total"><span>${module.metric}</span><strong>${module.total}</strong></div>
      </div>
      <div class="ps-feed-toolbar">
        <label class="ps-search-field"><span aria-hidden="true">⌕</span><input id="module-search" type="search" value="${escapeHTML(searchQuery)}" placeholder="${isActivities ? "Buscar actividad o profesor" : `Buscar en ${module.title.toLowerCase()}`}" aria-label="${isActivities ? "Buscar por actividad o profesor" : `Buscar en ${module.title}`}" /></label>
        <label class="ps-filter-field"><span>${isGames ? "Tema" : "Filtrar"}</span><select id="module-filter" aria-label="Filtrar ${module.title}">
          ${isGames ? `<option value="all">Todos los temas</option>${gameTopics.map((topic) => `<option value="${topic}">${topic}</option>`).join("")}` : isActivities ? `<option value="all">Todas</option><option value="available">Con cupos</option><option value="mine">Creadas por mí</option>` : `<option value="all">Todo el módulo</option><option value="saved">Guardados</option>`}
        </select></label>
        ${isActivities ? `<button class="ps-create-button" id="create-activity" type="button"><span aria-hidden="true">＋</span> Crear actividad</button>` : ""}
      </div>
      <div class="ps-feed-caption"><span id="feed-result-count"></span><span class="ps-feed-caption-note">${isGames ? "Una mecánica, muchos temas: el contenido se adapta a tu elección" : isActivities ? "Actividades disponibles y de tu autoría" : "Contenido actualizado del campus"}</span></div>
      <div class="ps-module-feed" id="module-feed" aria-live="polite" aria-busy="false"></div>
    </section>
  `;
}

function renderFeedItems(module: ModuleData): void {
  if (module.id === "juegos") {
    const arcadeHost = document.querySelector<HTMLDivElement>("#arcade-root");
    if (!arcadeHost) return;
    mountArcade(arcadeHost);
    return;
  }
  const feed = document.querySelector<HTMLDivElement>("#module-feed");
  if (!feed) return;

  const query = searchQuery.trim().toLocaleLowerCase("es");
  const filteredItems = module.items.filter((item) => {
    const matchesQuery = `${item.title} ${item.description} ${item.meta} ${item.tag}`.toLocaleLowerCase("es").includes(query);
    const matchesFilter = activityFilter === "all"
      || (activityFilter === "available" && item.available)
      || (activityFilter === "mine" && item.createdByMe)
      || (activityFilter === "saved" && savedItems.has(item.id));
    return matchesQuery && matchesFilter;
  });

  document.querySelector<HTMLSpanElement>("#feed-result-count")!.textContent = `${filteredItems.length} ${filteredItems.length === 1 ? "resultado" : "resultados"}`;
  feed.innerHTML = filteredItems.length ? filteredItems.map((item, index) => {
    const isSaved = savedItems.has(item.id);
    return `
      <article class="ps-feed-card" style="--item-order:${index}">
        <div class="ps-feed-card-top"><span class="ps-feed-tag">${item.tag}</span><span class="ps-feed-index">${String(index + 1).padStart(2, "0")}</span></div>
        <div class="ps-feed-card-content"><h2>${item.title}</h2><p>${item.description}</p><span class="ps-feed-meta"><span aria-hidden="true">↗</span>${item.meta}</span></div>
        <button class="ps-feed-action${isSaved ? " is-saved" : ""}" type="button" data-toggle-item="${item.id}" aria-pressed="${isSaved}">${isSaved ? "Listo" : module.action}<span aria-hidden="true">${isSaved ? "✓" : "↗"}</span></button>
      </article>
    `;
  }).join("") : `<div class="ps-empty-state"><span aria-hidden="true">⌕</span><strong>No encontramos resultados</strong><p>Prueba con otro nombre, profesor o filtro.</p></div>`;

  feed.querySelectorAll<HTMLButtonElement>("[data-toggle-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const itemId = button.dataset.toggleItem;
      if (!itemId) return;
      const wasSaved = savedItems.has(itemId);
      if (wasSaved) savedItems.delete(itemId);
      else savedItems.add(itemId);
      renderFeedItems(module);
      showToast(wasSaved ? "Se quitó de tu lista." : `${module.action}: agregado a tu espacio.`);
    });
  });
}

function wireHome(): void {
  document.querySelector<HTMLButtonElement>("[data-role-workspace-toggle]")?.addEventListener("click", () => {
    roleWorkspaceCollapsed = !roleWorkspaceCollapsed;
    render();
  });
  const deck = document.querySelector<HTMLDivElement>("#module-deck");
  if (!deck) return;
  deck.scrollTop = activeDeckIndex * deck.clientHeight;

  const pagination = document.querySelector<HTMLDivElement>("#deck-pagination");
  if (pagination) {
    pagination.innerHTML = modules.map((module, index) => `<button class="ps-page-dot${index === activeDeckIndex ? " is-active" : ""}" type="button" data-jump-to="${index}" aria-label="Ir a ${module.title}" aria-current="${index === activeDeckIndex ? "step" : "false"}"></button>`).join("");
    pagination.querySelectorAll<HTMLButtonElement>("[data-jump-to]").forEach((button) => button.addEventListener("click", () => scrollToModule(Number(button.dataset.jumpTo))));
  }

  deck.addEventListener("scroll", updateDeckChrome, { passive: true });
  document.querySelector<HTMLButtonElement>("#previous-preview")?.addEventListener("click", () => scrollToModule(activeDeckIndex - 1));
  document.querySelector<HTMLButtonElement>("#next-preview")?.addEventListener("click", () => scrollToModule(activeDeckIndex + 1));
  document.querySelectorAll<HTMLButtonElement>("[data-open-module]").forEach((button) => {
    button.addEventListener("click", () => openModule(button.dataset.openModule ?? modules[activeDeckIndex].id));
  });
  updateDeckChrome();
}

function wireModule(module: ModuleData): void {
  if (module.id === "perfil" && (visibleRole() === "admin" || authSession?.user.role === "super_admin")) {
    wireAdminModule();
    return;
  }
  if (module.id === "perfil" && (visibleRole() === "student" || visibleRole() === "teacher")) {
    wireAcademicModule(visibleRole());
    return;
  }
  if (module.id === "comunidades" && visibleRole() === "student") {
    wireManagementModule("join");
    return;
  }
  if (module.id === "comunidades" && visibleRole() !== "student") {
    wireManagementModule("groups");
    return;
  }
  if (module.id === "noticias" && (visibleRole() === "admin" || authSession?.user.role === "super_admin")) {
    wireManagementModule("news");
    return;
  }
  if (module.id === "actividades" && visibleRole() !== "student") {
    wireManagementModule("events");
    return;
  }
  if (module.id === "cursos") {
    wireCoursesModule(module);
    return;
  }
  if (module.id === "actividades" && visibleRole() === "student") {
    wireActivitiesModule();
    return;
  }
  if (module.id === "tutorias") {
    wireTutoringModule();
    return;
  }
  document.querySelector<HTMLSelectElement>("#module-filter")?.addEventListener("change", (event) => {
    activityFilter = (event.currentTarget as HTMLSelectElement).value;
    renderFeedItems(module);
  });
  document.querySelector<HTMLInputElement>("#module-search")?.addEventListener("input", (event) => {
    searchQuery = (event.currentTarget as HTMLInputElement).value;
    renderFeedItems(module);
  });
  document.querySelector<HTMLButtonElement>("#create-activity")?.addEventListener("click", () => showCreateActivityDialog(module));
  renderFeedItems(module);
}

function wireCoursesModule(module: ModuleData): void {
  const list = document.querySelector<HTMLDivElement>("#courses-list");
  const count = document.querySelector<HTMLElement>("#course-count");
  const feedback = document.querySelector<HTMLParagraphElement>("#courses-feedback");
  if (!list || !count || !feedback || !authSession) return;
  document.querySelector<HTMLFormElement>("#course-publisher")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const values = new FormData(form);
    feedback.textContent = "Publicando curso…";
    void createCourse({
      title: String(values.get("title") ?? "").trim(),
      description: String(values.get("description") ?? "").trim(),
      instructorId: authSession!.user.id,
      educationalLevel: String(values.get("educationalLevel")) as "Primaria" | "Secundaria" | "Universitaria",
      modality: String(values.get("modality")) as "Presencial" | "Virtual" | "Hibrido",
      durationWeeks: Number(values.get("durationWeeks")),
      coverImageUrl: String(values.get("coverImageUrl") ?? "").trim() || undefined,
      resourceLinks: String(values.get("resourceLinks") ?? "").trim() ? [String(values.get("resourceLinks")).trim()] : [],
      materialsDescription: String(values.get("materialsDescription") ?? "").trim() || undefined,
    }).then(() => { feedback.textContent = "Curso publicado correctamente."; render(); }).catch((error: unknown) => { feedback.textContent = error instanceof Error ? error.message : "No se pudo publicar el curso."; });
  });
  void Promise.all([listCourses(), listCourseEnrollments()]).then(([courses, enrollments]) => {
    count.textContent = String(courses.length);
    const enrolledCourseIds = new Set(enrollments.filter((enrollment) => enrollment.userId === authSession!.user.id && enrollment.status === "active").map((enrollment) => enrollment.courseId));
    list.innerHTML = courses.length
      ? courses.map((course) => {
        const enrolled = enrolledCourseIds.has(course.id);
        const action = visibleRole() === "student" ? `<button class="ps-create-button" type="button" data-enroll-course="${course.id}"${enrolled ? " disabled" : ""}>${enrolled ? "Inscrito ✓" : "Inscribirme ↗"}</button>` : "";
        const resourceLink = course.resourceLinks?.[0];
        return `<article class="ps-data-card">${course.coverImageUrl ? `<img class="ps-course-cover" src="${escapeHTML(course.coverImageUrl)}" alt="" loading="lazy" />` : ""}<span class="ps-feed-tag">${course.educationalLevel ?? "Campus"} · ${course.modality ?? "Flexible"}</span><h2>${escapeHTML(course.title)}</h2><p>${escapeHTML(course.description)}</p>${course.materialsDescription ? `<p class="ps-course-materials">${escapeHTML(course.materialsDescription)}</p>` : ""}<small>${course.durationWeeks ?? "—"} semanas · Cupo ${course.capacity ?? "abierto"}</small>${resourceLink ? `<a class="ps-inline-link" href="${escapeHTML(resourceLink)}" target="_blank" rel="noreferrer">Abrir materiales ↗</a>` : ""}${action}</article>`;
      }).join("")
      : `<div class="ps-empty-state ps-data-empty"><strong>No hay cursos publicados todavía.</strong><span>Un docente puede publicar la primera ruta desde su espacio.</span>${module.items.slice(0, 3).map((item) => `<article class="ps-data-card ps-data-card-muted"><span class="ps-feed-tag">${escapeHTML(item.tag)}</span><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.description)}</p><small>${escapeHTML(item.meta)}</small></article>`).join("")}</div>`;
    list.querySelectorAll<HTMLButtonElement>("[data-enroll-course]").forEach((button) => button.addEventListener("click", () => {
      button.disabled = true;
      button.textContent = "Registrando…";
      void enrollInCourse(button.dataset.enrollCourse ?? "", authSession!.user.id).then(() => {
        button.textContent = "Inscrito ✓";
        feedback.textContent = "Tu inscripción quedó registrada.";
      }).catch((error: unknown) => {
        button.disabled = false;
        button.textContent = "Inscribirme ↗";
        feedback.textContent = error instanceof Error ? error.message : "No se pudo completar la inscripción.";
      });
    }));
    const enrollmentList = document.querySelector<HTMLDivElement>("#course-enrollment-list");
    if (enrollmentList) {
      enrollmentList.innerHTML = enrollments.length
        ? enrollments.map((enrollment) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${escapeHTML(enrollment.status ?? "active")}</span><h2>${escapeHTML(enrollment.courseId)}</h2><p>Estudiante: ${escapeHTML(enrollment.userId)}</p></div><time>${new Date(enrollment.enrolledAt).toLocaleDateString("es-CO")}</time></article>`).join("")
        : `<p class="ps-empty-state">Todavía no hay estudiantes inscritos.</p>`;
    }
  }).catch((error: unknown) => {
    list.innerHTML = `<p class="ps-empty-state">${escapeHTML(error instanceof Error ? error.message : "No se pudieron cargar los cursos.")}</p>`;
  });
}

function wireActivitiesModule(): void {
  const list = document.querySelector<HTMLDivElement>("#events-list");
  const count = document.querySelector<HTMLElement>("#event-count");
  if (!list || !count) return;
  void listCampusEvents().then((events) => {
    count.textContent = String(events.length);
    list.innerHTML = events.length
      ? events.map((event) => `<article class="ps-data-card"><span class="ps-feed-tag">${escapeHTML(event.location ?? "Campus")} · ${event.status ?? "published"}</span><h2>${escapeHTML(event.title)}</h2><p>${escapeHTML(event.description ?? "Actividad abierta a la comunidad.")}</p><small>${new Date(event.startsAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</small><strong class="ps-data-card-link">Actividad publicada</strong></article>`).join("")
      : `<p class="ps-empty-state">No hay actividades publicadas en este momento.</p>`;
  }).catch((error: unknown) => {
    list.innerHTML = `<p class="ps-empty-state">${escapeHTML(error instanceof Error ? error.message : "No se pudieron cargar las actividades.")}</p>`;
  });
}

function wireTutoringModule(): void {
  const list = document.querySelector<HTMLDivElement>("#tutoring-list");
  const count = document.querySelector<HTMLElement>("#tutoring-count");
  const feedback = document.querySelector<HTMLParagraphElement>("#tutoring-feedback");
  if (!list || !count || !feedback || !authSession) return;
  document.querySelector<HTMLFormElement>("#tutoring-publisher")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const values = new FormData(form);
    feedback.textContent = "Publicando disponibilidad…";
    void createTutoringOffer({
      subject: String(values.get("subject") ?? "").trim(),
      description: String(values.get("description") ?? "").trim(),
      tutorId: authSession!.user.id,
      availability: String(values.get("availability") ?? "").trim(),
      modality: String(values.get("modality")) as "Presencial" | "Virtual" | "Hibrido",
    }).then(() => { feedback.textContent = "Oferta de tutoría publicada."; render(); }).catch((error: unknown) => { feedback.textContent = error instanceof Error ? error.message : "No se pudo publicar la tutoría."; });
  });
  void listTutoringOffers().then((offers) => {
    count.textContent = String(offers.length);
    list.innerHTML = offers.length
      ? offers.map((offer) => `<article class="ps-data-card"><span class="ps-feed-tag">${escapeHTML(offer.modality ?? "Flexible")}</span><h2>${escapeHTML(offer.subject)}</h2><p>${escapeHTML(offer.description)}</p><small>Disponibilidad: ${escapeHTML(offer.availability)}</small><form class="ps-tutoring-form" data-book-offer="${offer.id}"><label>Fecha y hora<input name="scheduledAt" type="datetime-local" required /></label><label>Nota opcional<textarea name="notes" maxlength="300" placeholder="¿En qué necesitas apoyo?"></textarea></label><button class="ps-create-button" type="submit">Solicitar tutoría <span>↗</span></button></form></article>`).join("")
      : (modules.find((module) => module.id === "tutorias")?.items ?? []).map((item) => `<article class="ps-data-card ps-data-card-muted"><span class="ps-feed-tag">${escapeHTML(item.tag)} · Demo</span><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.description)}</p><small>${escapeHTML(item.meta)}</small><form class="ps-tutoring-form" data-book-offer="demo-${item.id}"><label>Fecha y hora<input name="scheduledAt" type="datetime-local" required /></label><label>Nota opcional<textarea name="notes" maxlength="300" placeholder="¿En qué necesitas apoyo?"></textarea></label><button class="ps-create-button" type="submit">Simular solicitud <span>↗</span></button></form></article>`).join("");
    list.querySelectorAll<HTMLFormElement>("[data-book-offer]").forEach((form) => form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const button = form.querySelector<HTMLButtonElement>("button");
      if (button) { button.disabled = true; button.textContent = "Solicitando…"; }
      if (form.dataset.bookOffer?.startsWith("demo-")) {
        feedback.textContent = "Solicitud simulada. Publica una oferta desde el espacio docente para activar reservas persistentes.";
        form.reset();
        if (button) { button.disabled = false; button.textContent = "Simular solicitud ↗"; }
        return;
      }
      void bookTutoring({
        offerId: form.dataset.bookOffer ?? "",
        studentId: authSession!.user.id,
        scheduledAt: new Date(String(data.get("scheduledAt"))).toISOString(),
        notes: String(data.get("notes") ?? "").trim() || undefined,
      }).then(() => {
        feedback.textContent = "Solicitud enviada. El tutor podrá confirmarla desde su espacio.";
        form.reset();
        if (button) { button.disabled = false; button.textContent = "Solicitar tutoría ↗"; }
      }).catch((error: unknown) => {
        feedback.textContent = error instanceof Error ? error.message : "No se pudo solicitar la tutoría.";
        if (button) { button.disabled = false; button.textContent = "Solicitar tutoría ↗"; }
      });
    }));
    const bookings = document.querySelector<HTMLDivElement>("#tutoring-bookings-list");
    if (bookings && authSession?.user.role !== "student") {
      void listTutoringBookings().then((items) => {
        bookings.innerHTML = items.length
          ? items.map((booking) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${escapeHTML(booking.status ?? "requested")}</span><h2>${new Date(booking.scheduledAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</h2><p>Estudiante: ${escapeHTML(booking.studentId)}${booking.notes ? ` · ${escapeHTML(booking.notes)}` : ""}</p></div><div class="ps-inline-actions"><button class="ps-create-button" type="button" data-booking-status="confirmed" data-booking-id="${booking.id}">Confirmar</button><button class="ps-secondary-button" type="button" data-booking-status="cancelled" data-booking-id="${booking.id}">Cancelar</button></div></article>`).join("")
          : `<p class="ps-empty-state">No hay solicitudes pendientes.</p>`;
        bookings.querySelectorAll<HTMLButtonElement>("[data-booking-status]").forEach((button) => button.addEventListener("click", () => {
          const bookingId = button.dataset.bookingId;
          const status = button.dataset.bookingStatus as "confirmed" | "cancelled";
          if (!bookingId) return;
          button.disabled = true;
          void updateTutoringBookingStatus(bookingId, status).then(() => {
            feedback.textContent = status === "confirmed" ? "Tutoría confirmada." : "Solicitud cancelada.";
            render();
          }).catch((error: unknown) => {
            button.disabled = false;
            feedback.textContent = error instanceof Error ? error.message : "No se pudo actualizar la solicitud.";
          });
        }));
      }).catch((error: unknown) => {
        bookings.innerHTML = `<p class="ps-empty-state">${escapeHTML(error instanceof Error ? error.message : "No se pudieron cargar las solicitudes.")}</p>`;
      });
    }
  }).catch((error: unknown) => {
    list.innerHTML = `<p class="ps-empty-state">${escapeHTML(error instanceof Error ? error.message : "No se pudieron cargar las tutorías.")}</p>`;
  });
}

function renderAdminModule(): string {
  return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title"><div class="ps-module-heading"><div><p class="ps-eyebrow">Administración / Control y auditoría</p><h1 id="module-title">Centro de control.</h1><p class="ps-module-description">Administra usuarios, publicaciones, juegos y operaciones del campus desde un solo lugar.</p></div></div><form class="ps-management-form" id="admin-news-form"><div class="ps-management-form-heading"><strong>Publicar noticia</strong><span>Visible para la comunidad</span></div><div class="ps-management-grid"><label>Título<input name="title" required maxlength="100" /></label><label>Resumen<input name="summary" maxlength="180" /></label></div><label>Contenido<textarea name="body" required maxlength="2000"></textarea></label><button class="ps-create-button" type="submit">Publicar noticia <span>↗</span></button><p class="ps-management-feedback" id="admin-feedback" role="status"></p></form><div class="ps-admin-panels"><section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Usuarios registrados</strong><span>Estado y acciones</span></div><div class="ps-management-list" id="admin-users-list"><p class="ps-empty-state">Cargando usuarios…</p></div></section><section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Configuración del arcade</strong><span>Disponibilidad, niveles y Frenesí</span></div><div class="ps-management-list" id="admin-games-list"><p class="ps-empty-state">Cargando juegos…</p></div></section><section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Noticias publicadas</strong><span>Publicar o retirar</span></div><div class="ps-management-list" id="admin-news-list"><p class="ps-empty-state">Cargando noticias…</p></div></section><section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Auditoría reciente</strong><span>Últimos cambios</span></div><div class="ps-management-list" id="admin-audit-list"><p class="ps-empty-state">Cargando auditoría…</p></div></section></div></section>`;
}

function renderStudentProgressModule(): string {
  return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title"><div class="ps-module-heading"><div><p class="ps-eyebrow">Tu recorrido / Progreso</p><h1 id="module-title">Mi progreso.</h1><p class="ps-module-description">Revisa tus actividades y notificaciones.</p></div></div><div class="ps-admin-panels"><section class="ps-management-panel"><strong>Actividades realizadas</strong><div class="ps-management-list" id="student-progress-list"><p class="ps-empty-state">Cargando progreso…</p></div></section><section class="ps-management-panel"><strong>Notificaciones</strong><div class="ps-management-list" id="student-notifications-list"><p class="ps-empty-state">Cargando notificaciones…</p></div></section></div></section>`;
}

function renderTeacherReviewModule(): string {
  return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title"><div class="ps-module-heading"><div><p class="ps-eyebrow">Espacio docente / Seguimiento</p><h1 id="module-title">Seguimiento académico.</h1><p class="ps-module-description">Revisa sesiones y calificaciones.</p></div></div><form class="ps-management-form" id="grade-form"><div class="ps-management-form-heading"><strong>Registrar calificación</strong><span>Se notificará al estudiante</span></div><div class="ps-management-grid"><label>ID del estudiante<input name="studentId" required /></label><label>ID de actividad<input name="activityId" /></label><label>Puntaje<input name="score" type="number" min="0" step="0.01" required /></label><label>Puntaje máximo<input name="maxScore" type="number" min="0.01" step="0.01" value="100" required /></label></div><label>Feedback<textarea name="feedback" maxlength="500"></textarea></label><button class="ps-create-button" type="submit">Guardar calificación <span>↗</span></button><p class="ps-management-feedback" id="grade-feedback" role="status"></p></form><div class="ps-admin-panels"><section class="ps-management-panel"><strong>Sesiones</strong><div class="ps-management-list" id="teacher-sessions-list"><p class="ps-empty-state">Cargando…</p></div></section><section class="ps-management-panel"><strong>Calificaciones</strong><div class="ps-management-list" id="teacher-grades-list"><p class="ps-empty-state">Cargando…</p></div></section></div></section>`;
}

function wireAdminModule(): void {
  const users = document.querySelector<HTMLDivElement>("#admin-users-list");
  const news = document.querySelector<HTMLDivElement>("#admin-news-list");
  const games = document.querySelector<HTMLDivElement>("#admin-games-list");
  const audit = document.querySelector<HTMLDivElement>("#admin-audit-list");
  const feedback = document.querySelector<HTMLParagraphElement>("#admin-feedback");
  if (!users || !audit || !authSession) return;
  document.querySelector<HTMLFormElement>("#admin-news-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget as HTMLFormElement);
    if (feedback) feedback.textContent = "Publicando noticia…";
    void createNewsArticle({
      title: String(values.get("title") ?? "").trim(),
      summary: String(values.get("summary") ?? "").trim(),
      body: String(values.get("body") ?? "").trim(),
      authorId: authSession!.user.id,
    }).then(() => { if (feedback) feedback.textContent = "Noticia publicada."; render(); }).catch((error: unknown) => { if (feedback) feedback.textContent = error instanceof Error ? error.message : "No se pudo publicar la noticia."; });
  });
  void Promise.all([listUserProfiles(), listAuditLogs(), listNewsArticles(), listArcadeGameConfigs()]).then(([profiles, logs, articles, gameConfigs]) => {
    const uniqueProfiles = [...new Map(profiles.map((profile) => [profile.email.toLowerCase(), profile])).values()];
    users.innerHTML = uniqueProfiles.map((profile) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${profile.role ?? "student"} · ${profile.status ?? "active"}</span><h2>${escapeHTML(profile.displayName)}</h2><p>${escapeHTML(profile.email)}</p></div><div class="ps-inline-actions"><button class="ps-secondary-button" type="button" data-user-status="${profile.status === "suspended" ? "active" : "suspended"}" data-user-id="${profile.id}">${profile.status === "suspended" ? "Habilitar" : "Suspender"}</button>${profile.id !== authSession!.user.id ? `<button class="ps-secondary-button" type="button" data-delete-user="${profile.id}">Eliminar registro</button>` : ""}</div></article>`).join("") || `<p class="ps-empty-state">No hay perfiles.</p>`;
    users.querySelectorAll<HTMLButtonElement>("[data-user-status]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.userId;
      const status = button.dataset.userStatus as "active" | "suspended";
      if (!id) return;
      button.disabled = true;
      void updateUserProfileStatus(id, status).then(() => render()).catch((error: unknown) => { button.disabled = false; if (feedback) feedback.textContent = error instanceof Error ? error.message : "No se pudo actualizar el usuario."; });
    }));
    if (games) {
      const configsByGame = new Map(gameConfigs.map((config) => [config.gameId, config]));
      games.innerHTML = getAllGames().map((game) => {
        const config = configsByGame.get(game.id);
        const enabled = config?.enabled ?? true;
        const frenzyEnabled = config?.frenzyEnabled ?? game.dimension === "2d";
        const levels = config?.educationalLevels ?? ["Primaria", "Secundaria", "Universitaria"];
        return `<article class="ps-management-card"><div><span class="ps-feed-tag">${game.dimension.toUpperCase()} · ${enabled ? "habilitado" : "inhibido"}</span><h2>${escapeHTML(game.title)}</h2><p>${escapeHTML(game.tagline)}</p></div><form class="ps-inline-actions" data-game-config-form="${game.id}"><label class="ps-inline-checkbox"><input type="checkbox" name="enabled" ${enabled ? "checked" : ""} /> Catálogo</label><label class="ps-inline-checkbox"><input type="checkbox" name="frenzyEnabled" ${frenzyEnabled ? "checked" : ""} /> Frenesí</label><select name="difficulty" aria-label="Dificultad"><option value="facil" ${(config?.difficulty ?? game.difficulty) === "facil" ? "selected" : ""}>Fácil</option><option value="medio" ${(config?.difficulty ?? game.difficulty) === "medio" ? "selected" : ""}>Medio</option><option value="experto" ${(config?.difficulty ?? game.difficulty) === "experto" ? "selected" : ""}>Experto</option></select><button class="ps-secondary-button" type="submit">Guardar</button><input type="hidden" name="levels" value="${escapeHTML(levels.join(","))}" /></form></article>`;
      }).join("");
      games.querySelectorAll<HTMLFormElement>("[data-game-config-form]").forEach((form) => form.addEventListener("submit", (event) => {
        event.preventDefault();
        const values = new FormData(form);
        const game = getAllGames().find((candidate) => candidate.id === form.dataset.gameConfigForm);
        if (!game || !authSession) return;
        const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
        if (button) button.disabled = true;
        void upsertArcadeGameConfig({
          id: configsByGame.get(game.id)?.id,
          gameId: game.id,
          enabled: values.get("enabled") === "on",
          frenzyEnabled: values.get("frenzyEnabled") === "on",
          difficulty: String(values.get("difficulty") ?? game.difficulty) as "facil" | "medio" | "experto",
          speedMultiplier: 1,
          educationalLevels: String(values.get("levels") ?? "").split(",").filter(Boolean),
          updatedBy: authSession.user.id,
        }).then(() => render()).catch((error: unknown) => {
          if (button) button.disabled = false;
          if (feedback) feedback.textContent = error instanceof Error ? error.message : "No se pudo guardar la configuración.";
        });
      }));
    }
    users.querySelectorAll<HTMLButtonElement>("[data-delete-user]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.deleteUser;
      if (!id || !window.confirm("¿Eliminar este registro de perfil? La cuenta Cognito no se elimina.")) return;
      button.disabled = true;
      void deleteUserProfile(id).then(() => render()).catch((error: unknown) => { button.disabled = false; if (feedback) feedback.textContent = error instanceof Error ? error.message : "No se pudo eliminar el registro."; });
    }));
    if (news) {
      news.innerHTML = articles.length ? articles.map((article) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${article.status ?? "draft"} · v${article.version ?? 1}</span><h2>${escapeHTML(article.title)}</h2><p>${escapeHTML(article.summary ?? "")}</p></div>${article.status !== "archived" ? `<button class="ps-secondary-button" type="button" data-archive-news="${article.id}">Retirar</button>` : ""}</article>`).join("") : `<p class="ps-empty-state">No hay noticias.</p>`;
      news.querySelectorAll<HTMLButtonElement>("[data-archive-news]").forEach((button) => button.addEventListener("click", () => {
        const id = button.dataset.archiveNews;
        if (!id) return;
        button.disabled = true;
        void archiveNewsArticle(id).then(() => render()).catch((error: unknown) => { button.disabled = false; if (feedback) feedback.textContent = error instanceof Error ? error.message : "No se pudo retirar la noticia."; });
      }));
    }
    audit.innerHTML = logs.slice(0, 20).map((log) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${escapeHTML(log.entityType)}</span><h2>${escapeHTML(log.action)}</h2><p>${escapeHTML(log.actorId)}</p></div></article>`).join("") || `<p class="ps-empty-state">No hay auditoría.</p>`;
  }).catch((error: unknown) => { users.textContent = error instanceof Error ? error.message : "No se pudo cargar el centro de control."; });
}

function wireAcademicModule(role: "student" | "teacher"): void {
  if (role === "student") {
    const progress = document.querySelector<HTMLDivElement>("#student-progress-list");
    const notifications = document.querySelector<HTMLDivElement>("#student-notifications-list");
    if (!progress || !notifications) return;
    void Promise.all([listActivitySessions(), listNotifications()]).then(([sessions, items]) => {
      progress.innerHTML = sessions.map((session) => `<article class="ps-management-card"><div><h2>${escapeHTML(session.activityTitle)}</h2><p>${session.completed ? "Completada" : "Pendiente"}</p></div><strong>${session.score ?? 0} pts</strong></article>`).join("") || `<p class="ps-empty-state">Sin actividades.</p>`;
      notifications.innerHTML = items.map((item) => `<article class="ps-management-card"><div><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.body)}</p></div></article>`).join("") || `<p class="ps-empty-state">Sin notificaciones.</p>`;
    }).catch((error: unknown) => { progress.textContent = error instanceof Error ? error.message : "No se pudo cargar el progreso."; });
    return;
  }
  const sessions = document.querySelector<HTMLDivElement>("#teacher-sessions-list");
  const grades = document.querySelector<HTMLDivElement>("#teacher-grades-list");
  const form = document.querySelector<HTMLFormElement>("#grade-form");
  const feedback = document.querySelector<HTMLParagraphElement>("#grade-feedback");
  if (!sessions || !grades || !form || !feedback || !authSession) return;
  void Promise.all([listActivitySessions(), listGradeRecords()]).then(([activitySessions, records]) => {
    sessions.innerHTML = activitySessions.map((session) => `<article class="ps-management-card"><div><h2>${escapeHTML(session.activityTitle)}</h2><p>${session.owner ?? "Cuenta asociada"}</p></div><strong>${session.score ?? 0} pts</strong></article>`).join("") || `<p class="ps-empty-state">Sin sesiones.</p>`;
    grades.innerHTML = records.map((record) => `<article class="ps-management-card"><div><h2>${escapeHTML(record.feedback ?? "Calificación")}</h2><p>${escapeHTML(record.studentId)}</p></div><strong>${record.score}/${record.maxScore}</strong></article>`).join("") || `<p class="ps-empty-state">Sin calificaciones.</p>`;
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(form);
    void createGradeRecord({ studentId: String(values.get("studentId")), teacherId: authSession!.user.id, activityId: String(values.get("activityId") || "") || undefined, score: Number(values.get("score")), maxScore: Number(values.get("maxScore")), feedback: String(values.get("feedback") || "") || undefined }).then(() => { feedback.textContent = "Calificación guardada y estudiante notificado."; form.reset(); }).catch((error: unknown) => { feedback.textContent = error instanceof Error ? error.message : "No se pudo guardar."; });
  });
}

function wireManagementModule(type: "groups" | "news" | "events" | "join"): void {
  const form = document.querySelector<HTMLFormElement>(type === "groups" ? "#group-form" : type === "news" ? "#news-form" : type === "events" ? "#event-form" : "#join-form");
  const list = document.querySelector<HTMLDivElement>("#management-list");
  const feedback = document.querySelector<HTMLParagraphElement>("#management-feedback");
  if (!form || !list || !feedback || !authSession) return;

  const renderList = async (): Promise<void> => {
    try {
      if (type === "groups") {
        const groups = await listStudyGroups();
        list.innerHTML = groups.length ? groups.map((group) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${group.educationalLevel ?? "Campus"} · ${group.status ?? "active"}</span><h2>${escapeHTML(group.name)}</h2><p>${escapeHTML(group.description ?? "Sin descripción")}</p></div><strong>${escapeHTML(group.code)}</strong></article>`).join("") : `<p class="ps-empty-state">Todavía no hay grupos creados.</p>`;
      } else if (type === "news") {
        const articles = await listNewsArticles();
        list.innerHTML = articles.length ? articles.map((article) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${article.status ?? "draft"} · v${article.version ?? 1}</span><h2>${escapeHTML(article.title)}</h2><p>${escapeHTML(article.summary ?? "")}</p></div><time>${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("es-CO") : "Borrador"}</time></article>`).join("") : `<p class="ps-empty-state">Todavía no hay publicaciones.</p>`;
      } else if (type === "events") {
        const events = await listCampusEvents();
        list.innerHTML = events.length ? events.map((event) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${event.status ?? "draft"} · ${escapeHTML(event.location ?? "Campus")}</span><h2>${escapeHTML(event.title)}</h2><p>${escapeHTML(event.description ?? "Sin descripción")}</p></div><time>${new Date(event.startsAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</time></article>`).join("") : `<p class="ps-empty-state">Todavía no hay eventos programados.</p>`;
      } else {
        list.innerHTML = `<p class="ps-empty-state">Busca un grupo para comenzar.</p>`;
      }

      function renderAdminModule(): string {
        return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title">
          <div class="ps-module-heading"><div><p class="ps-eyebrow"><span class="ps-eyebrow-line"></span>Administración <span class="ps-breadcrumb">/ Control y auditoría</span></p><h1 id="module-title">Centro de control<span class="ps-heading-period">.</span></h1><p class="ps-module-description">Consulta usuarios y trazabilidad operativa sin modificar permisos de forma accidental.</p></div><div class="ps-module-total"><span>Solo lectura</span><strong>✓</strong></div></div>
          <div class="ps-admin-panels">
            <section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Usuarios registrados</strong><span>Estado actual</span></div><div class="ps-management-list" id="admin-users-list"><p class="ps-empty-state">Cargando usuarios…</p></div></section>
            <section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Auditoría reciente</strong><span>Últimos cambios</span></div><div class="ps-management-list" id="admin-audit-list"><p class="ps-empty-state">Cargando auditoría…</p></div></section>
          </div>
        </section>`;
      }

      function renderStudentProgressModule(): string {
        return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title">
          <div class="ps-module-heading"><div><p class="ps-eyebrow"><span class="ps-eyebrow-line"></span>Tu recorrido <span class="ps-breadcrumb">/ Progreso</span></p><h1 id="module-title">Mi progreso<span class="ps-heading-period">.</span></h1><p class="ps-module-description">Revisa tus actividades completadas, puntuaciones y oportunidades para seguir aprendiendo.</p></div><div class="ps-module-total"><span>Sincronizado</span><strong>✓</strong></div></div>
          <div class="ps-admin-panels"><section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Actividades realizadas</strong><span>Datos de tu cuenta</span></div><div class="ps-management-list" id="student-progress-list"><p class="ps-empty-state">Cargando progreso…</p></div></section><section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Notificaciones</strong><span>Actualizaciones</span></div><div class="ps-management-list" id="student-notifications-list"><p class="ps-empty-state">Cargando notificaciones…</p></div></section></div>
        </section>`;
      }

      function renderTeacherReviewModule(): string {
        return `<section class="ps-module-view ps-management-view" aria-labelledby="module-title">
          <div class="ps-module-heading"><div><p class="ps-eyebrow"><span class="ps-eyebrow-line"></span>Espacio docente <span class="ps-breadcrumb">/ Seguimiento</span></p><h1 id="module-title">Seguimiento académico<span class="ps-heading-period">.</span></h1><p class="ps-module-description">Consulta las sesiones realizadas y las calificaciones disponibles para revisión.</p></div><div class="ps-module-total"><span>Registros</span><strong>↗</strong></div></div>
          <form class="ps-management-form" id="grade-form"><div class="ps-management-form-heading"><strong>Registrar calificación</strong><span>Se notificará al estudiante</span></div><div class="ps-management-grid"><label>ID del estudiante<input name="studentId" required placeholder="Identificador de Cognito" /></label><label>ID de actividad<input name="activityId" placeholder="Opcional" /></label><label>Puntaje<input name="score" type="number" min="0" step="0.01" required /></label><label>Puntaje máximo<input name="maxScore" type="number" min="0.01" step="0.01" value="100" required /></label></div><label>Feedback<textarea name="feedback" maxlength="500" placeholder="Orientación para continuar"></textarea></label><button class="ps-create-button" type="submit">Guardar calificación <span>↗</span></button><p class="ps-management-feedback" id="grade-feedback" role="status"></p></form>
          <div class="ps-admin-panels"><section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Sesiones de actividad</strong><span>Últimos registros</span></div><div class="ps-management-list" id="teacher-sessions-list"><p class="ps-empty-state">Cargando sesiones…</p></div></section><section class="ps-management-panel"><div class="ps-management-form-heading"><strong>Calificaciones</strong><span>Últimos registros</span></div><div class="ps-management-list" id="teacher-grades-list"><p class="ps-empty-state">Cargando calificaciones…</p></div></section></div>
        </section>`;
      }

      function wireAcademicModule(role: "student" | "teacher"): void {
        if (role === "student") {
          const list = document.querySelector<HTMLDivElement>("#student-progress-list");
          const notificationsList = document.querySelector<HTMLDivElement>("#student-notifications-list");
          if (!list || !notificationsList) return;
          void listActivitySessions().then((sessions) => {
            list.innerHTML = sessions.length ? sessions.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map((session) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${session.completed ? "Completada" : session.abandoned ? "Abandonada" : "En progreso"} · ${session.topic ?? "Actividad"}</span><h2>${escapeHTML(session.activityTitle)}</h2><p>${session.finishedAt ? `Finalizada ${new Date(session.finishedAt).toLocaleDateString("es-CO")}` : "Todavía no finalizada"}</p></div><strong>${session.score ?? 0} pts</strong></article>`).join("") : `<p class="ps-empty-state">Aún no tienes actividades registradas.</p>`;
          }).catch((error: unknown) => { list.innerHTML = `<p class="ps-empty-state">${escapeHTML(error instanceof Error ? error.message : "No se pudo cargar el progreso.")}</p>`; });
          void listNotifications().then((notifications) => {
            notificationsList.innerHTML = notifications.length ? notifications.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((notification) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${notification.readAt ? "Leída" : "Nueva"} · ${notification.type}</span><h2>${escapeHTML(notification.title)}</h2><p>${escapeHTML(notification.body)}</p></div><time>${new Date(notification.createdAt).toLocaleDateString("es-CO")}</time></article>`).join("") : `<p class="ps-empty-state">No tienes notificaciones.</p>`;
          }).catch((error: unknown) => { notificationsList.innerHTML = `<p class="ps-empty-state">${escapeHTML(error instanceof Error ? error.message : "No se pudieron cargar las notificaciones.")}</p>`; });
          return;
        }
        const sessionsList = document.querySelector<HTMLDivElement>("#teacher-sessions-list");
        const gradesList = document.querySelector<HTMLDivElement>("#teacher-grades-list");
        const gradeForm = document.querySelector<HTMLFormElement>("#grade-form");
        const gradeFeedback = document.querySelector<HTMLParagraphElement>("#grade-feedback");
        if (!sessionsList || !gradesList || !gradeForm || !gradeFeedback || !authSession) return;
        gradeForm.addEventListener("submit", (event) => {
          event.preventDefault();
          const values = new FormData(gradeForm);
          gradeFeedback.textContent = "Guardando calificación…";
          void createGradeRecord({
            studentId: String(values.get("studentId") ?? "").trim(),
            teacherId: authSession!.user.id,
            activityId: String(values.get("activityId") ?? "").trim() || undefined,
            score: Number(values.get("score")),
            maxScore: Number(values.get("maxScore")),
            feedback: String(values.get("feedback") ?? "").trim() || undefined,
          }).then(() => {
            gradeFeedback.textContent = "Calificación guardada y estudiante notificado.";
            gradeForm.reset();
          }).catch((error: unknown) => { gradeFeedback.textContent = error instanceof Error ? error.message : "No se pudo guardar la calificación."; });
        });
        void Promise.all([listActivitySessions(), listGradeRecords()]).then(([sessions, grades]) => {
          sessionsList.innerHTML = sessions.length ? sessions.slice(0, 20).map((session) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${session.completed ? "Completada" : "Pendiente"} · ${session.topic ?? "Actividad"}</span><h2>${escapeHTML(session.activityTitle)}</h2><p>Estudiante: ${escapeHTML(session.owner ?? "Cuenta asociada")}</p></div><strong>${session.score ?? 0} pts</strong></article>`).join("") : `<p class="ps-empty-state">No hay sesiones disponibles.</p>`;
          gradesList.innerHTML = grades.length ? grades.slice(0, 20).map((grade) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${grade.activityId ? "Actividad" : "Registro académico"}</span><h2>${grade.feedback ? escapeHTML(grade.feedback) : "Calificación registrada"}</h2><p>Estudiante: ${escapeHTML(grade.studentId)}</p></div><strong>${grade.score}/${grade.maxScore}</strong></article>`).join("") : `<p class="ps-empty-state">No hay calificaciones disponibles.</p>`;
        }).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "No se pudo cargar el seguimiento.";
          sessionsList.innerHTML = `<p class="ps-empty-state">${escapeHTML(message)}</p>`;
          gradesList.innerHTML = "";
        });
      }

      function wireAdminModule(): void {
        const usersList = document.querySelector<HTMLDivElement>("#admin-users-list");
        const auditList = document.querySelector<HTMLDivElement>("#admin-audit-list");
        if (!usersList || !auditList) return;
        void Promise.all([listUserProfiles(), listAuditLogs()]).then(([users, logs]) => {
          usersList.innerHTML = users.length ? users.map((user) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${user.role ?? "student"} · ${user.status ?? "active"}</span><h2>${escapeHTML(user.displayName)}</h2><p>${escapeHTML(user.email)}${user.institution ? ` · ${escapeHTML(user.institution)}` : ""}</p></div><strong>${user.educationalLevel ?? "Campus"}</strong></article>`).join("") : `<p class="ps-empty-state">No hay perfiles disponibles.</p>`;
          auditList.innerHTML = logs.length ? logs.slice(0, 20).map((log) => `<article class="ps-management-card"><div><span class="ps-feed-tag">${escapeHTML(log.entityType)}</span><h2>${escapeHTML(log.action)}</h2><p>Actor: ${escapeHTML(log.actorId)}</p></div><time>${new Date(log.createdAt).toLocaleString("es-CO")}</time></article>`).join("") : `<p class="ps-empty-state">No hay registros de auditoría.</p>`;
        }).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "No se pudo cargar el centro de control.";
          usersList.innerHTML = `<p class="ps-empty-state">${escapeHTML(message)}</p>`;
          auditList.innerHTML = "";
        });
      }
    } catch (error) {
      feedback.textContent = error instanceof Error ? error.message : "No se pudo cargar la información.";
    }
  };

  void renderList();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    feedback.textContent = "Guardando…";
    if (type === "join") {
      const code = String(data.get("code") ?? "").trim().toUpperCase();
      feedback.textContent = "Buscando grupo…";
      void findStudyGroupByCode(code).then((group) => {
        if (!group) {
          feedback.textContent = "No encontramos un grupo activo con ese código.";
          list.innerHTML = "";
          return;
        }
        list.innerHTML = `<article class="ps-management-card"><div><span class="ps-feed-tag">${group.educationalLevel ?? "Campus"} · Grupo activo</span><h2>${escapeHTML(group.name)}</h2><p>${escapeHTML(group.description ?? "Sin descripción")}</p></div><button class="ps-create-button" id="join-group-button" type="button">Inscribirme <span>↗</span></button></article>`;
        document.querySelector<HTMLButtonElement>("#join-group-button")?.addEventListener("click", () => {
          feedback.textContent = "Inscribiendo…";
          void joinStudyGroup(group.id, authSession!.user.id).then(() => {
            feedback.textContent = "Te inscribiste correctamente al grupo.";
            list.innerHTML = `<p class="ps-empty-state">Grupo agregado a tu recorrido académico.</p>`;
          }).catch((error: unknown) => { feedback.textContent = error instanceof Error ? error.message : "No se pudo completar la inscripción."; });
        });
      }).catch((error: unknown) => { feedback.textContent = error instanceof Error ? error.message : "No se pudo buscar el grupo."; });
      return;
    }
    const operation = type === "groups"
      ? createStudyGroup({
        name: String(data.get("title") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        code: String(data.get("code") ?? "").trim().toUpperCase(),
        teacherId: authSession!.user.id,
        educationalLevel: String(data.get("educationalLevel") ?? "Universitaria") as "Primaria" | "Secundaria" | "Universitaria",
      })
      : type === "news"
        ? createNewsArticle({
        title: String(data.get("title") ?? "").trim(),
        summary: String(data.get("description") ?? "").trim(),
        body: String(data.get("body") ?? "").trim(),
        authorId: authSession!.user.id,
        })
        : createCampusEvent({
          title: String(data.get("title") ?? "").trim(),
          description: String(data.get("description") ?? "").trim(),
          location: String(data.get("location") ?? "").trim(),
          startsAt: new Date(String(data.get("startsAt") ?? "")).toISOString(),
          endsAt: data.get("endsAt") ? new Date(String(data.get("endsAt"))).toISOString() : undefined,
          organizerId: authSession!.user.id,
          capacity: data.get("capacity") ? Number(data.get("capacity")) : undefined,
        });
    void operation.then(() => {
      feedback.textContent = type === "groups" ? "Grupo creado correctamente." : type === "news" ? "Noticia publicada correctamente." : "Evento creado correctamente.";
      form.reset();
      void renderList();
    }).catch((error: unknown) => {
      feedback.textContent = error instanceof Error ? error.message : "No se pudo guardar.";
    });
  });
}

function showGameDialog(group: ActivityGroup): void {
  const engineIds = ["memory", "odd", "timing", "sequence", "maze", "hanoi"];
  const stages = group.stages.map((stage, index) => ({ ...stage, id: engineIds[index] }));
  const topicOptions = gameTopics.map((topic) => `<option value="${escapeHTML(topic)}"${topic === group.topic ? " selected" : ""}>${escapeHTML(topic)}</option>`).join("");
  const levelOptions = educationalLevels.map((level) => `<option value="${level}">${level}</option>`).join("");
  root.insertAdjacentHTML("beforeend", `<dialog class="ps-game-dialog ps-activity-dialog" id="game-dialog" aria-labelledby="game-title"><div class="ps-activity-intro" id="activity-intro"><span class="ps-intro-mark">P</span><strong>PoliScroll</strong><p>${escapeHTML(group.title)}</p><label>Tema educativo<select id="activity-topic">${topicOptions}</select></label><label>Nivel<select id="activity-level">${levelOptions}</select></label><b id="intro-countdown">3</b><small>Comencemos</small></div><div class="ps-activity-time-line"><i id="game-perimeter"></i></div><div class="ps-game-shell"><div class="ps-activity-top"><div><small>ACTIVIDAD INTERACTIVA</small><h2 id="game-title">${escapeHTML(group.title)}</h2></div><strong id="activity-score">0</strong></div><p class="ps-game-description">Completa las ${stages.length} etapas. El recorrido avanzará automáticamente al superar cada actividad.</p><div class="ps-activity-hud"><span><small>ACTIVIDAD</small><strong id="activity-count">1 / ${stages.length}</strong></span><span><small>TIEMPO</small><strong id="game-countdown">90s</strong></span></div><div class="ps-activity-scroll" id="game-stage">${stages.map((stage, index) => `<section class="ps-activity-stage${index === 0 ? " is-active" : ""}" data-stage="${index}"><div class="ps-activity-stage-title"><span>${stage.icon}</span><div><small>JUEGO ${index + 1} · ${stage.source}</small><h3>${stage.title}</h3></div></div><div class="ps-mechanic-board" id="board-${stage.id}"></div></section>`).join("")}<section class="ps-activity-stage ps-activity-finish" id="activity-finish"></section></div></div></dialog>`);
  const dialog = document.querySelector<HTMLDialogElement>("#game-dialog");
  const scroll = document.querySelector<HTMLDivElement>("#game-stage");
  const scoreElement = document.querySelector<HTMLElement>("#activity-score");
  const countElement = document.querySelector<HTMLElement>("#activity-count");
  const countdown = document.querySelector<HTMLElement>("#game-countdown");
  const perimeter = document.querySelector<HTMLElement>("#game-perimeter");
  const topicSelect = document.querySelector<HTMLSelectElement>("#activity-topic");
  const levelSelect = document.querySelector<HTMLSelectElement>("#activity-level");
  if (!dialog || !scroll || !scoreElement || !countElement || !countdown || !perimeter) return;
  let completed = 0;
  let score = 0;
  let finished = false;
  let startedAt = 0;
  let timerFrame = 0;
  let activitySessionId: string | null = null;
  let traceWarning = false;
  const updateHud = (): void => { scoreElement.textContent = String(score); countElement.textContent = `${Math.min(completed + 1, stages.length)} / ${stages.length}`; };
  const trace = (eventType: string, stage?: number, payload?: Record<string, unknown>): void => {
    if (!activitySessionId) return;
    void recordActivityEvent({
      sessionId: activitySessionId,
      activityId: group.id,
      gameId: stage === undefined ? undefined : stages[stage]?.id,
      eventType,
      stage,
      scoreAfter: score,
      timeRemainingMs: startedAt ? Math.max(0, 90000 - Math.round(performance.now() - startedAt)) : undefined,
      payload,
    }).catch(() => { traceWarning = true; });
  };
  const finish = (): void => {
    if (finished) return;
    finished = true;
    window.cancelAnimationFrame(timerFrame);
    const used = Math.ceil((performance.now() - startedAt) / 1000);
    if (activitySessionId) {
      void finishActivitySession({
        sessionId: activitySessionId,
        score,
        durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
        completed: completed === stages.length,
        abandoned: completed !== stages.length,
      }).catch(() => { traceWarning = true; });
    }
    trace(completed === stages.length ? "completed" : "time_expired", undefined, { completedStages: completed });
    const finishStage = document.querySelector<HTMLElement>("#activity-finish");
    if (!finishStage) return;
    finishStage.innerHTML = `<div class="ps-game-result"><span class="ps-game-result-icon">★</span><p class="ps-eyebrow">Actividad completada</p><h3>${score} puntos</h3><div class="ps-game-summary"><span><strong>${completed}/${stages.length}</strong> juegos superados</span><span><strong>${used}s</strong> tiempo usado</span><span><strong>${score >= 500 ? "Excelente" : "En progreso"}</strong> desempeño</span></div><p>${score >= 500 ? "Excelente gestión de tiempo, memoria, precisión y estrategia." : "Finalizaste el recorrido. Repite la actividad para mejorar tu puntuación."}</p><button type="button" class="ps-create-button" data-close-game>Volver a juegos <span>↗</span></button></div>`;
    finishStage.querySelector<HTMLButtonElement>("[data-close-game]")?.addEventListener("click", () => dialog.close());
    finishStage.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const complete = (index: number, points: number): void => {
    if (finished || completed !== index) return;
    score += points;
    completed += 1;
    trace("stage_completed", index, { points });
    document.querySelector<HTMLElement>(`[data-stage="${index}"]`)?.classList.add("is-complete");
    updateHud();
    if (completed === stages.length) { finish(); return; }
    const next = document.querySelector<HTMLElement>(`[data-stage="${completed}"]`);
    next?.classList.add("is-active");
    window.setTimeout(() => next?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  };
  const penalty = (): void => { score = Math.max(0, score - 25); updateHud(); trace("mistake"); };
  const tick = (now: number): void => {
    const progress = Math.max(0, 1 - (now - startedAt) / 90000);
    perimeter.style.transform = `scaleX(${progress})`;
    countdown.textContent = `${Math.ceil(progress * 90)}s`;
    if (progress === 0) finish();
    else timerFrame = window.requestAnimationFrame(tick);
  };
  const memory = document.querySelector<HTMLElement>("#board-memory");
  if (memory) {
    const symbols = ["●", "◆", "▲", "●", "◆", "▲"].sort(() => Math.random() - .5);
    let open: HTMLButtonElement[] = [];
    let pairs = 0;
    memory.innerHTML = `<p>Encuentra las tres parejas.</p><div class="ps-memory-grid">${symbols.map((symbol) => `<button data-symbol="${symbol}">?</button>`).join("")}</div>`;
    memory.querySelectorAll<HTMLButtonElement>("button").forEach((button) => button.addEventListener("click", () => {
      if (button.disabled || open.length === 2) return;
      button.textContent = button.dataset.symbol ?? "";
      open.push(button);
      if (open.length === 2) {
        const [first, second] = open;
        if (first.dataset.symbol === second.dataset.symbol) { first.disabled = second.disabled = true; open = []; pairs += 1; if (pairs === 3) complete(0, 100); }
        else window.setTimeout(() => { first.textContent = second.textContent = "?"; open = []; penalty(); }, 450);
      }
    }));
  }
  const odd = document.querySelector<HTMLElement>("#board-odd");
  if (odd) {
    const oddIndex = Math.floor(Math.random() * 9);
    odd.innerHTML = `<p>Encuentra la figura diferente.</p><div class="ps-odd-grid">${Array.from({ length: 9 }, (_, index) => `<button data-odd="${index === oddIndex}">${index === oddIndex ? "◆" : "●"}</button>`).join("")}</div>`;
    odd.querySelectorAll<HTMLButtonElement>("button").forEach((button) => button.addEventListener("click", () => button.dataset.odd === "true" ? complete(1, 100) : penalty()));
  }
  const timing = document.querySelector<HTMLElement>("#board-timing");
  if (timing) {
    let position = 0;
    let direction = 1;
    let running = false;
    let frame = 0;
    timing.innerHTML = `<p>Detén la barra dentro de la zona marcada.</p><div class="ps-timing-track"><i></i><b></b></div><button class="ps-create-button" id="timing-action">Iniciar</button>`;
    const runner = timing.querySelector<HTMLElement>(".ps-timing-track b");
    const action = timing.querySelector<HTMLButtonElement>("#timing-action");
    const move = (): void => { position += direction * .9; if (position <= 0 || position >= 92) direction *= -1; if (runner) runner.style.left = `${position}%`; if (running) frame = window.requestAnimationFrame(move); };
    action?.addEventListener("click", () => { if (!running) { running = true; action.textContent = "Detener"; move(); } else { running = false; window.cancelAnimationFrame(frame); if (position >= 43 && position <= 56) complete(2, 100); else { penalty(); action.textContent = "Reintentar"; } } });
  }
  const sequence = document.querySelector<HTMLElement>("#board-sequence");
  if (sequence) {
    const pattern = [0, 2, 1, 3];
    let entered: number[] = [];
    sequence.innerHTML = `<p>Memoriza la secuencia iluminada y repítela.</p><div class="ps-sequence-pads">${["A", "B", "C", "D"].map((label, index) => `<button data-pad="${index}">${label}</button>`).join("")}</div>`;
    const pads = [...sequence.querySelectorAll<HTMLButtonElement>("button")];
    const flash = (): void => pattern.forEach((index, position) => window.setTimeout(() => { pads[index].classList.add("is-lit"); window.setTimeout(() => pads[index].classList.remove("is-lit"), 240); }, position * 380));
    flash();
    pads.forEach((pad) => pad.addEventListener("click", () => { const value = Number(pad.dataset.pad); if (value !== pattern[entered.length]) { entered = []; penalty(); flash(); return; } entered.push(value); if (entered.length === pattern.length) complete(3, 100); }));
  }
  const maze = document.querySelector<HTMLElement>("#board-maze");
  if (maze) {
    let player = 0;
    const walls = new Set([1, 4]);
    const draw = (): void => {
      maze.innerHTML = `<p>Lleva el punto hasta la estrella.</p><div class="ps-maze-grid">${Array.from({ length: 9 }, (_, index) => `<span class="${walls.has(index) ? "is-wall" : ""}${index === player ? " is-player" : ""}${index === 8 ? " is-goal" : ""}">${index === player ? "●" : index === 8 ? "★" : ""}</span>`).join("")}</div><div class="ps-maze-controls"><button data-move="-3">↑</button><button data-move="-1">←</button><button data-move="1">→</button><button data-move="3">↓</button></div>`;
      maze.querySelectorAll<HTMLButtonElement>("[data-move]").forEach((button) => button.addEventListener("click", () => { const move = Number(button.dataset.move); const next = player + move; const valid = next >= 0 && next < 9 && !walls.has(next) && !(Math.abs(move) === 1 && Math.floor(next / 3) !== Math.floor(player / 3)); if (!valid) { penalty(); return; } player = next; if (player === 8) complete(4, 100); draw(); }));
    };
    draw();
  }
  const hanoi = document.querySelector<HTMLElement>("#board-hanoi");
  if (hanoi) {
    const towers = [[3, 2, 1], [], []] as number[][];
    let selected: number | null = null;
    const draw = (): void => {
      hanoi.innerHTML = `<p>Mueve los discos a la última torre sin poner uno grande sobre uno pequeño.</p><div class="ps-hanoi">${towers.map((tower, index) => `<button class="${selected === index ? "is-selected" : ""}" data-tower="${index}"><span>${tower.map((disc) => `<i style="--disc-size:${disc}"></i>`).join("")}</span><b>${index + 1}</b></button>`).join("")}</div>`;
      hanoi.querySelectorAll<HTMLButtonElement>("[data-tower]").forEach((button) => button.addEventListener("click", () => { const target = Number(button.dataset.tower); if (selected === null) { if (towers[target].length) selected = target; draw(); return; } const disc = towers[selected].at(-1); const top = towers[target].at(-1); if (disc === undefined || (top !== undefined && top < disc)) { selected = null; penalty(); draw(); return; } towers[target].push(towers[selected].pop()!); selected = null; if (towers[2].length === 3) complete(5, 150); draw(); }));
    };
    draw();
  }
  if (group.id === "trivia") {
    const renderTrivia = (): void => {
      const topicQuestions = questionsByTopic[topicSelect?.value ?? group.topic ?? "Huesos del cuerpo humano"] ?? questionsByTopic["Huesos del cuerpo humano"];
      const triviaRounds = stages.map((_, index) => topicQuestions[index % topicQuestions.length]);
      triviaRounds.forEach((round, index) => {
        const board = document.querySelector<HTMLElement>(`#board-${engineIds[index]}`);
        if (!board) return;
        board.innerHTML = `<p>${round.prompt}</p><div class="ps-game-options">${round.options.map((option, optionIndex) => `<button class="ps-game-option" data-answer="${optionIndex}">${option}</button>`).join("")}</div><small class="ps-question-feedback" aria-live="polite"></small>`;
        const feedback = board.querySelector<HTMLElement>(".ps-question-feedback");
        board.querySelectorAll<HTMLButtonElement>("[data-answer]").forEach((button) => button.addEventListener("click", () => {
          if (Number(button.dataset.answer) === round.answer) {
            feedback?.replaceChildren(document.createTextNode(round.explanation));
            complete(index, 100);
          } else {
            button.classList.add("is-wrong");
            if (feedback) feedback.textContent = "Revisa la respuesta e inténtalo nuevamente.";
            penalty();
          }
        }));
      });
    };
    renderTrivia();
    topicSelect?.addEventListener("change", renderTrivia);
  }
  const intro = document.querySelector<HTMLElement>("#activity-intro");
  const introCountdown = document.querySelector<HTMLElement>("#intro-countdown");
  let introValue = 3;
  const introTimer = window.setInterval(() => {
    introValue -= 1;
    if (introCountdown) introCountdown.textContent = introValue > 0 ? String(introValue) : "¡Ya!";
    if (introValue <= 0) {
      window.clearInterval(introTimer);
      window.setTimeout(() => {
        intro?.classList.add("is-hidden");
        startedAt = performance.now();
        timerFrame = window.requestAnimationFrame(tick);
      }, 500);
    }
  }, 1000);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    window.cancelAnimationFrame(timerFrame);
    if (!finished) {
      trace("abandoned", completed, { completedStages: completed });
      if (activitySessionId) {
        void finishActivitySession({
          sessionId: activitySessionId,
          score,
          durationMs: startedAt ? Math.max(0, Math.round(performance.now() - startedAt)) : 0,
          completed: false,
          abandoned: true,
        }).catch(() => { traceWarning = true; });
      }
    }
    if (traceWarning) showToast("La actividad terminó, pero algunos datos no pudieron sincronizarse.");
    dialog.remove();
  }, { once: true });
  dialog.showModal();
  void createActivitySession({
    activityId: group.id,
    activityTitle: group.title,
    topic: topicSelect?.value ?? group.topic ?? group.title,
    startedAt: new Date().toISOString(),
  }).then((sessionId) => {
    activitySessionId = sessionId;
    trace("started", undefined, {
      topic: topicSelect?.value ?? group.topic ?? group.title,
      level: levelSelect?.value ?? educationalLevels[0],
    });
  }).catch(() => { traceWarning = true; });
  updateHud();
}

function showCreateActivityDialog(module: ModuleData): void {
  root.insertAdjacentHTML("beforeend", `
    <dialog class="ps-create-dialog" id="create-activity-dialog" aria-labelledby="create-activity-title">
      <form id="create-activity-form">
        <div class="ps-dialog-heading"><div><p class="ps-eyebrow"><span class="ps-eyebrow-line"></span> Comunidad Poli</p><h2 id="create-activity-title">Nueva actividad</h2></div><button class="ps-dialog-close" type="button" data-close-dialog aria-label="Cerrar">×</button></div>
        <label>Título<input name="title" required maxlength="80" placeholder="Ej. Taller de prototipado" /></label>
        <label>Descripción<textarea name="description" required maxlength="180" rows="3" placeholder="¿Qué harán quienes se inscriban?"></textarea></label>
        <div class="ps-dialog-row"><label>Profesor o responsable<input name="teacher" required maxlength="50" placeholder="Nombre y apellido" /></label><label>Horario y lugar<input name="schedule" required maxlength="70" placeholder="Jue 14:00 · Edificio C" /></label></div>
        <div class="ps-dialog-actions"><button class="ps-dialog-cancel" type="button" data-close-dialog>Cancelar</button><button class="ps-create-button" type="submit">Publicar actividad <span aria-hidden="true">↗</span></button></div>
      </form>
    </dialog>
  `);

  const dialog = document.querySelector<HTMLDialogElement>("#create-activity-dialog");
  const form = document.querySelector<HTMLFormElement>("#create-activity-form");
  if (!dialog || !form) return;
  dialog.showModal();
  dialog.querySelectorAll<HTMLButtonElement>("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const title = String(values.get("title") ?? "").trim();
    const description = String(values.get("description") ?? "").trim();
    const teacher = String(values.get("teacher") ?? "").trim();
    const schedule = String(values.get("schedule") ?? "").trim();
    if (!title || !description || !teacher || !schedule) return;

    module.items.unshift({
      id: `act-${Date.now()}`,
      title,
      description,
      meta: `Prof. ${teacher} · ${schedule}`,
      tag: "Creada por ti",
      available: true,
      createdByMe: true,
    });
    activityFilter = "mine";
    searchQuery = "";
    document.querySelector<HTMLInputElement>("#module-search")!.value = "";
    document.querySelector<HTMLSelectElement>("#module-filter")!.value = "mine";
    dialog.close();
    renderFeedItems(module);
    showToast("Actividad publicada en tu lista.");
  });
}

function updateDeckChrome(): void {
  const deck = document.querySelector<HTMLDivElement>("#module-deck");
  if (!deck || !deck.clientHeight) return;
  activeDeckIndex = Math.max(0, Math.min(modules.length - 1, Math.round(deck.scrollTop / deck.clientHeight)));
  const current = modules[activeDeckIndex];
  const count = document.querySelector<HTMLSpanElement>("#deck-count");
  if (count) count.textContent = `${String(activeDeckIndex + 1).padStart(2, "0")} / ${String(modules.length).padStart(2, "0")}`;
  document.querySelectorAll<HTMLButtonElement>(".ps-page-dot").forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeDeckIndex);
    dot.setAttribute("aria-current", index === activeDeckIndex ? "step" : "false");
  });
  updatePreview("#previous-preview", modules[activeDeckIndex - 1], "top");
  updatePreview("#next-preview", modules[activeDeckIndex + 1], "bottom");
  deck.setAttribute("aria-label", `Módulo ${activeDeckIndex + 1} de ${modules.length}: ${current.title}`);
}

function updatePreview(selector: string, module: ModuleData | undefined, edge: "top" | "bottom"): void {
  const button = document.querySelector<HTMLButtonElement>(selector);
  if (!button) return;
  const isTop = edge === "top";
  button.disabled = !module;
  button.innerHTML = module
    ? `<span class="ps-preview-icon" aria-hidden="true">${module.icon}</span><span class="ps-preview-copy"><small>${isTop ? "ANTERIOR" : "SIGUIENTE"} · ${module.category}</small><strong>${module.title}</strong></span><span class="ps-preview-arrow" aria-hidden="true">${isTop ? "↑" : "↓"}</span>`
    : `<span class="ps-preview-icon" aria-hidden="true">${isTop ? "↟" : "↡"}</span><span class="ps-preview-copy"><small>${isTop ? "INICIO DEL RECORRIDO" : "FIN DEL RECORRIDO"}</small><strong>${isTop ? "Primer módulo" : "Has visto todo"}</strong></span>`;
  button.setAttribute("aria-label", module ? `${isTop ? "Ir al módulo anterior" : "Ir al siguiente módulo"}: ${module.title}` : isTop ? "Inicio del recorrido" : "Fin del recorrido");
}

function scrollToModule(index: number): void {
  const deck = document.querySelector<HTMLDivElement>("#module-deck");
  if (!deck) return;
  const targetIndex = Math.max(0, Math.min(modules.length - 1, index));
  deck.scrollTo({ top: targetIndex * deck.clientHeight, behavior: "smooth" });
}

function openModule(moduleId: string): void {
  selectedModuleId = modules.some((module) => module.id === moduleId) ? moduleId : modules[0].id;
  searchQuery = "";
  activityFilter = "all";
  screen = "module";
  history.pushState({ screen, moduleId: selectedModuleId } satisfies AppRoute, "", `#module/${selectedModuleId}`);
  render();
}

function goHome(): void {
  if (screen === "home") return;
  screen = "home";
  history.pushState({ screen } satisfies AppRoute, "", "#home");
  render();
}

function applyRoute(route: AppRoute): void {
  if (route.screen === "module" && route.moduleId && modules.some((module) => module.id === route.moduleId)) {
    selectedModuleId = route.moduleId;
    screen = "module";
  } else {
    screen = "home";
  }
  searchQuery = "";
  activityFilter = "all";
  render();
}

function initializeRoute(): void {
  if (routeInitialized) return;
  routeInitialized = true;
  window.addEventListener("popstate", (event) => {
    if (!authSession) return;
    applyRoute((event.state as AppRoute | null) ?? { screen: "home" });
  });
  history.replaceState({ screen: "home" } satisfies AppRoute, "", "#home");
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLDivElement>("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2200);
}

async function bootstrap(): Promise<void> {
  try {
    if (await configureAmplify()) {
      authSession = await getSession();
      if (authSession) {
        await ensureUserProfile(authSession);
        dashboardSummary = await getDashboardSummary(authSession);
        initializeRoute();
      }
    }
  } catch (error) {
    console.error("No se pudo inicializar la autenticación de PoliScroll.", error);
    authFeedback = "El servicio de acceso no está disponible. Inténtalo de nuevo.";
  } finally {
    authReady = true;
    render();
  }
}

void bootstrap();
