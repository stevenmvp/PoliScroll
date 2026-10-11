import "./styles.css";

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
  stages: { title: string; source: string; icon: string }[];
}

type EducationalLevel = "Primaria" | "Secundaria" | "Universitaria";

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
  { id: "trivia", title: "Reto relámpago", description: "Seis desafíos de decisión rápida con preguntas breves.", icon: "?", mode: "Trivia", stages: [{ title: "Arranque rápido", source: "Quiz Game", icon: "?" }, { title: "Duelo matemático", source: "Math Duel", icon: "⚡" }, { title: "Código veloz", source: "Code Breaker", icon: "#" }, { title: "Cronología", source: "History Timeline", icon: "◷" }, { title: "Banderas", source: "Flag Guess", icon: "⚑" }, { title: "Jefe de trivia", source: "Quiz Game", icon: "★" }] },
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
    id: "actividades-juego", title: "Actividades de juego", category: "Recorridos interactivos", description: "Elige un grupo y completa seis minijuegos consecutivos con tiempo, puntos y feedback final.", icon: "◉", tone: "cyan", metric: "Recorridos", total: "6 actividades", action: "Comenzar",
    items: activityGroups.map((group) => ({ id: group.id, title: group.title, description: group.description, meta: `${group.mode} · 6 minijuegos`, tag: "Actividad completa", available: true })),
  },
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
let gameLevelFilter: EducationalLevel | "all" = "all";
let toastTimer = 0;
const savedItems = new Set<string>();

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function render(): void {
  const selectedModule = modules.find((module) => module.id === selectedModuleId) ?? modules[0];
  root.innerHTML = `
    <div class="ps-app">
      <header class="ps-topbar">
        <button class="ps-brand" id="go-home" type="button" aria-label="Volver al menu principal">
          <span class="ps-brand-mark" aria-hidden="true">P</span><span>PoliScroll</span>
        </button>
        <div class="ps-topbar-right">
          <span class="ps-campus"><span class="ps-online-dot"></span> Campus conectado</span>
          ${screen === "module" ? `<button class="ps-back" id="back-to-menu" type="button"><span aria-hidden="true">←</span> Menú principal</button>` : `<span class="ps-user-mark" aria-label="Perfil estudiantil">A</span>`}
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
        <div class="ps-chat-heading"><div class="ps-chat-brand"><span class="ps-chat-small-mark" aria-hidden="true">P</span><div><h2 id="polichat-title">PoliChat</h2><span>Asistente del campus · demo</span></div></div><button class="ps-dialog-close" id="close-polichat" type="button" aria-label="Cerrar PoliChat">×</button></div>
        <div class="ps-chat-messages" id="polichat-messages" aria-live="polite"><p class="ps-chat-message is-bot">¡Hola! Puedo orientarte para encontrar actividades, cursos y servicios del campus.</p></div>
        <form class="ps-chat-form" id="polichat-form"><input id="polichat-input" type="text" maxlength="240" placeholder="Escribe tu pregunta" aria-label="Escribe tu pregunta" required /><button type="submit" aria-label="Enviar mensaje">↑</button></form>
      </dialog>
      <div class="ps-toast" id="toast" role="status" aria-live="polite" hidden></div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>("#go-home")?.addEventListener("click", goHome);
  document.querySelector<HTMLButtonElement>("#back-to-menu")?.addEventListener("click", goHome);
  document.querySelectorAll<HTMLButtonElement>("[data-bottom-module]").forEach((button) => {
    button.addEventListener("click", () => openModule(button.dataset.bottomModule ?? modules[0].id));
  });

  const chatDialog = document.querySelector<HTMLDialogElement>("#polichat-dialog");
  document.querySelector<HTMLButtonElement>("#open-polichat")?.addEventListener("click", () => chatDialog?.showModal());
  document.querySelector<HTMLButtonElement>("#close-polichat")?.addEventListener("click", () => chatDialog?.close());
  document.querySelector<HTMLFormElement>("#polichat-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#polichat-input");
    const messages = document.querySelector<HTMLDivElement>("#polichat-messages");
    const text = input?.value.trim();
    if (!input || !messages || !text) return;

    appendChatMessage(messages, text, "is-user");
    input.value = "";
    appendChatMessage(messages, "Estoy en modo demo. Explora Actividades, Cursos o Bienestar desde el menú inferior.", "is-bot");
    messages.scrollTop = messages.scrollHeight;
  });

  if (screen === "home") wireHome();
  else wireModule(selectedModule);
}

function appendChatMessage(container: HTMLDivElement, text: string, className: string): void {
  const message = document.createElement("p");
  message.className = `ps-chat-message ${className}`;
  message.textContent = text;
  container.append(message);
}

function renderHome(): string {
  return `
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

function renderModule(module: ModuleData): string {
  const isActivities = module.id === "actividades";
  const isGames = module.id === "juegos";
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
        ${isGames ? `<label class="ps-filter-field"><span>Área</span><select id="game-level-filter" aria-label="Filtrar por área educativa"><option value="all">Todas las áreas</option>${educationalLevels.map((level) => `<option value="${level}">${level}</option>`).join("")}</select></label>` : ""}
        ${isActivities ? `<button class="ps-create-button" id="create-activity" type="button"><span aria-hidden="true">＋</span> Crear actividad</button>` : isGames ? `<span class="ps-game-hint">Elige un tema y supera 5 retos</span>` : ""}
      </div>
      <div class="ps-feed-caption"><span id="feed-result-count"></span><span class="ps-feed-caption-note">${isGames ? "Una mecánica, muchos temas: el contenido se adapta a tu elección" : isActivities ? "Actividades disponibles y de tu autoría" : "Contenido actualizado del campus"}</span></div>
      <div class="ps-module-feed" id="module-feed" aria-live="polite" aria-busy="false"></div>
    </section>
  `;
}

function renderFeedItems(module: ModuleData): void {
  const feed = document.querySelector<HTMLDivElement>("#module-feed");
  if (!feed) return;

  const query = searchQuery.trim().toLocaleLowerCase("es");
  if (module.id === "actividades-juego") {
    const filteredGroups = activityGroups.filter((group) => `${group.title} ${group.description} ${group.mode}`.toLocaleLowerCase("es").includes(query));
    document.querySelector<HTMLSpanElement>("#feed-result-count")!.textContent = `${filteredGroups.length} ${filteredGroups.length === 1 ? "actividad" : "actividades"}`;
    feed.innerHTML = filteredGroups.map((group, index) => `
      <article class="ps-feed-card ps-game-card" style="--item-order:${index}">
        <div class="ps-feed-card-top"><span class="ps-feed-tag">${group.mode} · 6 minijuegos</span><span class="ps-feed-index">${String(index + 1).padStart(2, "0")}</span></div>
        <div class="ps-game-icon" aria-hidden="true">${group.icon}</div>
        <div class="ps-feed-card-content"><h2>${group.title}</h2><p>${group.description}</p><span class="ps-feed-meta"><span aria-hidden="true">✦</span>${group.stages.map((stage) => stage.source).slice(0, 3).join(" · ")}</span></div>
        <button class="ps-feed-action" type="button" data-play-activity="${group.id}">Comenzar<span aria-hidden="true">↗</span></button>
      </article>
    `).join("");
    feed.querySelectorAll<HTMLButtonElement>("[data-play-activity]").forEach((button) => button.addEventListener("click", () => {
      const group = activityGroups.find((candidate) => candidate.id === button.dataset.playActivity);
      if (group) showGameDialog(group);
    }));
    return;
  }
  if (module.id === "juegos") {
    const selectedTopic = activityFilter;
    const filteredGames = educationalGames.filter((game) => {
      const matchesQuery = `${game.title} ${game.description} ${game.mechanic} ${game.skills}`.toLocaleLowerCase("es").includes(query);
      const matchesTopic = selectedTopic === "all" || game.topics.includes(selectedTopic);
      const matchesLevel = gameLevelFilter === "all" || game.levels?.includes(gameLevelFilter);
      return matchesQuery && matchesTopic && matchesLevel;
    });
    document.querySelector<HTMLSpanElement>("#feed-result-count")!.textContent = `${filteredGames.length} ${filteredGames.length === 1 ? "juego" : "juegos"}`;
    feed.innerHTML = filteredGames.length ? filteredGames.map((game, index) => `
      <article class="ps-feed-card ps-game-card" style="--item-order:${index}">
        <div class="ps-feed-card-top"><span class="ps-feed-tag">${game.difficulty} · ${game.mechanic}</span><span class="ps-feed-index">${String(index + 1).padStart(2, "0")}</span></div>
        <div class="ps-game-icon" aria-hidden="true">${game.icon}</div>
        <div class="ps-feed-card-content"><h2>${game.title}</h2><p>${game.description}</p><span class="ps-feed-meta"><span aria-hidden="true">✦</span>Mecánica original: ${game.originalMechanic} · Primaria · Secundaria · Universitaria</span></div>
        <button class="ps-feed-action" type="button" data-play-game="${game.id}">Jugar ahora<span aria-hidden="true">↗</span></button>
      </article>
    `).join("") : `<div class="ps-empty-state"><span aria-hidden="true">⌕</span><strong>No encontramos juegos</strong><p>Prueba con otro tema o mecánica.</p></div>`;
    feed.querySelectorAll<HTMLButtonElement>("[data-play-game]").forEach((button) => {
      button.addEventListener("click", () => {
        const game = educationalGames.find((candidate) => candidate.id === button.dataset.playGame);
        if (game) showToast(`${game.title}: mecánica individual disponible para la siguiente fase de portado.`);
      });
    });
    return;
  }

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
  document.querySelector<HTMLSelectElement>("#module-filter")?.addEventListener("change", (event) => {
    activityFilter = (event.currentTarget as HTMLSelectElement).value;
    renderFeedItems(module);
  });
  document.querySelector<HTMLSelectElement>("#game-level-filter")?.addEventListener("change", (event) => {
    gameLevelFilter = (event.currentTarget as HTMLSelectElement).value as EducationalLevel | "all";
    renderFeedItems(module);
  });
  document.querySelector<HTMLInputElement>("#module-search")?.addEventListener("input", (event) => {
    searchQuery = (event.currentTarget as HTMLInputElement).value;
    renderFeedItems(module);
  });
  document.querySelector<HTMLButtonElement>("#create-activity")?.addEventListener("click", () => showCreateActivityDialog(module));
  renderFeedItems(module);
}

function showGameDialog(group: ActivityGroup): void {
  const engineIds = ["memory", "odd", "timing", "sequence", "maze", "hanoi"];
  const stages = group.stages.map((stage, index) => ({ ...stage, id: engineIds[index] }));
  root.insertAdjacentHTML("beforeend", `<dialog class="ps-game-dialog ps-activity-dialog" id="game-dialog" aria-labelledby="game-title"><div class="ps-activity-intro" id="activity-intro"><span class="ps-intro-mark">P</span><strong>PoliScroll</strong><p>${escapeHTML(group.title)}</p><b id="intro-countdown">3</b><small>Comencemos</small></div><div class="ps-activity-time-line"><i id="game-perimeter"></i></div><div class="ps-game-shell"><div class="ps-activity-top"><div><small>ACTIVIDAD INTERACTIVA</small><h2 id="game-title">${escapeHTML(group.title)}</h2></div><strong id="activity-score">0</strong></div><p class="ps-game-description">Completa los seis minijuegos. El recorrido avanzará automáticamente al superar cada actividad.</p><div class="ps-activity-hud"><span><small>ACTIVIDAD</small><strong id="activity-count">1 / 6</strong></span><span><small>TIEMPO</small><strong id="game-countdown">90s</strong></span></div><div class="ps-activity-scroll" id="game-stage">${stages.map((stage, index) => `<section class="ps-activity-stage${index === 0 ? " is-active" : ""}" data-stage="${index}"><div class="ps-activity-stage-title"><span>${stage.icon}</span><div><small>JUEGO ${index + 1} · ${stage.source}</small><h3>${stage.title}</h3></div></div><div class="ps-mechanic-board" id="board-${stage.id}"></div></section>`).join("")}<section class="ps-activity-stage ps-activity-finish" id="activity-finish"></section></div><audio id="game-music" preload="metadata" loop src="/audio/poliscroll-planning.mp3"></audio></div></dialog>`);
  const dialog = document.querySelector<HTMLDialogElement>("#game-dialog");
  const scroll = document.querySelector<HTMLDivElement>("#game-stage");
  const scoreElement = document.querySelector<HTMLElement>("#activity-score");
  const countElement = document.querySelector<HTMLElement>("#activity-count");
  const countdown = document.querySelector<HTMLElement>("#game-countdown");
  const perimeter = document.querySelector<HTMLElement>("#game-perimeter");
  const music = document.querySelector<HTMLAudioElement>("#game-music");
  if (!dialog || !scroll || !scoreElement || !countElement || !countdown || !perimeter || !music) return;
  const correctSound = new Audio("/audio/poliscroll-beeper.mp3");
  music.volume = .12;
  correctSound.volume = .2;
  let completed = 0;
  let score = 0;
  let finished = false;
  let startedAt = 0;
  let timerFrame = 0;
  const updateHud = (): void => { scoreElement.textContent = String(score); countElement.textContent = `${Math.min(completed + 1, 6)} / 6`; };
  const finish = (): void => {
    if (finished) return;
    finished = true;
    window.cancelAnimationFrame(timerFrame);
    const used = Math.ceil((performance.now() - startedAt) / 1000);
    const finishStage = document.querySelector<HTMLElement>("#activity-finish");
    if (!finishStage) return;
    finishStage.innerHTML = `<div class="ps-game-result"><span class="ps-game-result-icon">★</span><p class="ps-eyebrow">Actividad completada</p><h3>${score} puntos</h3><div class="ps-game-summary"><span><strong>${completed}/6</strong> juegos superados</span><span><strong>${used}s</strong> tiempo usado</span><span><strong>${score >= 500 ? "Excelente" : "En progreso"}</strong> desempeño</span></div><p>${score >= 500 ? "Excelente gestión de tiempo, memoria, precisión y estrategia." : "Finalizaste el recorrido. Repite la actividad para mejorar tu puntuación."}</p><button type="button" class="ps-create-button" data-close-game>Volver a juegos <span>↗</span></button></div>`;
    finishStage.querySelector<HTMLButtonElement>("[data-close-game]")?.addEventListener("click", () => dialog.close());
    finishStage.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const complete = (index: number, points: number): void => {
    if (finished || completed !== index) return;
    score += points;
    completed += 1;
    correctSound.currentTime = 0;
    correctSound.play().catch(() => undefined);
    document.querySelector<HTMLElement>(`[data-stage="${index}"]`)?.classList.add("is-complete");
    updateHud();
    if (completed === 6) { finish(); return; }
    const next = document.querySelector<HTMLElement>(`[data-stage="${completed}"]`);
    next?.classList.add("is-active");
    window.setTimeout(() => next?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  };
  const penalty = (): void => { score = Math.max(0, score - 25); updateHud(); };
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
    const triviaRounds = [
      { prompt: "¿Qué hueso protege el cerebro?", options: ["Cráneo", "Fémur", "Radio"], answer: 0 },
      { prompt: "¿Qué hueso está en el muslo?", options: ["Fémur", "Clavícula", "Cúbito"], answer: 0 },
      { prompt: "¿Qué estructura protege corazón y pulmones?", options: ["Costillas", "Falanges", "Tibia"], answer: 0 },
      { prompt: "¿Cuál es una articulación?", options: ["Cadera", "Cráneo", "Esternón"], answer: 0 },
      { prompt: "¿Qué producen muchos huesos en su interior?", options: ["Células sanguíneas", "Aire", "Lágrimas"], answer: 0 },
      { prompt: "¿Qué hueso forma parte del antebrazo?", options: ["Radio", "Fémur", "Rótula"], answer: 0 },
    ];
    triviaRounds.forEach((round, index) => {
      const board = document.querySelector<HTMLElement>(`#board-${engineIds[index]}`);
      if (!board) return;
      board.innerHTML = `<p>${round.prompt}</p><div class="ps-game-options">${round.options.map((option, optionIndex) => `<button class="ps-game-option" data-answer="${optionIndex}">${option}</button>`).join("")}</div>`;
      board.querySelectorAll<HTMLButtonElement>("[data-answer]").forEach((button) => button.addEventListener("click", () => {
        if (Number(button.dataset.answer) === round.answer) complete(index, 100);
        else { button.classList.add("is-wrong"); penalty(); }
      }));
    });
  }
  const intro = document.querySelector<HTMLElement>("#activity-intro");
  const introCountdown = document.querySelector<HTMLElement>("#intro-countdown");
  let introValue = 3;
  const introTimer = window.setInterval(() => {
    introValue -= 1;
    if (introCountdown) introCountdown.textContent = introValue > 0 ? String(introValue) : "¡Ya!";
    if (introValue <= 0) {
      window.clearInterval(introTimer);
      correctSound.currentTime = 0;
      correctSound.play().catch(() => undefined);
      window.setTimeout(() => {
        intro?.classList.add("is-hidden");
        startedAt = performance.now();
        timerFrame = window.requestAnimationFrame(tick);
      }, 500);
    }
  }, 1000);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { window.cancelAnimationFrame(timerFrame); music.pause(); dialog.remove(); }, { once: true });
  dialog.showModal();
  music.play().catch(() => showToast("El juego continúa sin música de fondo."));
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
  gameLevelFilter = "all";
  screen = "module";
  render();
}

function goHome(): void {
  screen = "home";
  render();
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLDivElement>("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2200);
}

render();
