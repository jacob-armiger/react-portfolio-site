import { createLab } from "./app";

/*
 * The Color Lab as a plain custom element: a launcher button plus the panel, both in
 * a shadow root so the site's styles and the lab's edits never reach them. Loaded by
 * ColorLab.astro in dev only. ⌥⇧C toggles it from anywhere.
 */

const OPEN_KEY = "color-lab:open";

const LAUNCHER_STYLE = `
.launcher { all: initial; position: fixed; left: 16px; bottom: 16px; z-index: 2147483000; width: 36px; height: 36px;
  display: grid; place-items: center; border-radius: 50%; background: #181818; color: #e7e7e7; cursor: pointer;
  border: 1px solid #363636; box-shadow: 0 6px 20px rgb(0 0 0 / .35); }
.launcher:hover { background: #252525; }
.launcher[hidden] { display: none; }
.launcher svg { width: 18px; height: 18px; }
`;

const ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-.6-.3-1-.6-1.4-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4-4-7.5-9-7.5Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>`;

class ColorLabElement extends HTMLElement {
    connectedCallback() {
        if (this.shadowRoot) return;
        const shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = LAUNCHER_STYLE;
        const launcher = document.createElement("button");
        launcher.className = "launcher";
        launcher.title = "Color Lab (⌥⇧C)";
        launcher.setAttribute("aria-label", "Open the Color Lab");
        launcher.innerHTML = ICON;
        shadow.append(style, launcher);

        let lab: ReturnType<typeof createLab> | undefined;
        let open = false;
        const setOpen = (on: boolean) => {
            open = on;
            if (on) {
                lab ??= createLab(shadow, () => setOpen(false));
                lab.open();
            } else lab?.close();
            launcher.hidden = on;
            try {
                localStorage.setItem(OPEN_KEY, on ? "1" : "0");
            } catch {}
        };

        launcher.addEventListener("click", () => setOpen(true));
        document.addEventListener("keydown", (e) => {
            if (e.altKey && e.shiftKey && e.code === "KeyC") {
                e.preventDefault();
                setOpen(!open);
            }
        });

        try {
            if (localStorage.getItem(OPEN_KEY) === "1") setOpen(true);
        } catch {}
    }
}

if (!customElements.get("color-lab")) {
    customElements.define("color-lab", ColorLabElement);
    document.body.append(document.createElement("color-lab"));
}
