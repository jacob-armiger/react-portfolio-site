import type Color from "colorjs.io";
import { fromOklch, oklch, oklchHueAtRgbHue, rgbHue, rgbHueToRyb, rybToRgbHue } from "./color";

export interface Swatch {
    color: Color;
    clipped: boolean;
    label: string;
}

/** Evenly spaced lightness steps at one hue and chroma. */
export const valueScale = (
    h: number,
    c: number,
    from: number,
    to: number,
    steps: number,
): Swatch[] =>
    Array.from({ length: steps }, (_, i) => {
        const l = steps === 1 ? from : from + ((to - from) * i) / (steps - 1);
        const { color, clipped } = fromOklch(l, c, h);
        return { color, clipped, label: `L ${l.toFixed(2)}` };
    });

export type Scheme =
    | "monochromatic"
    | "analogous"
    | "complementary"
    | "split"
    | "triadic"
    | "square";
export type Wheel = "perceptual" | "painter";

export const SCHEMES: { id: Scheme; label: string; spread?: number }[] = [
    { id: "monochromatic", label: "Monochromatic" },
    { id: "analogous", label: "Analogous", spread: 30 },
    { id: "complementary", label: "Complementary" },
    { id: "split", label: "Split complementary", spread: 30 },
    { id: "triadic", label: "Triadic", spread: 120 },
    { id: "square", label: "Square / tetradic", spread: 90 },
];

/** Hue offsets from the base. Spread widens or narrows the shape. */
const offsets = (scheme: Scheme, s: number): number[] => {
    switch (scheme) {
        case "monochromatic":
            return [0];
        case "analogous":
            return [-s, 0, s];
        case "complementary":
            return [0, 180];
        case "split":
            return [0, 180 - s, 180 + s];
        case "triadic":
            return [0, s, -s];
        case "square":
            return [0, s, 180, 180 + s];
    }
};

/*
 * One row per hue: the base lightness and chroma at that hue, flanked by tints and
 * shades. On the painter's wheel the hue is rotated in RYB, then converted back,
 * keeping the base's OKLCH lightness and chroma so value steps stay even.
 */
export const scheme = (
    base: Color,
    kind: Scheme,
    spread: number,
    wheel: Wheel,
    tints: number,
    step: number,
) => {
    const [l, c, h] = oklch(base);
    const baseRyb = rgbHueToRyb(rgbHue(base));
    return offsets(kind, spread).map((offset) => {
        const hue =
            wheel === "perceptual" ? h + offset : oklchHueAtRgbHue(rybToRgbHue(baseRyb + offset));
        const row: Swatch[] = [];
        for (let i = -tints; i <= tints; i++) {
            const { color, clipped } = fromOklch(
                Math.min(0.99, Math.max(0.02, l + i * step)),
                c,
                hue,
            );
            row.push({
                color,
                clipped,
                label: i === 0 ? "base" : i > 0 ? `tint ${i}` : `shade ${-i}`,
            });
        }
        return { offset, hue: ((hue % 360) + 360) % 360, row };
    });
};

/*
 * Applying a palette to the site, 60-30-10: each slot takes one hue from the scheme
 * and recolors its roles. Neutral roles take the hue at a fraction of its chroma.
 */
export const SLOTS = [
    {
        id: "dominant",
        label: "Dominant",
        share: "60%",
        tokens: [
            ["page", true],
            ["hero-paper", true],
            ["hero-light", true],
        ],
    },
    {
        id: "secondary",
        label: "Secondary",
        share: "30%",
        tokens: [
            ["ink", true],
            ["hero-ink", false],
            ["hero-ink-deep", true],
        ],
    },
    {
        id: "accent",
        label: "Accent",
        share: "10%",
        tokens: [
            ["accent-gold", false],
            ["accent-gold-dark", false],
            ["plate-accent", false],
        ],
    },
] as const satisfies readonly {
    id: string;
    label: string;
    share: string;
    tokens: readonly (readonly [string, boolean])[];
}[];

export type SlotId = (typeof SLOTS)[number]["id"];

/** Default rows: dominant and secondary on the base hue, accent on the hue furthest from it. */
export const defaultSlotRows = (offsets: number[]): Record<SlotId, number> => {
    const base = Math.max(0, offsets.indexOf(0));
    const distance = (o: number) => Math.abs((((o % 360) + 540) % 360) - 180);
    const far = offsets.reduce(
        (best, o, i) => (distance(o) > distance(offsets[best]) ? i : best),
        base,
    );
    return { dominant: base, secondary: base, accent: offsets.length > 1 ? far : base };
};

export interface ApplyOptions {
    keepLightness: boolean;
    keepChroma: boolean;
    /** Share of the swatch's chroma that neutral roles take. */
    neutralTint: number;
}

/** The swatch in a row whose lightness is closest to a colour's. */
export const nearestInRow = (row: Color[], current: Color) => {
    const [cl] = oklch(current);
    return row.reduce((best, c) =>
        Math.abs(oklch(c)[0] - cl) < Math.abs(oklch(best)[0] - cl) ? c : best,
    );
};

/** A role's new color from a palette swatch. */
export const recolor = (swatch: Color, current: Color, neutral: boolean, opts: ApplyOptions) => {
    const [sl, sc, sh] = oklch(swatch);
    const [cl, cc] = oklch(current);
    const l = opts.keepLightness ? cl : sl;
    const c = opts.keepChroma ? cc : neutral ? sc * opts.neutralTint : sc;
    return fromOklch(l, c, sh);
};
