import { apca, fromOklch, heroHeadline, mixOver, oklabL, oklch, over, parse, toRGB, wcag, type RGB } from "./color";
import { tokenById, type Match, type Theme } from "./tokens";

/** Resolved token values for one theme, as rendered colors and numbers. */
export interface Resolved {
    color: (id: string) => RGB;
    /** A translucent color composited over a background. */
    over: (id: string, bg: RGB) => RGB;
    alpha: (id: string) => number;
    raw: Record<string, string>;
}

export const resolve = (raw: Record<string, string>): Resolved => {
    const cache = new Map<string, ReturnType<typeof parse>>();
    const get = (id: string) => {
        if (!cache.has(id)) cache.set(id, parse(raw[id] || "transparent"));
        return cache.get(id)!;
    };
    return {
        raw,
        color: (id) => toRGB(get(id)),
        over: (id, bg) => over(get(id), bg),
        alpha: (id) => parseFloat(raw[id]) / 100,
    };
};

export interface Check {
    label: string;
    detail: string;
    metric: "wcag" | "apca";
    floor: number;
    /** Tokens this pairing depends on; the first is the one a check jumps to. */
    uses: string[];
    /** Text and background for a theme. */
    pair: (r: Resolved) => [RGB, RGB];
}

const page = (r: Resolved) => r.color("page");
const learnBg = (r: Resolved) => mixOver(r.color("hero-light"), r.color("hero-paper"), 0.7);
const contactHover = (r: Resolved) => mixOver(r.color("hero-ink"), r.color("hero-paper"), 0.85);

export const headlineOnPaper = (r: Resolved): RGB =>
    heroHeadline(r.color("hero-headline-source"), r.color("hero-paper"), r.color("hero-ink"));

export const CHECKS: Check[] = [
    { label: "Body text", detail: "ink on page", metric: "wcag", floor: 4.5, uses: ["ink", "page"], pair: (r) => [r.color("ink"), page(r)] },
    { label: "Soft text", detail: "ledes, excerpts, posts", metric: "wcag", floor: 4.5, uses: ["ink-soft", "ink", "page", "color-ink-soft"], pair: (r) => [r.over("color-ink-soft", page(r)), page(r)] },
    { label: "Muted text", detail: "meta, nav, footer", metric: "wcag", floor: 4.5, uses: ["ink-muted", "ink", "page", "color-ink-muted"], pair: (r) => [r.over("color-ink-muted", page(r)), page(r)] },
    { label: "Plate accent", detail: "dateline bullet, non-text", metric: "wcag", floor: 3, uses: ["plate-accent", "page"], pair: (r) => [r.color("plate-accent"), page(r)] },
    { label: "Hero headline", detail: "as blended over the paper", metric: "apca", floor: 45, uses: ["hero-ink", "hero-paper", "hero-headline-source"], pair: (r) => [headlineOnPaper(r), r.color("hero-paper")] },
    {
        label: "Hero navbar",
        detail: "wordmark, current link",
        metric: "wcag",
        floor: 4.5,
        uses: ["hero-nav-ink", "hero-paper"],
        pair: (r) => [r.over("hero-nav-ink", r.color("hero-paper")), r.color("hero-paper")],
    },
    {
        label: "Hero nav links",
        detail: "other topbar links",
        metric: "wcag",
        floor: 4.5,
        uses: ["hero-nav-ink-muted", "hero-paper"],
        pair: (r) => [r.over("hero-nav-ink-muted", r.color("hero-paper")), r.color("hero-paper")],
    },
    { label: "Hero body", detail: "on the paper", metric: "wcag", floor: 4.5, uses: ["hero-body", "hero-paper", "hero-ink-deep", "ink-soft", "ink"], pair: (r) => [r.over("hero-body", r.color("hero-paper")), r.color("hero-paper")] },
    { label: "Contact label", detail: "light on ink", metric: "wcag", floor: 4.5, uses: ["hero-light", "hero-ink"], pair: (r) => [r.color("hero-light"), r.color("hero-ink")] },
    { label: "Contact hover", detail: "light on ink at 85%", metric: "wcag", floor: 4.5, uses: ["hero-ink", "hero-light", "hero-paper"], pair: (r) => [r.color("hero-light"), contactHover(r)] },
    { label: "Learn label", detail: "ink on light at 70%", metric: "wcag", floor: 4.5, uses: ["hero-ink", "hero-light", "hero-paper"], pair: (r) => [r.color("hero-ink"), learnBg(r)] },
];

export const score = (check: Check, r: Resolved) => {
    const [fg, bg] = check.pair(r);
    const value = check.metric === "wcag" ? wcag(fg, bg) : Math.abs(apca(fg, bg));
    return { value, pass: value >= check.floor - 1e-9, fg, bg };
};

/** How strongly a strength reads in a theme: |APCA| for text, OKLab lightness step for lines. */
export const strengthReading = (match: Match, alpha: number, r: Resolved) => {
    const bg = page(r);
    const fg = mixOver(r.color("ink"), bg, alpha);
    return match === "apca" ? Math.abs(apca(fg, bg)) : Math.abs(oklabL(fg) - oklabL(bg));
};

/** The dark strength that reads like the light one, to the nearest 1%. */
export const solveStrength = (match: Match, lightAlpha: number, light: Resolved, dark: Resolved) => {
    const target = strengthReading(match, lightAlpha, light);
    let best = 1;
    let bestGap = Infinity;
    for (let pct = 1; pct <= 100; pct++) {
        const gap = Math.abs(strengthReading(match, pct / 100, dark) - target);
        if (gap < bestGap) [best, bestGap] = [pct, gap];
    }
    return best / 100;
};

const HERO_CHECKS = CHECKS.filter((c) => /Hero headline|Contact|Learn/.test(c.label));

/*
 * The lightest hero ink, at its current hue and chroma, that keeps the headline,
 * button labels and hover above their floors. The headline source is recomputed as
 * paper + ink unless it has been pinned.
 */
export const solveHeroInk = (r: Resolved, sourcePinned: boolean): string | undefined => {
    const [, c, h] = oklch(parse(r.raw["hero-ink"]));
    const paper = r.color("hero-paper");
    for (let l = 0.95; l >= 0.05; l -= 0.005) {
        const ink = toRGB(fromOklch(l, c, h).color);
        const source = sourcePinned ? r.color("hero-headline-source") : (ink.map((v, i) => Math.min(255, v + paper[i])) as RGB);
        const trial: Resolved = {
            ...r,
            color: (id) => (id === "hero-ink" ? ink : id === "hero-headline-source" ? source : r.color(id)),
        };
        if (HERO_CHECKS.every((check) => score(check, trial).pass)) return `#${ink.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    }
    return undefined;
};

export const isText = (id: string) => tokenById(id).match === "apca";

export type { Theme };
