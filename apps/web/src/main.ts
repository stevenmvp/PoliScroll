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
        <label class="ps-filter-field"><span>Filtrar</span><select id="module-filter" aria-label="Filtrar ${module.title}">
          ${isActivities ? `<option value="all">Todas</option><option value="available">Con cupos</option><option value="mine">Creadas por mí</option>` : `<option value="all">Todo el módulo</option><option value="saved">Guardados</option>`}
        </select></label>
        ${isActivities ? `<button class="ps-create-button" id="create-activity" type="button"><span aria-hidden="true">＋</span> Crear actividad</button>` : ""}
      </div>
      <div class="ps-feed-caption"><span id="feed-result-count"></span><span class="ps-feed-caption-note">${isActivities ? "Actividades disponibles y de tu autoría" : "Contenido actualizado del campus"}</span></div>
      <div class="ps-module-feed" id="module-feed" aria-live="polite" aria-busy="false"></div>
    </section>
  `;
}

function renderFeedItems(module: ModuleData): void {
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
  document.querySelector<HTMLInputElement>("#module-search")?.addEventListener("input", (event) => {
    searchQuery = (event.currentTarget as HTMLInputElement).value;
    renderFeedItems(module);
  });
  document.querySelector<HTMLButtonElement>("#create-activity")?.addEventListener("click", () => showCreateActivityDialog(module));
  renderFeedItems(module);
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
