"use client";

import { useEffect, useState } from "react";

type Tab = "inicio" | "actividades" | "chat" | "perfil";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "inicio", label: "Inicio", icon: "⌂" },
  { id: "actividades", label: "Retos", icon: "▣" },
  { id: "chat", label: "PoliChat", icon: "◌" },
  { id: "perfil", label: "Perfil", icon: "♙" },
];

const options = ["La fuerza", "El movimiento", "La energía", "La velocidad"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const onlineHandler = () => setOnline(true);
    const offlineHandler = () => setOnline(false);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  return (
    <main className={`app-shell ${navCollapsed ? "nav-collapsed" : ""}`}>
      <aside className="desktop-sidebar" aria-label="Navegación lateral">
        <div className="sidebar-heading">
          <span className="sidebar-kicker">ESPACIO</span>
          <strong>Aprendizaje</strong>
        </div>
        <nav className="sidebar-nav" aria-label="Secciones de aprendizaje">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-item ${activeTab === tab.id ? "active" : ""}`}
              aria-label={tab.label}
              title={navCollapsed ? tab.label : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <small>{tab.label}</small>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">Tu próximo reto está a un gesto de distancia.</div>
      </aside>
      <header className="topbar">
        <div className="topbar-brand">
          <button
            className="sidebar-toggle"
            aria-label={navCollapsed ? "Expandir navegación" : "Colapsar navegación"}
            aria-expanded={!navCollapsed}
            title={navCollapsed ? "Expandir navegación" : "Colapsar navegación"}
            onClick={() => setNavCollapsed((collapsed) => !collapsed)}
          >
            <span aria-hidden="true">{navCollapsed ? "→" : "←"}</span>
          </button>
          <span className="brand-mark">P</span><strong>PoliBoards</strong>
        </div>
        <div className="top-actions">
          <span className={`connection ${online ? "is-online" : "is-offline"}`} aria-label={online ? "En línea" : "Sin conexión"}>●</span>
          <button className="icon-button" aria-label="Buscar" onClick={() => showNotice("Búsqueda próximamente")}>⌕</button>
        </div>
      </header>

      {!online && <div className="offline-banner">Sin conexión · tus actividades guardadas siguen disponibles</div>}

      {activeTab === "inicio" ? (
        <div className="feed" aria-label="Feed de aprendizaje">
          <section className="feed-card welcome-card">
            <div className="card-kicker">POLISCROLL · HOY</div>
            <h1>Aprende en movimiento.</h1>
            <p>Desliza para descubrir una nueva forma de estudiar, practicar y compartir.</p>
            <div className="welcome-stats"><span><b>12</b> días de racha</span><span><b>240</b> XP esta semana</span></div>
            <span className="swipe-hint">Desliza hacia arriba <b>↑</b></span>
          </section>

          <section className="feed-card quiz-card">
            <div className="feed-card-header"><span className="type-pill navy">EVALUACIÓN RÁPIDA</span><span className="card-count">01 / 04</span></div>
            <h2>¿Qué estudia la biomecánica?</h2>
            <p className="question-copy">Pon a prueba tu intuición antes de continuar.</p>
            <div className="answer-list">
              {options.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === "El movimiento";
                return <button key={option} className={`answer-option ${isSelected ? (isCorrect ? "correct" : "wrong") : ""}`} onClick={() => setSelectedAnswer(option)}>{option}<span>{isSelected ? (isCorrect ? "✓" : "×") : "→"}</span></button>;
              })}
            </div>
            <div className="progress-line"><i style={{ width: "25%" }} /></div>
            {selectedAnswer && <p className={`answer-feedback ${selectedAnswer === "El movimiento" ? "success" : "error"}`}>{selectedAnswer === "El movimiento" ? "¡Correcto! +20 XP" : "Casi. Revisa el concepto y vuelve a intentarlo."}</p>}
          </section>

          <section className="feed-card challenge-card">
            <div className="feed-card-header"><span className="type-pill cyan">MINI-RETO</span><span className="card-count">02 / 04</span></div>
            <div className="challenge-icon">⚙</div>
            <h2>Activa el brazo robótico</h2>
            <p>Ordena los pasos del circuito lógico para completar el reto.</p>
            <button className="action-button cyan-button" onClick={() => showNotice("Reto preparado para jugar")}>Comenzar reto <span>→</span></button>
          </section>

          <section className="feed-card flashcard-card">
            <div className="feed-card-header"><span className="type-pill yellow">PÍLDORA DE CONOCIMIENTO</span><span className="card-count">03 / 04</span></div>
            <span className="flashcard-label">CONCEPTO DEL DÍA</span>
            <h2>La energía no se crea ni se destruye.</h2>
            <p>Solo se transforma. Guarda esta tarjeta para repasarla más tarde.</p>
            <button className="action-button dark-button" onClick={() => showNotice("Tarjeta guardada en tu biblioteca")}>Guardar tarjeta <span>＋</span></button>
          </section>
        </div>
      ) : <PlaceholderView tab={activeTab} onAction={showNotice} />}

      {notice && <div className="toast" role="status">{notice}</div>}
      <button className="party-button" aria-label="Abrir PoliChat" onClick={() => { setActiveTab("chat"); showNotice("PoliChat está listo para ayudarte"); }}><span className="party-logo">P</span><b>PoliChat</b><small>pregunta</small></button>
      <nav className="bottom-nav" aria-label="Navegación principal">
        {tabs.map((tab) => <button key={tab.id} className={`nav-item ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}><span>{tab.icon}</span><small>{tab.label}</small></button>)}
      </nav>
    </main>
  );
}

function PlaceholderView({ tab, onAction }: { tab: Tab; onAction: (message: string) => void }) {
  const content = ({ actividades: ["Tu biblioteca de retos", "Retos guardados, actividades de tus profesores y nuevas experiencias."], chat: ["PoliChat", "Tu asistente para entender conceptos, practicar y crear actividades."], perfil: ["Tu progreso", "12 días de racha · 48 retos completados · Nivel 3"] } as Partial<Record<Tab, string[]>>)[tab] ?? ["Inicio", "Explora tu feed de aprendizaje."];
  return <section className="placeholder-view"><span className="page-icon">{tab === "chat" ? "◌" : tab === "perfil" ? "♙" : "▣"}</span><p className="card-kicker">POLISCROLL</p><h1>{content[0]}</h1><p>{content[1]}</p><button className="action-button cyan-button" onClick={() => onAction("Esta sección se está preparando")}>Explorar <span>→</span></button></section>;
}
