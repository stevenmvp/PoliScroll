import { createRoot, type Root } from "react-dom/client";
import ArcadeModule from "./ArcadeModule";

let arcadeRoot: Root | null = null;

export function mountArcade(host: HTMLElement): void {
  arcadeRoot?.unmount();
  arcadeRoot = createRoot(host);
  arcadeRoot.render(<ArcadeModule />);
}

export function unmountArcade(): void {
  arcadeRoot?.unmount();
  arcadeRoot = null;
}
