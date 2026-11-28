import { apca, colorHex, fromOklch, oklch, over, parse, toRGB, wcag, type RGB } from "./color";
import {
    CHECKS,
    resolve,
    score,
    solveHeroInk,
    solveStrength,
    strengthReading,
    type Check,
    type Resolved,
} from "./checks";
import {
    SCHEMES,
    SLOTS,
    defaultSlotRows,
    recolor,
    nearestInRow,
    scheme,
    valueScale,
    type ApplyOptions,
    type Scheme,
    type SlotId,
    type Swatch,
    type Wheel,
} from "./palette";
import { STYLE } from "./panel-style";
import {
    STYLE_ID,
    entry,
    exportCss,
    formatValue,
    loadState,
    loadVariations,
    numeric,
    readTokens,
    saveState,
    saveVariations,
    type Entries,
    type LabState,
    type Mode,
} from "./state";
import { GROUPS, TOKENS, tokenById, type Theme, type Token } from "./tokens";

const THEMES: Theme[] = ["light", "dark"];
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const fmt = (n: number, digits = 2) => (Number.isFinite(n) ? n.toFixed(digits) : "–");
const other = (t: Theme): Theme => (t === "light" ? "dark" : "light");
const siteTheme = (): Theme =>
    document.documentElement.classList.contains("dark") ? "dark" : "light";

/** Main colors, shown in the simple view. */
const SIMPLE_GROUPS = new Set(["Base", "Hero", "Accents"]);

const MODE_LABEL = (mode: Mode, token: Token) =>
    mode === "committed"
        ? token.derived
            ? "Formula"
            : "Original"
        : mode === "custom"
          ? "Custom"
          : "Auto";

const MODE_TITLE = (mode: Mode, token: Token) =>
    mode === "committed"
        ? token.derived
            ? "Calculated by the site's CSS from other colors"
            : "The value in the site's CSS"
        : mode === "custom"
          ? "Your own value"
          : token.match
            ? "Solved so dark mode reads like light mode, re-solved as you edit"
            : "Lightest ink that keeps every hero check passing, re-solved as you edit";

type Target = "both" | "current" | Theme;
const targets = (t: Target): Theme[] =>
    t === "both" ? THEMES : t === "current" ? [siteTheme()] : [t];

/**
 * Builds the lab inside a shadow root. The caller owns showing it: open() refreshes
 * and shows the panel, close() hides it; the panel's own ✕ calls onClose.
 */
export const createLab = (canvas: ShadowRoot, onClose: () => void) => {
    let state: LabState = loadState();
    let resolved: Record<Theme, Resolved>;
    let inspecting = false;
    let inspectResult = "";
    let compareResult = "";
    let applyResult = "";
    let dragging = false;

    /*
     * Panel state that survives page loads: every link is a full reload, so anything
     * kept only in memory would reset on navigation.
     */
    const SESSION_KEY = "color-lab:session";
    const defaults = {
        activeSwatch: undefined as string | undefined,
        history: { undo: [] as Entries[], redo: [] as Entries[] },
        palette: {
            base: "#534e2d",
            scheme: "complementary" as Scheme,
            spread: 30,
            wheel: "perceptual" as Wheel,
            tints: 2,
            step: 0.08,
        },
        scale: { h: 100, c: 0.03, from: 0.25, to: 0.93, steps: 6 },
        apply: {
            keepLightness: true,
            keepChroma: false,
            neutralTint: 0.35,
            target: "current" as Target,
        } as ApplyOptions & { target: Target },
        quick: { token: "hero-ink", target: "current" as Target, keepLightness: true },
        slotRows: undefined as Record<SlotId, number> | undefined,
        /** Entries from before the current run of palette applies; any other edit ends the run. */
        paletteBase: undefined as Entries | undefined,
        scroll: {} as Record<string, number>,
        closedGroups: ["Derived roles"] as string[],
    };
    type Session = typeof defaults;
    const session: Session = (() => {
        try {
            const saved = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
            if (saved) {
                return {
                    ...defaults,
                    ...saved,
                    palette: { ...defaults.palette, ...saved.palette },
                    scale: { ...defaults.scale, ...saved.scale },
                    apply: { ...defaults.apply, ...saved.apply },
                    quick: { ...defaults.quick, ...saved.quick },
                    history: { ...defaults.history, ...saved.history },
                };
            }
        } catch {}
        return defaults;
    })();
    const saveSession = () => {
        session.history.undo = session.history.undo.slice(-50);
        session.history.redo = session.history.redo.slice(-50);
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch {}
    };
    const { history, palette, scale, apply, quick } = session;

    const style = document.createElement("style");
    style.textContent = STYLE;
    const root = document.createElement("div");
    root.tabIndex = -1;
    canvas.append(style, root);

    /* ---------- engine ---------- */

    const refreshResolved = () => {
        resolved = { light: resolve(readTokens("light")), dark: resolve(readTokens("dark")) };
    };

    // Apply, read, solve Auto values against what is now on the page, apply again.
    const recompute = () => {
        saveState(state);
        refreshResolved();
        let changed = false;
        for (const theme of THEMES) {
            for (const token of TOKENS) {
                const e = entry(state, token.id, theme);
                if (e.mode !== "calculated") continue;
                let value: string | undefined;
                if (token.match && theme === "dark") {
                    value = formatValue(
                        token,
                        solveStrength(
                            token.match,
                            resolved.light.alpha(token.id),
                            resolved.light,
                            resolved.dark,
                        ),
                    );
                } else if (token.solveHeroInk) {
                    value = solveHeroInk(
                        resolved[theme],
                        entry(state, "hero-headline-source", theme).mode === "custom",
                    );
                }
                if (value && value !== e.value) {
                    state.entries[theme][token.id] = { mode: "calculated", value };
                    changed = true;
                }
            }
        }
        if (changed) {
            saveState(state);
            refreshResolved();
        }
    };

    const clone = (): Entries => JSON.parse(JSON.stringify(state.entries));
    const checkpoint = (keepPaletteRun = false) => {
        applyResult = "";
        if (!keepPaletteRun) session.paletteBase = undefined;
        history.undo.push(clone());
        if (history.undo.length > 100) history.undo.shift();
        history.redo = [];
    };
    const travel = (from: Entries[], to: Entries[]) => {
        const snapshot = from.pop();
        if (!snapshot) return;
        to.push(clone());
        state.entries = snapshot;
        applyResult = "";
        session.paletteBase = undefined;
        recompute();
        render();
    };

    const setValue = (id: string, theme: Theme, value: string) => {
        state.entries[theme][id] = { mode: "custom", value };
    };

    const setMode = (id: string, theme: Theme, mode: Mode) => {
        if (mode === "committed") delete state.entries[theme][id];
        else
            state.entries[theme][id] = {
                mode,
                value: entry(state, id, theme).value ?? resolved[theme].raw[id],
            };
    };

    const calculable = (token: Token, theme: Theme) =>
        !!((token.match && theme === "dark") || token.solveHeroInk);
    const overriddenCount = () =>
        THEMES.reduce((n, t) => n + Object.keys(state.entries[t]).length, 0);
    const countLabel = () => (overriddenCount() ? `${overriddenCount()} changed` : "no changes");

    const followTheme = (theme: Theme) => {
        if (state.ui.follow && siteTheme() !== theme)
            document.querySelector<HTMLButtonElement>("[data-theme-toggle]")?.click();
    };

    const currentScheme = () =>
        scheme(
            parse(palette.base),
            palette.scheme,
            palette.spread,
            palette.wheel,
            palette.tints,
            palette.step,
        );

    const failing = (theme: Theme) => CHECKS.filter((c) => !score(c, resolved[theme]).pass);

    const checkSummary = () => {
        const fails = THEMES.flatMap((t) => failing(t).map((c) => `${c.label} (${t})`));
        return fails.length
            ? `<span class="bad">${fails.length} check${fails.length > 1 ? "s" : ""} failing:</span> ${fails.join(", ")}. <button data-tab="checks">Open Checks</button>`
            : `<span class="ok">All contrast checks pass in both themes.</span>`;
    };

    /* ---------- rendering ---------- */

    const chip = (token: Token, theme: Theme) => {
        const raw = resolved[theme].raw[token.id];
        const mode = entry(state, token.id, theme).mode;
        const mark = mode === "custom" ? "✎" : mode === "calculated" ? "≈" : "";
        const selected = state.ui.selected?.id === token.id && state.ui.selected.theme === theme;
        const inner =
            token.kind === "color"
                ? `<span class="sw" style="background:${esc(raw)}"></span>`
                : `<span class="num">${esc(raw)}</span>`;
        return `<button class="chip${selected ? " on" : ""}" data-select="${token.id}:${theme}" title="${theme}: ${esc(raw)} · ${MODE_LABEL(mode, token)}">${inner}<i>${mark}</i></button>`;
    };

    const rowReset = (token: Token) =>
        THEMES.some((t) => state.entries[t][token.id])
            ? `<button class="mini-btn" data-row-reset="${token.id}" title="Back to the original in both themes">↺</button>`
            : `<span></span>`;

    const tokensTab = () => {
        const groups = GROUPS.filter((g) => !state.ui.simple || SIMPLE_GROUPS.has(g));
        return (
            `<div class="bar">
                    <div class="seg"><button data-simple="1" class="${state.ui.simple ? "on" : ""}" title="Main colors only">Simple</button><button data-simple="0" class="${state.ui.simple ? "" : "on"}" title="Every color, strength and derived role">All</button></div>
                    <label title="Switch the site to the theme of the value you are editing, so you see the change"><input type="checkbox" data-follow ${state.ui.follow ? "checked" : ""}> show the theme I'm editing</label>
                </div>` +
            editor() +
            groups
                .map((group) => {
                    const tokens = TOKENS.filter(
                        (t) => t.group === group && (!state.ui.simple || !t.derived),
                    );
                    return `<details class="group" data-group="${group}" ${session.closedGroups.includes(group) ? "" : "open"}><summary>${group}</summary>
                        <div class="row head"><span></span><span>light</span><span>dark</span><span></span></div>
                        ${tokens
                            .map(
                                (
                                    t,
                                ) => `<div class="row"><span class="name">${t.label}${t.note ? `<small>${t.note}</small>` : ""}</span>
                                <span data-chip="${t.id}:light">${chip(t, "light")}</span><span data-chip="${t.id}:dark">${chip(t, "dark")}</span>${rowReset(t)}</div>`,
                            )
                            .join("")}</details>`;
                })
                .join("")
        );
    };

    const relatedChecks = (token: Token, theme: Theme) => {
        const related = CHECKS.filter((c) => c.uses.includes(token.id));
        if (!related.length) return "";
        return `<div class="mini">${related
            .map((c) => {
                const s = score(c, resolved[theme]);
                return `<span class="${s.pass ? "ok" : "bad"}" title="${c.detail}, floor ${c.metric === "wcag" ? `${c.floor}:1` : `Lc ${c.floor}`}">${s.pass ? "✓" : "✗"} ${c.label} ${fmt(s.value, c.metric === "wcag" ? 2 : 1)}</span>`;
            })
            .join("")}</div>`;
    };

    const slider = (
        label: string,
        key: string,
        value: number,
        min: number,
        max: number,
        step: number,
    ) =>
        `<label class="slider"><span>${label}</span><input type="range" data-slider="${key}" min="${min}" max="${max}" step="${step}" value="${value}"><output data-out="${key}">${fmt(value, step < 0.01 ? 3 : 2)}</output></label>`;

    const editor = () => {
        const sel = state.ui.selected;
        if (!sel)
            return `<div class="editor empty"><b>Quick start</b><br>Click a swatch below to edit it; the site switches to that theme so you see the change. Nudge it with the buttons, or drag the sliders. ↶ undoes, and holding ◐ shows the original. ✎ marks your values, ≈ automatic ones.</div>`;
        const token = tokenById(sel.id);
        const theme = sel.theme;
        const e = entry(state, token.id, theme);
        const raw = resolved[theme].raw[token.id];
        const modes: Mode[] = [
            "committed",
            "custom",
            ...(calculable(token, theme) ? (["calculated"] as Mode[]) : []),
        ];
        const modeButtons = modes
            .map(
                (m) =>
                    `<button data-mode="${m}" class="${e.mode === m ? "on" : ""}" title="${MODE_TITLE(m, token)}">${MODE_LABEL(m, token)}</button>`,
            )
            .join("");
        let body = "";
        if (token.kind === "color") {
            const color = parse(raw);
            const [l, c, h] = oklch(color);
            body = `<div class="color-edit">
                        <span class="big" data-live-swatch style="background:${esc(raw)}"></span>
                        <div class="fields"><input class="text" data-text value="${esc(e.mode === "committed" ? colorHex(color) : (e.value ?? raw))}" spellcheck="false" title="Any CSS color, including var() and color-mix()"><input type="color" data-picker value="${colorHex(color)}" title="Pick a color"></div>
                    </div>
                    <div class="nudges">
                        <button data-nudge="lighter">Lighter</button><button data-nudge="darker">Darker</button>
                        <button data-nudge="more">More color</button><button data-nudge="less">Less color</button>
                        <button data-nudge="warmer">Warmer</button><button data-nudge="cooler">Cooler</button>
                    </div>
                    ${slider("L", "l", l, 0, 1, 0.005)}${slider("C", "c", c, 0, 0.37, 0.001)}${slider("H", "h", h, 0, 360, 0.5)}
                    ${session.activeSwatch ? `<div class="use"><button data-use>Use active swatch <span class="sw" style="background:${session.activeSwatch}"></span></button><label><input type="checkbox" data-keep-l checked> keep lightness</label></div>` : ""}`;
        } else {
            const n = numeric(token, raw);
            const [min, max, step] =
                token.kind === "alpha"
                    ? [0, 1, 0.01]
                    : [token.min ?? 0, token.max ?? 1, token.step ?? 0.01];
            body = `<div class="nudges"><button data-step="-1">−</button><button data-step="1">+</button></div>${slider(token.kind === "alpha" ? "%" : "#", "n", n, min, max, step)}`;
            if (token.match) {
                const read = (t: Theme) =>
                    strengthReading(token.match!, resolved[t].alpha(token.id), resolved[t]);
                const d = token.match === "apca" ? 1 : 3;
                body += `<p class="hint" data-reading>Reads as ${token.match === "apca" ? "APCA" : "lightness step"} ${fmt(read("light"), d)} in light, ${fmt(read("dark"), d)} in dark.</p>`;
            }
        }
        const copyable = token.kind !== "number" || token.vars.light === token.vars.dark;
        return `<div class="editor" data-editor>
                <div class="ed-head"><b>${token.label}</b><span class="theme-tag">${theme}</span><code>${token.vars[theme]}</code>
                    ${copyable ? `<button class="mini-btn push" data-copy-theme title="Give the ${other(theme)} theme this value too">→ ${other(theme)}</button>` : ""}
                    <button class="mini-btn" data-deselect title="Close">✕</button></div>
                <div class="modes">${modeButtons}</div>
                ${e.mode === "calculated" ? `<p class="hint">${MODE_TITLE("calculated", token)}.</p>` : ""}
                ${body}
                <div data-related>${relatedChecks(token, theme)}</div></div>`;
    };

    const checksTab = () => {
        const cell = (check: Check, t: Theme) => {
            const s = score(check, resolved[t]);
            return `<td class="${s.pass ? "ok" : "bad"}"><button class="cell" data-jump="${check.uses[0]}:${t}" title="Edit ${tokenById(check.uses[0]).label} (${t})"><span class="pair"><i style="background:rgb(${s.bg})"><b style="color:rgb(${s.fg})">Aa</b></i></span>${fmt(s.value, check.metric === "wcag" ? 2 : 1)}</button></td>`;
        };
        const rows = CHECKS.map(
            (check) =>
                `<tr><th>${check.label}<small>${check.detail}</small></th>${THEMES.map((t) => cell(check, t)).join("")}<td class="floor">${check.metric === "wcag" ? `${check.floor}:1` : `Lc ${check.floor}`}</td></tr>`,
        ).join("");
        const strengths = TOKENS.filter((t) => t.match)
            .map((t) => {
                const read = (th: Theme) =>
                    strengthReading(t.match!, resolved[th].alpha(t.id), resolved[th]);
                const d = t.match === "apca" ? 1 : 3;
                const gap = Math.abs(read("dark") - read("light")) / Math.max(read("light"), 1e-6);
                return `<tr><th>${t.label}</th><td>${resolved.light.raw[t.id]} · ${fmt(read("light"), d)}</td><td class="${gap < 0.05 ? "ok" : "warn"}"><button class="cell" data-jump="${t.id}:dark" title="Edit the dark strength">${resolved.dark.raw[t.id]} · ${fmt(read("dark"), d)}</button></td><td class="floor">${t.match === "apca" ? "APCA" : "ΔL"}</td></tr>`;
            })
            .join("");
        return `<p class="summary">${checkSummary()}</p>
                <table class="checks"><thead><tr><th></th><th>light</th><th>dark</th><th>floor</th></tr></thead><tbody>${rows}</tbody></table>
                <p class="hint">Click a result to edit the color behind it.</p>
                <h4>Strength parity <small>dark should read like light, within 5%</small></h4>
                <table class="checks"><tbody>${strengths}</tbody></table>
                <button data-auto-all title="Set every dark strength to Auto">Match all dark strengths to light</button>`;
    };

    const swatchButton = (s: Swatch) => {
        const h = colorHex(s.color);
        return `<button class="swatch${session.activeSwatch === h ? " on" : ""}" data-swatch="${h}" title="${s.label} ${h}${s.clipped ? " (pulled into sRGB)" : ""}" style="background:${h}">${s.clipped ? "!" : ""}</button>`;
    };

    const targetSelect = (attr: string, value: Target) =>
        `<select ${attr}>${(["both", "current", "light", "dark"] as Target[])
            .map(
                (t) =>
                    `<option value="${t}" ${t === value ? "selected" : ""}>${t === "both" ? "both themes" : t === "current" ? "current theme" : `${t} only`}</option>`,
            )
            .join("")}</select>`;

    const paletteTab = () => {
        const base = parse(palette.base);
        const rows = currentScheme();
        const def = SCHEMES.find((s) => s.id === palette.scheme)!;
        const colorTokens = TOKENS.filter((t) => t.kind === "color" && !t.derived);
        const tokenOptions = colorTokens
            .flatMap((t) =>
                THEMES.map(
                    (th) =>
                        `<option value="${colorHex(parse(resolved[th].raw[t.id]))}">${t.group} ${t.label} (${th})</option>`,
                ),
            )
            .join("");
        const rowOption = (i: number, selected: number) =>
            `<option value="${i}" ${i === selected ? "selected" : ""}>${rows[i].offset === 0 ? "base hue" : `${rows[i].offset > 0 ? "+" : ""}${rows[i].offset}°`}</option>`;
        const baseIndex = Math.floor(rows[0].row.length / 2);
        return `<div class="active">${
            session.activeSwatch
                ? `<span class="sw" style="background:${session.activeSwatch}"></span><code>${session.activeSwatch}</code><button class="mini-btn" data-copy="${session.activeSwatch}">copy</button>
                        <div class="quick">Apply to <select data-quick-token>${colorTokens.map((t) => `<option value="${t.id}" ${t.id === quick.token ? "selected" : ""}>${t.group} ${t.label}</option>`).join("")}</select>
                        ${targetSelect("data-quick-target", quick.target)}<label><input type="checkbox" data-quick-keep ${quick.keepLightness ? "checked" : ""}> keep lightness</label><button data-quick-apply>Apply</button></div>`
                : `<em>Click any swatch to make it the active color.</em>`
        }</div>
            <h4>Palette type</h4>
            <div class="form">
                <label>Base <input type="color" data-p="base" value="${colorHex(base)}"><select data-p-from><option value="">from a site color…</option>${tokenOptions}</select></label>
                <label>Type <select data-p="scheme">${SCHEMES.map((s) => `<option value="${s.id}" ${s.id === palette.scheme ? "selected" : ""}>${s.label}</option>`).join("")}</select></label>
                <label>Wheel <select data-p="wheel"><option value="perceptual" ${palette.wheel === "perceptual" ? "selected" : ""}>Perceptual (OKLCH)</option><option value="painter" ${palette.wheel === "painter" ? "selected" : ""}>Painter's (RYB)</option></select></label>
                ${def.spread !== undefined ? `<label>Spread <input type="range" data-p="spread" min="5" max="175" step="1" value="${palette.spread}"><output>${palette.spread}°</output></label>` : ""}
                <label>Tints/shades <input type="range" data-p="tints" min="0" max="4" step="1" value="${palette.tints}"><output>${palette.tints}</output></label>
                <label>Step <input type="range" data-p="step" min="0.02" max="0.2" step="0.01" value="${palette.step}"><output>${palette.step.toFixed(2)} L</output></label>
            </div>
            ${rows.map((r) => `<div class="swrow"><span class="hue">${r.offset >= 0 ? "+" : ""}${r.offset}°</span>${r.row.map(swatchButton).join("")}</div>`).join("")}
            <h4>Apply to the site <small>60 · 30 · 10</small></h4>
            <div class="slots">${SLOTS.map(
                (
                    slot,
                ) => `<div class="slot"><span class="sw" style="background:${colorHex(rows[session.slotRows![slot.id]]?.row[baseIndex].color ?? base)}"></span>
                    <b>${slot.label}</b><small>${slot.share}</small><select data-slot="${slot.id}">${rows.map((_, i) => rowOption(i, session.slotRows![slot.id])).join("")}</select>
                    <small class="roles">${slot.tokens.map(([id]) => tokenById(id).label + (tokenById(id).group === "Hero" ? " (hero)" : "")).join(", ")}</small></div>`,
            ).join("")}</div>
            <div class="form">
                <label title="Keep each color's own lightness, so contrast stays close: only hue and colorfulness change">Keep lightness <input type="checkbox" data-a="keepLightness" ${apply.keepLightness ? "checked" : ""}><span></span></label>
                <label title="Keep each color's own colorfulness: only the hue rotates">Keep chroma <input type="checkbox" data-a="keepChroma" ${apply.keepChroma ? "checked" : ""}><span></span></label>
                <label title="How much of the palette's color the neutrals (page, ink, paper, light) take">Neutral tint <input type="range" data-a="neutralTint" min="0" max="1" step="0.05" value="${apply.neutralTint}" ${apply.keepChroma ? "disabled" : ""}><output>${Math.round(apply.neutralTint * 100)}%</output></label>
                <label>Themes ${targetSelect("data-apply-target", apply.target)}<span></span></label>
            </div>
            <p class="hint">${apply.keepLightness ? "Keeps each color's lightness, so contrast holds; tints, shades and step don't change the result." : "Each color takes the swatch in its row closest to its own lightness, so tints, shades and step shape the result. Watch the checks."}</p>
            <button class="primary" data-apply-palette>Apply palette to the site</button>
            ${applyResult ? `<div class="result card">${applyResult}</div>` : ""}
            <h4>Value scale</h4>
            <div class="form">
                <label>Hue <input type="range" data-s="h" min="0" max="360" step="1" value="${scale.h}"><output>${scale.h}</output></label>
                <label>Chroma <input type="range" data-s="c" min="0" max="0.2" step="0.005" value="${scale.c}"><output>${scale.c.toFixed(3)}</output></label>
                <label>From L <input type="range" data-s="from" min="0" max="1" step="0.01" value="${scale.from}"><output>${scale.from.toFixed(2)}</output></label>
                <label>To L <input type="range" data-s="to" min="0" max="1" step="0.01" value="${scale.to}"><output>${scale.to.toFixed(2)}</output></label>
                <label>Steps <input type="range" data-s="steps" min="2" max="12" step="1" value="${scale.steps}"><output>${scale.steps}</output></label>
            </div>
            <div class="swrow">${valueScale(scale.h, scale.c, scale.from, scale.to, scale.steps).map(swatchButton).join("")}</div>
            <p class="hint">! marks a color pulled back into the screen's range.</p>`;
    };

    const toolsTab = () => {
        const variations = loadVariations();
        const names = Object.keys(variations);
        return `<h4>Variations <small>save a set of changes to compare directions</small></h4>
            <div class="quick"><input class="text" data-var-name placeholder="Name, e.g. warm olive"><button data-var-save ${overriddenCount() ? "" : "disabled"}>Save current</button></div>
            ${names.length ? `<div class="vars">${names.map((n) => `<div><span>${esc(n)}</span><button data-var-load="${esc(n)}">Load</button><button class="mini-btn" data-var-delete="${esc(n)}">✕</button></div>`).join("")}</div>` : `<p class="hint">None saved yet.</p>`}
            <h4>Inspect</h4>
            <button data-inspect class="${inspecting ? "on" : ""}">${inspecting ? "Stop inspecting (Esc)" : "Click an element to check its contrast"}</button>
            <div class="result">${inspectResult}</div>
            <h4>Compare to original</h4>
            <button data-compare>Outline elements your changes affect</button> <button data-compare-clear>Clear</button>
            <div class="result">${compareResult}</div>
            <h4>Export</h4>
            <textarea readonly data-export>${esc(exportCss(state))}</textarea>
            <button data-copy-export>Copy CSS</button>
            <h4>Reset</h4>
            <button data-reset>Clear every change</button>`;
    };

    const TABS: [string, string][] = [
        ["tokens", "Colors"],
        ["palette", "Palette"],
        ["checks", "Checks"],
        ["tools", "Tools"],
    ];

    // A re-render replaces every element; refocus the control that had focus (or the
    // panel), so keyboard use and the panel's shortcuts carry on.
    const focusKey = () => {
        const el = canvas.activeElement as HTMLElement | null;
        const attr = el && Object.keys(el.dataset)[0];
        if (!el || !attr) return undefined;
        const name = `data-${attr.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
        const value = el.getAttribute(name);
        return value ? `[${name}="${CSS.escape(value)}"]` : `[${name}]`;
    };

    const changesBar = () => {
        const counts = THEMES.map((t) => [t, Object.keys(state.entries[t]).length] as const).filter(
            ([, n]) => n,
        );
        if (!counts.length) return "";
        return `<div class="changes"><span>${counts.map(([t, n]) => `${t} ${n}`).join(" · ")} changed</span>
            ${counts.map(([t]) => `<button data-reset-theme="${t}" title="Back to the original ${t} colors">Reset ${t}</button>`).join("")}
            ${counts.length > 1 ? `<button data-reset title="Back to the original colors in both themes">Reset all</button>` : ""}</div>`;
    };

    const render = () => {
        const focused = root.contains(canvas.activeElement) ? (focusKey() ?? "") : undefined;
        root.className = `lab side-${state.ui.side}${state.ui.collapsed ? " collapsed" : ""}`;
        const body =
            state.ui.tab === "checks"
                ? checksTab()
                : state.ui.tab === "palette"
                  ? paletteTab()
                  : state.ui.tab === "tools"
                    ? toolsTab()
                    : tokensTab();
        const fails = failing("light").length + failing("dark").length;
        root.innerHTML = `<header>
                    <b>Color Lab</b><span class="count">${countLabel()}</span>
                    <button data-undo ${history.undo.length ? "" : "disabled"} title="Undo (⌘Z)">↶</button>
                    <button data-redo ${history.redo.length ? "" : "disabled"} title="Redo (⇧⌘Z)">↷</button>
                    <button data-hold ${overriddenCount() ? "" : "disabled"} title="Hold to see the original colors">◐</button>
                    <button data-theme title="Switch the site's theme">${siteTheme() === "dark" ? "☾" : "☀"}</button>
                    <button data-side title="Move to the other side">⇆</button>
                    <button data-collapse title="Collapse">${state.ui.collapsed ? "▸" : "▾"}</button>
                    <button data-close title="Close (⌥⇧C)">✕</button>
                </header>
                <nav>${TABS.map(([id, label]) => `<button data-tab="${id}" class="${state.ui.tab === id ? "on" : ""}">${label}${id === "checks" && fails ? ` <span class="badge">${fails}</span>` : ""}</button>`).join("")}</nav>
                ${changesBar()}
                <main>${body}</main>`;
        const main = root.querySelector("main");
        if (main) main.scrollTop = session.scroll[state.ui.tab] ?? 0;
        saveSession();
        if (focused !== undefined)
            (root.querySelector<HTMLElement>(focused || ":not(*)") ?? root).focus({
                preventScroll: true,
            });
    };

    // Updates values in place, so a slider being dragged keeps its focus.
    const refresh = () => {
        if (state.ui.tab !== "tokens") return render();
        const count = root.querySelector(".count");
        if (count) count.textContent = countLabel();
        for (const el of root.querySelectorAll<HTMLElement>("[data-chip]")) {
            const [id, theme] = el.dataset.chip!.split(":") as [string, Theme];
            el.innerHTML = chip(tokenById(id), theme);
        }
        const sel = state.ui.selected;
        if (!sel) return;
        const token = tokenById(sel.id);
        root
            .querySelector<HTMLElement>("[data-live-swatch]")
            ?.style.setProperty("background", resolved[sel.theme].raw[sel.id]);
        const related = root.querySelector("[data-related]");
        if (related) related.innerHTML = relatedChecks(token, sel.theme);
        const reading = root.querySelector("[data-reading]");
        if (reading && token.match) {
            const read = (t: Theme) =>
                strengthReading(token.match!, resolved[t].alpha(token.id), resolved[t]);
            const d = token.match === "apca" ? 1 : 3;
            reading.textContent = `Reads as ${token.match === "apca" ? "APCA" : "lightness step"} ${fmt(read("light"), d)} in light, ${fmt(read("dark"), d)} in dark.`;
        }
        for (const b of root.querySelectorAll<HTMLElement>("[data-mode]"))
            b.classList.toggle("on", b.dataset.mode === entry(state, sel.id, sel.theme).mode);
        for (const b of root.querySelectorAll<HTMLButtonElement>("[data-undo]"))
            b.disabled = !history.undo.length;
    };

    /* ---------- color edits ---------- */

    const editSelected = (value: string) => {
        const sel = state.ui.selected!;
        setValue(sel.id, sel.theme, value);
        recompute();
    };

    const toward = (h: number, target: number, step: number) => {
        const diff = ((target - h + 540) % 360) - 180;
        return h + Math.sign(diff) * Math.min(step, Math.abs(diff));
    };

    const nudge = (kind: string) => {
        const sel = state.ui.selected!;
        let [l, c, h] = oklch(parse(resolved[sel.theme].raw[sel.id]));
        if (kind === "lighter") l += 0.02;
        if (kind === "darker") l -= 0.02;
        if (kind === "more") c += 0.008;
        if (kind === "less") c = Math.max(0, c - 0.008);
        if (kind === "warmer") h = toward(h, 70, 6);
        if (kind === "cooler") h = toward(h, 250, 6);
        checkpoint();
        editSelected(colorHex(fromOklch(Math.min(1, Math.max(0, l)), c, h).color));
        render();
    };

    /*
     * Keep lightness: each role takes the base swatch's hue and chroma at its own
     * lightness. Otherwise it takes the swatch in its row (tints and shades included)
     * nearest its lightness, so the palette's steps shape the result. Consecutive
     * applies all start from the colors before the first, so changing a setting and
     * applying again replaces the last result instead of stacking on it. An apply that
     * changes nothing leaves no undo step.
     */
    const applyPalette = () => {
        const before = JSON.stringify(state.entries);
        const base = session.paletteBase ?? clone();
        checkpoint(true);
        session.paletteBase = base;
        state.entries = JSON.parse(JSON.stringify(base));
        recompute();
        const rows = currentScheme();
        const baseIndex = Math.floor(rows[0].row.length / 2);
        let n = 0;
        for (const slot of SLOTS) {
            const row = (rows[session.slotRows![slot.id]] ?? rows[0]).row.map((s) => s.color);
            for (const [id, neutral] of slot.tokens) {
                for (const theme of targets(apply.target)) {
                    const current = parse(resolved[theme].raw[id]);
                    const swatch = apply.keepLightness
                        ? row[baseIndex]
                        : nearestInRow(row, current);
                    setValue(id, theme, colorHex(recolor(swatch, current, neutral, apply).color));
                    n++;
                }
            }
        }
        if (JSON.stringify(state.entries) === before) {
            history.undo.pop();
            recompute();
            applyResult = `Nothing changed: these settings give the colors already applied.${
                apply.keepLightness
                    ? " With Keep lightness on, tints, shades and step don't affect Apply."
                    : ""
            }`;
            return;
        }
        recompute();
        applyResult = `Recolored ${n} values in ${targets(apply.target).join(" and ")} mode. ${checkSummary()} <button data-undo>Undo</button>`;
    };

    const quickApply = () => {
        if (!session.activeSwatch) return;
        checkpoint();
        for (const theme of targets(quick.target)) {
            const current = parse(resolved[theme].raw[quick.token]);
            const value = quick.keepLightness
                ? colorHex(
                      recolor(parse(session.activeSwatch), current, false, {
                          keepLightness: true,
                          keepChroma: false,
                          neutralTint: 1,
                      }).color,
                  )
                : session.activeSwatch;
            setValue(quick.token, theme, value);
        }
        recompute();
        applyResult = `${tokenById(quick.token).label} set. ${checkSummary()} <button data-undo>Undo</button>`;
    };

    /* ---------- inspect & compare ---------- */

    if (!document.getElementById("color-lab-marks")) {
        const marks = document.createElement("style");
        marks.id = "color-lab-marks";
        marks.textContent =
            "[data-color-lab-hover]{outline:2px solid #8a8a8a!important;outline-offset:1px!important}" +
            "[data-color-lab-changed]{outline:2px dashed #8a8a8a!important;outline-offset:1px!important}";
        document.head.appendChild(marks);
    }

    const isLab = (el: Element | null) =>
        !!el?.closest("color-lab, astro-dev-toolbar") || el?.id === "color-lab-probe";

    const rgba = (css: string) => {
        const c = parse(css);
        return { rgb: toRGB(c), a: c.alpha ?? 1, color: c };
    };

    const effectiveBackground = (el: Element) => {
        const layers: { rgb: RGB; a: number }[] = [];
        let caveat = "";
        for (let node: Element | null = el; node; node = node.parentElement) {
            const cs = getComputedStyle(node);
            if (cs.backgroundImage !== "none")
                caveat ||= "a background image sits behind this text";
            if (cs.mixBlendMode !== "normal")
                caveat ||= `it is blended (${cs.mixBlendMode}), so the drawn color differs`;
            const bg = rgba(cs.backgroundColor);
            if (bg.a > 0) layers.push(bg);
            if (bg.a >= 1) break;
        }
        let rgb: RGB = [255, 255, 255];
        for (const layer of layers.reverse())
            rgb = rgb.map((v, i) => Math.round(layer.a * layer.rgb[i] + (1 - layer.a) * v)) as RGB;
        if (
            el.closest("figure, picture") ||
            el.parentElement?.querySelector(":scope > img, :scope > picture")
        )
            caveat ||= "it may sit over an image";
        return { rgb, caveat };
    };

    const inspect = (el: Element) => {
        const cs = getComputedStyle(el);
        const bg = effectiveBackground(el);
        let opacity = 1;
        for (let node: Element | null = el; node; node = node.parentElement)
            opacity *= parseFloat(getComputedStyle(node).opacity);
        const text = rgba(cs.color);
        const faded = text.color.clone();
        faded.alpha = text.a * opacity;
        const fg = over(faded, bg.rgb);
        const size = parseFloat(cs.fontSize);
        const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight) >= 700);
        const floor = large ? 3 : 4.5;
        const ratio = wcag(fg, bg.rgb);
        const name = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${[...el.classList]
            .slice(0, 2)
            .map((c) => `.${c}`)
            .join("")}`;
        inspectResult = `<div class="card"><code>${esc(name)}</code>
                <span class="pair"><i style="background:rgb(${bg.rgb})"><b style="color:rgb(${fg})">Aa</b></i></span>
                <div class="${ratio >= floor ? "ok" : "bad"}">WCAG ${fmt(ratio)}:1 (floor ${floor}:1 for ${large ? "large" : "normal"} text, ${Math.round(size)}px)</div>
                <div>APCA Lc ${fmt(Math.abs(apca(fg, bg.rgb)), 1)}</div>
                <div>text ${colorHex(parse(`rgb(${fg})`))} on ${colorHex(parse(`rgb(${bg.rgb})`))}</div>
                ${bg.caveat ? `<div class="warn">Estimate only: ${bg.caveat}.</div>` : ""}</div>`;
    };

    let hovered: Element | null = null;
    const onMove = (e: MouseEvent) => {
        const el = e.target as Element;
        if (isLab(el) || el === hovered) return;
        hovered?.removeAttribute("data-color-lab-hover");
        hovered = el;
        el.setAttribute("data-color-lab-hover", "");
    };
    const onClick = (e: MouseEvent) => {
        const el = e.target as Element;
        if (isLab(el)) return;
        e.preventDefault();
        e.stopPropagation();
        inspect(el);
        render();
    };
    const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && inspecting) {
            setInspecting(false);
            render();
        }
    };
    const setInspecting = (on: boolean) => {
        inspecting = on;
        const method = on ? "addEventListener" : "removeEventListener";
        document[method]("mousemove", onMove as EventListener, true);
        document[method]("click", onClick as EventListener, true);
        document[method]("keydown", onKey as EventListener, true);
        if (!on) {
            hovered?.removeAttribute("data-color-lab-hover");
            hovered = null;
        }
    };

    const overrideSheet = () =>
        (document.getElementById(STYLE_ID) as HTMLStyleElement | null)?.sheet;

    const snapshot = (elements: Element[]) =>
        elements.map((el) => {
            const cs = getComputedStyle(el);
            return [
                cs.color,
                cs.backgroundColor,
                cs.borderTopColor,
                cs.borderBottomColor,
                cs.outlineColor,
                cs.textDecorationColor,
                cs.filter,
                cs.opacity,
            ].join("|");
        });
    const clearCompare = () =>
        document
            .querySelectorAll("[data-color-lab-changed]")
            .forEach((el) => el.removeAttribute("data-color-lab-changed"));

    const compare = () => {
        const sheet = overrideSheet();
        clearCompare();
        if (!sheet || !overriddenCount())
            return (compareResult = `<div class="card">No changes to compare.</div>`);
        const elements = [...document.body.querySelectorAll("*")].filter((el) => !isLab(el));
        const html = document.documentElement;
        const wasDark = html.classList.contains("dark");
        const counts: Record<Theme, number> = { light: 0, dark: 0 };
        const changed = new Set<Element>();
        for (const theme of THEMES) {
            html.classList.toggle("dark", theme === "dark");
            const withChanges = snapshot(elements);
            sheet.disabled = true;
            const original = snapshot(elements);
            sheet.disabled = false;
            withChanges.forEach((v, i) => {
                if (v === original[i]) return;
                counts[theme]++;
                if ((theme === "dark") === wasDark) changed.add(elements[i]);
            });
        }
        html.classList.toggle("dark", wasDark);
        changed.forEach((el) => el.setAttribute("data-color-lab-changed", ""));
        compareResult = `<div class="card">Changed on this page: ${counts.light} elements in light, ${counts.dark} in dark. Outlined for the current theme.</div>`;
    };

    /* ---------- events ---------- */

    root.addEventListener("click", (event) => {
        const t = (event.target as HTMLElement).closest<HTMLElement>("button");
        if (!t || (t as HTMLButtonElement).disabled) return;
        const d = t.dataset;
        const sel = state.ui.selected;
        if (d.tab) {
            state.ui.tab = d.tab;
            saveState(state);
            return render();
        }
        if (d.close !== undefined) return onClose();
        if (d.undo !== undefined) return travel(history.undo, history.redo);
        if (d.redo !== undefined) return travel(history.redo, history.undo);
        if (d.theme !== undefined) {
            document.querySelector<HTMLButtonElement>("[data-theme-toggle]")?.click();
            return render();
        }
        if (d.side !== undefined) state.ui.side = state.ui.side === "right" ? "left" : "right";
        if (d.collapse !== undefined) state.ui.collapsed = !state.ui.collapsed;
        if (d.simple !== undefined) state.ui.simple = d.simple === "1";
        if (d.side !== undefined || d.collapse !== undefined || d.simple !== undefined) {
            saveState(state);
            return render();
        }
        if (d.select || d.jump) {
            const [id, theme] = (d.select ?? d.jump)!.split(":") as [string, Theme];
            state.ui.selected = { id, theme };
            if (d.jump) {
                state.ui.tab = "tokens";
                if (tokenById(id).derived || !SIMPLE_GROUPS.has(tokenById(id).group))
                    state.ui.simple = false;
            }
            followTheme(theme);
            saveState(state);
            return render();
        }
        if (d.deselect !== undefined) {
            state.ui.selected = undefined;
            saveState(state);
            return render();
        }
        if (d.mode && sel) {
            checkpoint();
            setMode(sel.id, sel.theme, d.mode as Mode);
            recompute();
            return render();
        }
        if (d.rowReset) {
            checkpoint();
            for (const theme of THEMES) delete state.entries[theme][d.rowReset];
            recompute();
            return render();
        }
        if (d.copyTheme !== undefined && sel) {
            checkpoint();
            setValue(sel.id, other(sel.theme), resolved[sel.theme].raw[sel.id]);
            recompute();
            return render();
        }
        if (d.nudge && sel) return nudge(d.nudge);
        if (d.step && sel) {
            const token = tokenById(sel.id);
            const step = token.kind === "alpha" ? 0.01 : (token.step ?? 0.01);
            checkpoint();
            editSelected(
                formatValue(
                    token,
                    numeric(token, resolved[sel.theme].raw[sel.id]) + step * Number(d.step),
                ),
            );
            return render();
        }
        if (d.swatch) {
            session.activeSwatch = d.swatch;
            return render();
        }
        if (d.use !== undefined && session.activeSwatch && sel) {
            let value = session.activeSwatch;
            if (root.querySelector<HTMLInputElement>("[data-keep-l]")?.checked) {
                value = colorHex(
                    recolor(
                        parse(session.activeSwatch),
                        parse(resolved[sel.theme].raw[sel.id]),
                        false,
                        {
                            keepLightness: true,
                            keepChroma: false,
                            neutralTint: 1,
                        },
                    ).color,
                );
            }
            checkpoint();
            editSelected(value);
            return render();
        }
        if (d.quickApply !== undefined) {
            quickApply();
            return render();
        }
        if (d.applyPalette !== undefined) {
            applyPalette();
            return render();
        }
        if (d.autoAll !== undefined) {
            checkpoint();
            for (const token of TOKENS)
                if (token.match)
                    state.entries.dark[token.id] = {
                        mode: "calculated",
                        value: resolved.dark.raw[token.id],
                    };
            recompute();
            return render();
        }
        if (d.copy) return void navigator.clipboard.writeText(d.copy);
        if (d.copyExport !== undefined) return void navigator.clipboard.writeText(exportCss(state));
        if (d.varSave !== undefined) {
            const name =
                root.querySelector<HTMLInputElement>("[data-var-name]")?.value.trim() ||
                `Variation ${Object.keys(loadVariations()).length + 1}`;
            saveVariations({ ...loadVariations(), [name]: clone() });
            return render();
        }
        if (d.varLoad) {
            const saved = loadVariations()[d.varLoad];
            if (!saved) return;
            checkpoint();
            state.entries = JSON.parse(JSON.stringify(saved));
            recompute();
            return render();
        }
        if (d.varDelete) {
            const variations = loadVariations();
            delete variations[d.varDelete];
            saveVariations(variations);
            return render();
        }
        if (d.inspect !== undefined) {
            setInspecting(!inspecting);
            return render();
        }
        if (d.compare !== undefined) {
            compare();
            return render();
        }
        if (d.compareClear !== undefined) {
            clearCompare();
            compareResult = "";
            return render();
        }
        if (d.reset !== undefined || d.resetTheme) {
            checkpoint();
            if (d.resetTheme) state.entries[d.resetTheme as Theme] = {};
            else state.entries = { light: {}, dark: {} };
            recompute();
            return render();
        }
    });

    // Hold ◐ to see the original colors.
    const showOriginal = (on: boolean) => {
        const sheet = overrideSheet();
        if (sheet) sheet.disabled = on;
    };
    root.addEventListener("pointerdown", (e) => {
        if ((e.target as HTMLElement).closest("[data-hold]:not([disabled])")) showOriginal(true);
    });
    for (const type of ["pointerup", "pointerleave", "pointercancel"])
        root.addEventListener(type, () => showOriginal(false));

    // ⌘Z / ⇧⌘Z while the lab is open, wherever focus is, except in text fields (in the
    // page or the lab), which keep their own text undo.
    const TEXT_INPUTS = new Set(["text", "search", "email", "url", "tel", "password", "number"]);
    document.addEventListener("keydown", (e) => {
        if (root.hidden || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
        const target = e.composedPath()[0];
        if (
            target instanceof HTMLElement &&
            (target.isContentEditable ||
                target instanceof HTMLTextAreaElement ||
                (target instanceof HTMLInputElement && TEXT_INPUTS.has(target.type)))
        )
            return;
        e.preventDefault();
        if (e.shiftKey) travel(history.redo, history.undo);
        else travel(history.undo, history.redo);
    });

    let scrollSave = 0;
    root.addEventListener(
        "scroll",
        (e) => {
            if ((e.target as HTMLElement).tagName !== "MAIN") return;
            session.scroll[state.ui.tab] = (e.target as HTMLElement).scrollTop;
            clearTimeout(scrollSave);
            scrollSave = window.setTimeout(saveSession, 150);
        },
        true,
    );

    root.addEventListener(
        "toggle",
        (e) => {
            const group = (e.target as HTMLElement).dataset.group;
            if (!group) return;
            const closed = new Set(session.closedGroups);
            if ((e.target as HTMLDetailsElement).open) closed.delete(group);
            else closed.add(group);
            session.closedGroups = [...closed];
            saveSession();
        },
        true,
    );

    root.addEventListener("input", (event) => {
        const t = event.target as HTMLInputElement | HTMLSelectElement;
        const sel = state.ui.selected;
        if (t.dataset.slider && sel) {
            if (!dragging) {
                checkpoint();
                dragging = true;
            }
            const token = tokenById(sel.id);
            const v = parseFloat(t.value);
            const out = root.querySelector(`[data-out="${t.dataset.slider}"]`);
            if (out)
                out.textContent = fmt(v, parseFloat((t as HTMLInputElement).step) < 0.01 ? 3 : 2);
            if (token.kind === "color") {
                const get = (k: string) =>
                    parseFloat(root.querySelector<HTMLInputElement>(`[data-slider="${k}"]`)!.value);
                const value = colorHex(fromOklch(get("l"), get("c"), get("h")).color);
                const text = root.querySelector<HTMLInputElement>("[data-text]");
                if (text) text.value = value;
                const picker = root.querySelector<HTMLInputElement>("[data-picker]");
                if (picker) picker.value = value;
                editSelected(value);
            } else {
                editSelected(formatValue(token, v));
            }
            return refresh();
        }
        if (t.dataset.picker !== undefined && sel) {
            if (!dragging) {
                checkpoint();
                dragging = true;
            }
            editSelected(t.value);
            return refresh();
        }
        if (t.dataset.p) {
            const key = t.dataset.p;
            if (key === "base" || key === "scheme" || key === "wheel")
                (palette as Record<string, unknown>)[key] = t.value;
            else (palette as Record<string, unknown>)[key] = parseFloat(t.value);
            if (key === "scheme")
                palette.spread = SCHEMES.find((s) => s.id === t.value)?.spread ?? palette.spread;
            if (key === "scheme" || key === "spread")
                session.slotRows = defaultSlotRows(currentScheme().map((r) => r.offset));
            return render();
        }
        if (t.dataset.pFrom !== undefined && t.value) {
            palette.base = t.value;
            return render();
        }
        if (t.dataset.s) {
            (scale as Record<string, number>)[t.dataset.s] = parseFloat(t.value);
            return render();
        }
        if (t.dataset.slot) {
            session.slotRows![t.dataset.slot as SlotId] = Number(t.value);
            return render();
        }
        if (t.dataset.a) {
            const key = t.dataset.a as "keepLightness" | "keepChroma" | "neutralTint";
            if (key === "neutralTint") apply.neutralTint = parseFloat(t.value);
            else apply[key] = (t as HTMLInputElement).checked;
            return render();
        }
        if (t.dataset.applyTarget !== undefined) apply.target = t.value as Target;
        if (t.dataset.quickToken !== undefined) quick.token = t.value;
        if (t.dataset.quickTarget !== undefined) quick.target = t.value as Target;
        if (t.dataset.quickKeep !== undefined)
            quick.keepLightness = (t as HTMLInputElement).checked;
        if (t.dataset.follow !== undefined) {
            state.ui.follow = (t as HTMLInputElement).checked;
            saveState(state);
        }
    });

    root.addEventListener("change", (event) => {
        const t = event.target as HTMLInputElement;
        if (t.dataset.slider || t.dataset.picker !== undefined) {
            dragging = false;
            return render();
        }
        if (t.dataset.text !== undefined && state.ui.selected) {
            if (!CSS.supports("color", t.value)) return t.classList.add("invalid");
            checkpoint();
            editSelected(t.value.trim());
            render();
        }
    });

    const rowCount = currentScheme().length;
    if (!session.slotRows || Object.values(session.slotRows).some((i: number) => i >= rowCount))
        session.slotRows = defaultSlotRows(currentScheme().map((r) => r.offset));

    return {
        open() {
            root.hidden = false;
            recompute();
            render();
        },
        close() {
            root.hidden = true;
            setInspecting(false);
            showOriginal(false);
        },
    };
};
