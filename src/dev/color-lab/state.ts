import { TOKENS, tokenById, type Theme, type Token } from "./tokens";

/*
 * committed: the site's own value, no override.
 * custom: a value set by hand.
 * calculated: a value the lab solves and re-solves whenever its inputs change.
 */
export type Mode = "committed" | "custom" | "calculated";

export interface Entry {
    mode: Mode;
    value?: string;
}

export interface LabState {
    entries: Record<Theme, Record<string, Entry>>;
    ui: {
        tab: string;
        selected?: { id: string; theme: Theme };
        side: "right" | "left";
        collapsed: boolean;
        /** Show only the main colors, hiding strengths and derived roles. */
        simple: boolean;
        /** Switch the site to the theme of the value being edited. */
        follow: boolean;
    };
}

const STATE_KEY = "color-lab:state";
export const CSS_KEY = "color-lab:css";
export const STYLE_ID = "color-lab-overrides";

export const emptyState = (): LabState => ({
    entries: { light: {}, dark: {} },
    ui: { tab: "tokens", side: "right", collapsed: false, simple: true, follow: true },
});

export const loadState = (): LabState => {
    try {
        const saved = JSON.parse(localStorage.getItem(STATE_KEY) ?? "null");
        if (saved?.entries?.light && saved?.entries?.dark) return { ...emptyState(), ...saved, ui: { ...emptyState().ui, ...saved.ui } };
    } catch {}
    return emptyState();
};

export type Entries = LabState["entries"];

const VARIATIONS_KEY = "color-lab:variations";

/** Named sets of overrides, for comparing directions. */
export const loadVariations = (): Record<string, Entries> => {
    try {
        return JSON.parse(localStorage.getItem(VARIATIONS_KEY) ?? "{}");
    } catch {
        return {};
    }
};

export const saveVariations = (variations: Record<string, Entries>) => {
    try {
        localStorage.setItem(VARIATIONS_KEY, JSON.stringify(variations));
    } catch {}
};

export const entry = (state: LabState, id: string, theme: Theme): Entry => state.entries[theme][id] ?? { mode: "committed" };

const overridden = (e: Entry) => e.mode !== "committed" && e.value !== undefined;

/*
 * Tokens live in the theme cascade layer, so these unlayered rules win wherever the
 * sheet sits. A :root override also reaches dark mode, so a flipping variable set
 * only for light gets revert-layer under html.dark to keep its committed dark value.
 */
export const buildCss = (state: LabState): string => {
    const root: string[] = [];
    const dark: string[] = [];
    for (const token of TOKENS) {
        const light = entry(state, token.id, "light");
        const darkEntry = entry(state, token.id, "dark");
        const flips = token.vars.light === token.vars.dark;
        if (overridden(light)) root.push(`${token.vars.light}: ${light.value};`);
        if (overridden(darkEntry)) (flips ? dark : root).push(`${token.vars.dark}: ${darkEntry.value};`);
        else if (flips && overridden(light)) dark.push(`${token.vars.dark}: revert-layer;`);
    }
    const block = (selector: string, lines: string[]) => (lines.length ? `${selector} {\n  ${lines.join("\n  ")}\n}\n` : "");
    return block(":root", root) + block("html.dark", dark);
};

export const saveState = (state: LabState) => {
    const css = buildCss(state);
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
        if (css) localStorage.setItem(CSS_KEY, css);
        else localStorage.removeItem(CSS_KEY);
    } catch {}
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        document.head.appendChild(style);
    }
    style.textContent = css;
};

/** The export: overridden values as two paste-ready blocks for global.css. */
export const exportCss = (state: LabState): string => {
    const lines: Record<"palette" | "light" | "dark", string[]> = { palette: [], light: [], dark: [] };
    for (const token of TOKENS) {
        for (const theme of ["light", "dark"] as Theme[]) {
            const e = entry(state, token.id, theme);
            if (!overridden(e)) continue;
            const how = e.mode === "calculated" ? ` /* calculated${token.match ? `: ${token.match} match` : ""} */` : "";
            const line = `${token.vars[theme]}: ${e.value};${how}`;
            if (token.vars.light !== token.vars.dark) lines.palette.push(line);
            else lines[theme].push(line);
        }
    }
    const out: string[] = ["/* Color Lab export. Replace the matching declarations in src/styles/global.css. */"];
    if (lines.palette.length) out.push(`/* @theme palette */\n${lines.palette.join("\n")}`);
    if (lines.light.length) out.push(`/* :root (light) */\n${lines.light.join("\n")}`);
    if (lines.dark.length) out.push(`/* html.dark */\n${lines.dark.join("\n")}`);
    return out.length > 1 ? out.join("\n\n") : "No overrides yet.";
};

/*
 * Reads tokens as the browser resolves them, overrides included. Colors go through
 * a hidden probe so color-mix() and relative colors come back computed. The theme
 * class is flipped and restored inside one task, so nothing paints in between.
 */
export const readTokens = (theme: Theme): Record<string, string> => {
    let probe = document.getElementById("color-lab-probe");
    if (!probe) {
        probe = document.createElement("span");
        probe.id = "color-lab-probe";
        probe.hidden = true;
        document.body.appendChild(probe);
    }
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.toggle("dark", theme === "dark");
    const rootStyle = getComputedStyle(html);
    const out: Record<string, string> = {};
    for (const token of TOKENS) {
        const name = token.vars[theme];
        if (token.kind === "color") {
            probe.style.color = `var(${name})`;
            out[token.id] = getComputedStyle(probe).color;
        } else {
            out[token.id] = rootStyle.getPropertyValue(name).trim();
        }
    }
    probe.style.color = "";
    html.classList.toggle("dark", wasDark);
    return out;
};

export const numeric = (token: Token, raw: string) => (token.kind === "alpha" ? parseFloat(raw) / 100 : parseFloat(raw));

export const formatValue = (token: Token, n: number) =>
    token.kind === "alpha" ? `${Math.round(n * 100)}%` : `${Math.round(n * 1000) / 1000}`;

export { tokenById };
