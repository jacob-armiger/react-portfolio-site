import Color from "colorjs.io";

/** sRGB channels, 0-255. */
export type RGB = [number, number, number];

export const parse = (css: string): Color => new Color(css.trim());

// Clipped per channel, as the browser paints an out-of-range color such as the
// headline source; generated colors are gamut-mapped earlier, in fromOklch.
export const toRGB = (color: Color): RGB =>
    color.to("srgb").coords.map((v) => Math.round(Math.min(1, Math.max(0, v ?? 0)) * 255)) as RGB;

export const hex = (rgb: RGB): string => `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`;

export const colorHex = (color: Color): string => hex(toRGB(color));

/** A possibly translucent color as it renders over an opaque background. */
export const over = (color: Color, bg: RGB): RGB => {
    const fg = toRGB(color);
    const a = color.alpha ?? 1;
    return fg.map((v, i) => Math.round(a * v + (1 - a) * bg[i])) as RGB;
};

export const mixOver = (fg: RGB, bg: RGB, alpha: number): RGB =>
    fg.map((v, i) => Math.round(alpha * v + (1 - alpha) * bg[i])) as RGB;

const linear = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const luminance = ([r, g, b]: RGB) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

export const wcag = (a: RGB, b: RGB) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

/** APCA-W3 0.0.98G Lc, signed: positive for dark text on light. */
export const apca = (text: RGB, bg: RGB) => {
    const y = ([r, g, b]: RGB) => {
        const v = 0.2126729 * (r / 255) ** 2.4 + 0.7151522 * (g / 255) ** 2.4 + 0.072175 * (b / 255) ** 2.4;
        return v < 0.022 ? v + (0.022 - v) ** 1.414 : v;
    };
    const yt = y(text);
    const yb = y(bg);
    if (Math.abs(yb - yt) < 0.0005) return 0;
    if (yb > yt) {
        const s = (yb ** 0.56 - yt ** 0.57) * 1.14;
        return s < 0.1 ? 0 : (s - 0.027) * 100;
    }
    const s = (yb ** 0.65 - yt ** 0.62) * 1.14;
    return s > -0.1 ? 0 : (s + 0.027) * 100;
};

export const oklch = (color: Color): [number, number, number] => {
    const [l, c, h] = color.to("oklch").coords;
    return [l ?? 0, c ?? 0, Number.isNaN(h) || h === null ? 0 : (h as number)];
};

export const oklabL = (rgb: RGB) => oklch(new Color("srgb", rgb.map((v) => v / 255) as RGB))[0];

/** An OKLCH color mapped into sRGB, with whether mapping had to pull it in. */
export const fromOklch = (l: number, c: number, h: number) => {
    const color = new Color("oklch", [l, Math.max(0, c), ((h % 360) + 360) % 360]);
    const clipped = !color.inGamut("srgb");
    return { color: clipped ? color.clone().toGamut({ space: "srgb" }) : color, clipped };
};

/*
 * The hero headline: a difference-blended source over the paper, under a
 * color-blended copy in the ink. The second blend keeps the first's luminosity
 * (Rec. 601 weights, per the compositing spec) and takes the ink's hue.
 */
const blendLum = ([r, g, b]: number[]) => 0.3 * r + 0.59 * g + 0.11 * b;

const setLum = (c: number[], l: number): RGB => {
    const d = l - blendLum(c);
    let out = c.map((v) => v + d);
    const lum = blendLum(out);
    const n = Math.min(...out);
    const x = Math.max(...out);
    if (n < 0) out = out.map((v) => lum + ((v - lum) * lum) / (lum - n));
    if (x > 255) out = out.map((v) => lum + ((v - lum) * (255 - lum)) / (x - lum));
    return out.map((v) => Math.round(v)) as RGB;
};

export const heroHeadline = (source: RGB, paper: RGB, ink: RGB): RGB => {
    const difference = source.map((v, i) => Math.abs(v - paper[i]));
    return setLum(ink, blendLum(difference));
};

/*
 * Painter's (RYB) wheel, as a piecewise map onto the RGB hue circle, so red sits
 * opposite green and yellow opposite violet.
 */
const RYB_STOPS: [number, number][] = [
    [0, 0],
    [60, 35],
    [120, 60],
    [180, 120],
    [240, 225],
    [300, 275],
    [360, 360],
];

const piecewise = (stops: [number, number][], x: number) => {
    const h = ((x % 360) + 360) % 360;
    for (let i = 1; i < stops.length; i++) {
        const [x0, y0] = stops[i - 1];
        const [x1, y1] = stops[i];
        if (h <= x1) return y0 + ((h - x0) * (y1 - y0)) / (x1 - x0);
    }
    return h;
};

export const rybToRgbHue = (h: number) => piecewise(RYB_STOPS, h);
export const rgbHueToRyb = (h: number) => piecewise(RYB_STOPS.map(([a, b]) => [b, a]), h);

export const rgbHue = (color: Color) => {
    const h = color.to("hsv").coords[0];
    return Number.isNaN(h) || h === null ? 0 : (h as number);
};

/** OKLCH hue of a fully saturated color at an RGB hue. */
export const oklchHueAtRgbHue = (h: number) => oklch(new Color("hsv", [h, 100, 100]))[2];
