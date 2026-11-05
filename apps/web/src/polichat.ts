import {
  archiveChatConversation,
  askTutor,
  createChatConversation,
  listChatConversations,
  loadConversationMessages,
  markChatRead,
  recordTutorExchange,
  renameChatConversation,
  sendChatMessage,
  type ChatMessageView,
  type ChatSummary,
} from "./services/platform";

interface LocalMessage extends ChatMessageView { error?: boolean }
interface ChatUser { id: string; displayName: string }

const state = {
  conversationId: null as string | null,
  title: "Nueva conversación",
  messages: [] as LocalMessage[],
  conversations: [] as ChatSummary[],
  busy: false,
  loaded: false,
  panelOpen: false,
};

const suggestions = [
  "Explícame un concepto paso a paso",
  "Ayúdame a prepararme para un examen",
  "Hazme un quiz de práctica",
  "Resume un tema en puntos clave",
];

export const chatPanelOpen = (): boolean => state.panelOpen;
export const setChatPanelOpen = (open: boolean): void => { state.panelOpen = open; };

export function resetChat(): void {
  Object.assign(state, { conversationId: null, title: "Nueva conversación", messages: [], conversations: [], busy: false, loaded: false, panelOpen: false });
}

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}

// Markdown ligero sobre texto ya escapado: listas, títulos, negritas, cursivas y código.
export function renderMarkdown(raw: string): string {
  let html = "";
  let list: "ul" | "ol" | null = null;
  const closeList = (): void => { if (list) { html += `</${list}>`; list = null; } };
  const openList = (kind: "ul" | "ol"): void => { if (list !== kind) { closeList(); html += `<${kind}>`; list = kind; } };
  for (const line of escapeHTML(raw).split(/\r?\n/)) {
    const text = line.trim();
    const bullet = /^[-*•]\s+(.*)$/.exec(text);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(text);
    const heading = /^#{1,4}\s+(.*)$/.exec(text);
    if (bullet) { openList("ul"); html += `<li>${inline(bullet[1])}</li>`; }
    else if (numbered) { openList("ol"); html += `<li>${inline(numbered[1])}</li>`; }
    else if (heading) { closeList(); html += `<h4>${inline(heading[1])}</h4>`; }
    else if (!text) closeList();
    else { closeList(); html += `<p>${inline(text)}</p>`; }
  }
  closeList();
  return html;
}

const timeLabel = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
};

function messageHTML(message: LocalMessage): string {
  const body = message.fromUser ? `<p>${escapeHTML(message.body)}</p>` : renderMarkdown(message.body);
  const kind = message.fromUser ? "is-user" : message.error ? "is-bot is-error" : "is-bot";
  const avatar = message.fromUser ? "" : `<span class="ps-chat-avatar" aria-hidden="true">P</span>`;
  return `<div class="ps-chat-row ${message.fromUser ? "is-user" : "is-bot"}">${avatar}<div class="ps-chat-message ${kind}">${body}<time>${timeLabel(message.sentAt)}</time></div></div>`;
}

const typingHTML = `<div class="ps-chat-row is-bot"><span class="ps-chat-avatar" aria-hidden="true">P</span><div class="ps-chat-message is-bot ps-chat-typing" aria-label="PoliChat está escribiendo"><i></i><i></i><i></i></div></div>`;

function paintAll(): void {
  document.querySelectorAll<HTMLElement>("[data-chat-messages]").forEach((container) => {
    const welcome = state.messages.length ? "" : `<div class="ps-chat-welcome"><span class="ps-chat-avatar is-large" aria-hidden="true">P</span><strong>¡Hola! Soy PoliChat</strong><p>Tu tutor académico con IA. Pregúntame lo que necesites y guardaré la conversación.</p></div>`;
    container.innerHTML = welcome + state.messages.map(messageHTML).join("") + (state.busy ? typingHTML : "");
    container.scrollTop = container.scrollHeight;
  });
  document.querySelectorAll<HTMLElement>("[data-chat-suggestions]").forEach((box) => { box.hidden = state.messages.length > 0; });
  document.querySelectorAll<HTMLElement>("[data-chat-title]").forEach((title) => { title.textContent = state.title; });
  document.querySelectorAll<HTMLButtonElement>("[data-chat-send]").forEach((button) => { button.disabled = state.busy; });
  document.querySelectorAll<HTMLElement>("[data-chat-list]").forEach((list) => {
    list.innerHTML = state.conversations.length
      ? state.conversations.map((item) => `<button type="button" class="ps-pc-item${item.id === state.conversationId ? " is-active" : ""}" data-chat-open="${item.id}"><strong>${escapeHTML(item.title)}</strong><small>${new Date(item.lastMessageAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</small></button>`).join("")
      : `<p class="ps-pc-empty">Aún no tienes conversaciones.</p>`;
  });
}

async function selectConversation(user: ChatUser, id: string): Promise<void> {
  const summary = state.conversations.find((item) => item.id === id);
  state.conversationId = id;
  state.title = summary?.title ?? "Conversación";
  state.messages = [];
  paintAll();
  try {
    state.messages = await loadConversationMessages(id);
    void markChatRead(id, user.id).catch(() => undefined);
  } catch {
    state.messages = [{ id: "load-error", body: "No se pudo cargar esta conversación.", fromUser: false, sentAt: new Date().toISOString(), error: true }];
  }
  paintAll();
}

async function ensureLoaded(user: ChatUser): Promise<void> {
  if (state.loaded) { paintAll(); return; }
  state.loaded = true;
  try {
    state.conversations = await listChatConversations(user.id);
    if (!state.conversationId && state.conversations[0]) await selectConversation(user, state.conversations[0].id);
  } catch {
    state.loaded = false;
  }
  paintAll();
}

async function sendPrompt(user: ChatUser, text: string): Promise<void> {
  if (state.busy || !text) return;
  state.busy = true;
  state.messages.push({ id: `local-${Date.now()}`, body: text, fromUser: true, sentAt: new Date().toISOString() });
  paintAll();
  try {
    if (!state.conversationId) {
      state.title = text.slice(0, 48);
      state.conversationId = await createChatConversation({ title: state.title, createdBy: user.id });
      state.conversations.unshift({ id: state.conversationId, title: state.title, lastMessageAt: new Date().toISOString() });
    }
    await sendChatMessage({ conversationId: state.conversationId, senderId: user.id, body: text });
    const history = state.messages.slice(-9, -1).map((message) => `${message.fromUser ? "Estudiante" : "Tutor"}: ${message.body.slice(0, 600)}`).join("\n");
    const context = `El estudiante ${user.displayName} está usando PoliChat dentro de una plataforma educativa universitaria.${history ? `\nConversación previa:\n${history}` : ""}`;
    const answer = await askTutor(text, context);
    state.messages.push({ id: `bot-${Date.now()}`, body: answer, fromUser: false, sentAt: new Date().toISOString() });
    const summary = state.conversations.find((item) => item.id === state.conversationId);
    if (summary) { summary.lastMessageAt = new Date().toISOString(); state.conversations.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)); }
    await recordTutorExchange({ conversationId: state.conversationId, userId: user.id, prompt: text, response: answer }).catch(() => undefined);
  } catch (error) {
    state.messages.push({ id: `err-${Date.now()}`, body: error instanceof Error ? error.message : "No se pudo enviar el mensaje.", fromUser: false, sentAt: new Date().toISOString(), error: true });
  } finally {
    state.busy = false;
    paintAll();
  }
}

export const suggestionsHTML = (): string => `<div class="ps-chat-suggestions" data-chat-suggestions>${suggestions.map((item) => `<button type="button" data-chat-suggest="${escapeHTML(item)}">${escapeHTML(item)}</button>`).join("")}</div>`;

export const chatSurfaceHTML = (): string => `
  <div class="ps-chat-messages" data-chat-messages aria-live="polite"></div>
  ${suggestionsHTML()}
  <form class="ps-chat-form" data-chat-form><textarea data-chat-input rows="1" maxlength="1000" placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta" required></textarea><button type="submit" data-chat-send aria-label="Enviar mensaje">↑</button></form>`;

// Conecta los controles de un contenedor (panel lateral o módulo completo) con el estado compartido.
export function mountChat(scope: ParentNode, user: ChatUser, onExpand?: () => void): void {
  const form = scope.querySelector<HTMLFormElement>("[data-chat-form]");
  const input = scope.querySelector<HTMLTextAreaElement>("[data-chat-input]");
  const submit = (): void => {
    const text = input?.value.trim();
    if (!input || !text) return;
    input.value = "";
    input.style.height = "";
    void sendPrompt(user, text);
  };
  form?.addEventListener("submit", (event) => { event.preventDefault(); submit(); });
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form?.requestSubmit(); }
  });
  input?.addEventListener("input", () => { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 110)}px`; });
  scope.querySelectorAll<HTMLButtonElement>("[data-chat-suggest]").forEach((button) => button.addEventListener("click", () => void sendPrompt(user, button.dataset.chatSuggest ?? "")));
  scope.querySelector("[data-chat-list]")?.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-chat-open]");
    if (target?.dataset.chatOpen && !state.busy) void selectConversation(user, target.dataset.chatOpen);
  });
  scope.querySelectorAll<HTMLButtonElement>("[data-chat-new]").forEach((button) => button.addEventListener("click", () => {
    if (state.busy) return;
    Object.assign(state, { conversationId: null, title: "Nueva conversación", messages: [] });
    paintAll();
    input?.focus();
  }));
  scope.querySelector("[data-chat-rename]")?.addEventListener("click", () => {
    const id = state.conversationId;
    if (!id) return;
    const title = window.prompt("Nuevo nombre de la conversación", state.title)?.trim();
    if (!title) return;
    void renameChatConversation(id, title).then(() => {
      state.title = title.slice(0, 80);
      const summary = state.conversations.find((item) => item.id === id);
      if (summary) summary.title = state.title;
      paintAll();
    }).catch(() => undefined);
  });
  scope.querySelector("[data-chat-archive]")?.addEventListener("click", () => {
    const id = state.conversationId;
    if (!id || state.busy || !window.confirm("¿Archivar esta conversación? Seguirá guardada pero dejará de mostrarse.")) return;
    void archiveChatConversation(id).then(async () => {
      state.conversations = state.conversations.filter((item) => item.id !== id);
      if (state.conversations[0]) await selectConversation(user, state.conversations[0].id);
      else { Object.assign(state, { conversationId: null, title: "Nueva conversación", messages: [] }); paintAll(); }
    }).catch(() => undefined);
  });
  scope.querySelector("[data-chat-expand]")?.addEventListener("click", () => onExpand?.());
  paintAll();
  void ensureLoaded(user);
}
