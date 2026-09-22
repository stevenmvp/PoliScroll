import "./styles.css";

type Section = "Inicio" | "Retos" | "Progreso";

const sections: Array<{ id: Section; icon: string }> = [
  { id: "Inicio", icon: "⌂" },
  { id: "Retos", icon: "▣" },
  { id: "Progreso", icon: "↗" },
];

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("No se encontro el contenedor principal.");
}

const root = app;
let activeSection: Section = "Inicio";
let isCollapsed = false;

function render(): void {
  root.innerHTML = `
    <div class="app${isCollapsed ? " is-collapsed" : ""}">
      <aside class="sidebar" aria-label="Navegacion principal">
        <div class="brand"><span class="brand-mark" aria-hidden="true">P</span><strong>PoliScroll</strong></div>
        <p class="eyebrow">Espacio de aprendizaje</p>
        <nav class="menu" aria-label="Secciones">
          ${sections.map((section) => menuButton(section)).join("")}
        </nav>
        <p class="sidebar-note">Aprende en pequenas dosis. Vuelve cuando quieras.</p>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="toggle" id="toggle" type="button" aria-label="${isCollapsed ? "Expandir" : "Colapsar"} navegacion" aria-expanded="${!isCollapsed}" title="${isCollapsed ? "Expandir" : "Colapsar"} navegacion">${isCollapsed ? "→" : "←"}</button>
          <div class="status">Base TypeScript conectada</div>
        </header>
        <main class="content">
          <section class="hero" aria-labelledby="page-title">
            <div><p class="eyebrow">Fase 1 / Shell adaptable</p><h1 id="page-title">Aprender puede moverse contigo.</h1></div>
            <p class="intro">Una base flexible para estudiar desde el telefono, la tablet o un escritorio amplio.</p>
          </section>
          <section class="modules" aria-label="Modulos principales">
            <article class="module"><span class="module-icon" aria-hidden="true">◌</span><h2>Descubre</h2><p>Contenido corto para entrar en ritmo sin perder el hilo.</p></article>
            <article class="module"><span class="module-icon" aria-hidden="true">✦</span><h2>Practica</h2><p>Retos breves que convierten una idea en una habilidad.</p></article>
            <article class="module"><span class="module-icon" aria-hidden="true">↗</span><h2>Avanza</h2><p>Progreso visible para saber que el esfuerzo deja huella.</p></article>
          </section>
        </main>
      </div>
      <nav class="mobile-nav" aria-label="Navegacion movil">
        ${sections.map((section) => mobileButton(section)).join("")}
      </nav>
      <div class="toast" id="toast" role="status" hidden></div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>("#toggle")?.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    render();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSection = button.dataset.section as Section;
      render();
      showToast(`${activeSection}: modulo preparado para la siguiente fase.`);
    });
  });
}

function menuButton(section: { id: Section; icon: string }): string {
  const active = activeSection === section.id ? " is-active" : "";
  return `<button class="menu-button${active}" type="button" data-section="${section.id}"><span class="menu-icon" aria-hidden="true">${section.icon}</span><span class="menu-label">${section.id}</span></button>`;
}

function mobileButton(section: { id: Section; icon: string }): string {
  const active = activeSection === section.id ? " is-active" : "";
  return `<button class="mobile-button${active}" type="button" data-section="${section.id}"><span aria-hidden="true">${section.icon}</span><small>${section.id}</small></button>`;
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLDivElement>("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 1800);
}

render();
