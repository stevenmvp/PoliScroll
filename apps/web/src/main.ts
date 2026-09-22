import "./styles.css";

type Section = "Noticias" | "Actividades" | "Grupos" | "Perfil";

const sections: Array<{ id: Section; icon: string }> = [
  { id: "Noticias", icon: "⌂" },
  { id: "Actividades", icon: "▣" },
  { id: "Grupos", icon: "◌" },
  { id: "Perfil", icon: "♙" },
];

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("No se encontro el contenedor principal.");
}

const root = app;
let activeSection: Section = "Noticias";
let isCollapsed = false;

function render(): void {
  root.innerHTML = `
    <div class="app${isCollapsed ? " is-collapsed" : ""}">
      <aside class="sidebar" aria-label="Navegacion principal">
        <div class="brand"><span class="brand-mark" aria-hidden="true">P</span><strong>PoliScroll</strong></div>
        <p class="eyebrow">PoliBoards</p>
        <nav class="menu" aria-label="Secciones">
          ${sections.map((section) => menuButton(section)).join("")}
        </nav>
        <p class="sidebar-note">Contenido que se adapta a tu ritmo y a tus intereses.</p>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="toggle" id="toggle" type="button" aria-label="${isCollapsed ? "Expandir" : "Colapsar"} navegacion" aria-expanded="${!isCollapsed}" title="${isCollapsed ? "Expandir" : "Colapsar"} navegacion">${isCollapsed ? "→" : "←"}</button>
          <div class="topbar-tools"><label class="search"><span aria-hidden="true">⌕</span><input aria-label="Buscar" placeholder="Buscar" /></label><span class="status">En linea</span></div>
        </header>
        <main class="content">
          <section class="hero" aria-labelledby="page-title">
            <div><p class="eyebrow">Noticias para ti</p><h1 id="page-title">PoliBoards <em>a tu medida.</em></h1></div>
            <p class="intro">Explora actividades, grupos y oportunidades que hacen crecer tu experiencia universitaria.</p>
          </section>
          <section class="modules" aria-label="Recomendaciones para ti">
            <article class="module module-sport"><div class="module-art">✦</div><div><span class="module-kicker">Bienestar</span><h2>Actividades deportivas</h2><p>Descubre espacios para moverte, compartir y cuidar tu salud.</p><strong>54% de participación</strong></div><button class="outline-button" type="button" data-action="Inscribirme">Inscribirme <span>→</span></button></article>
            <article class="module module-stem"><div class="module-art">⌘</div><div><span class="module-kicker">Aprendizaje</span><h2>Cursos complementarios STEM</h2><p>Programación, robótica e innovación tecnológica a tu alcance.</p><strong>1.1K estudiantes activos</strong></div><button class="outline-button" type="button" data-action="Ver oferta">Ver oferta <span>→</span></button></article>
            <article class="module module-groups"><div class="module-art">◌</div><div><span class="module-kicker">Comunidad</span><h2>Comunidades y grupos</h2><p>Únete a grupos de interés, culturales y de bienestar estudiantil.</p><strong>18 grupos disponibles</strong></div><button class="outline-button" type="button" data-action="Explorar">Explorar <span>→</span></button></article>
          </section>
          <section class="quick-actions" aria-label="Acciones rápidas"><button type="button" data-action="No me interesa">No me interesa</button><button type="button" data-action="Actualizar">Actualizar <span aria-hidden="true">↻</span></button></section>
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

  document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
    button.addEventListener("click", () => showToast(`${button.dataset.action}: estamos preparando esta experiencia.`));
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
