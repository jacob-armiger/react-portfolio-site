/*
 * Every value the Color Lab can tune. A token maps to one CSS variable per theme:
 * palette colors use a separate variable for each theme (--color-primary and
 * --color-primary-dark), roles and strengths use one variable that flips.
 */

export type Theme = "light" | "dark";
export type Kind = "color" | "alpha" | "number";

/** How a dark strength is solved from its light counterpart. */
export type Match = "apca" | "lightness";

export interface Token {
    id: string;
    label: string;
    group: string;
    kind: Kind;
    vars: Record<Theme, string>;
    /** Defined in CSS as a formula of other tokens; pinning replaces the formula. */
    derived?: boolean;
    /** Dark value can be calculated to match light-mode contrast. */
    match?: Match;
    /** Can be calculated as the lightest value that keeps the hero's floors. */
    solveHeroInk?: boolean;
    note?: string;
    min?: number;
    max?: number;
    step?: number;
}

const both = (name: string): Record<Theme, string> => ({ light: name, dark: name });

const strength = (id: string, label: string, group: string, match: Match, note?: string): Token => ({
    id,
    label,
    group,
    kind: "alpha",
    vars: both(`--alpha-${id}`),
    match,
    note,
});

export const TOKENS: Token[] = [
    { id: "ink", label: "Ink", group: "Base", kind: "color", vars: { light: "--color-primary", dark: "--color-primary-dark" }, note: "Body text" },
    { id: "page", label: "Page", group: "Base", kind: "color", vars: { light: "--color-secondary", dark: "--color-secondary-dark" }, note: "Background" },

    strength("ink-soft", "Soft text", "Text strength", "apca", "Ledes, excerpts"),
    strength("ink-muted", "Muted text", "Text strength", "apca", "Meta, nav, footer"),
    strength("ink-faint", "Faint text", "Text strength", "apca", "Specimen labels"),

    strength("rule", "Hairline", "Line & fill strength", "lightness"),
    strength("rule-strong", "Strong rule", "Line & fill strength", "lightness"),
    strength("control", "Button border", "Line & fill strength", "lightness"),
    strength("control-hover", "Button border hover", "Line & fill strength", "lightness"),
    strength("field", "Field border", "Line & fill strength", "lightness"),
    strength("underline", "Underline", "Line & fill strength", "lightness"),
    strength("tint", "Tint", "Line & fill strength", "lightness"),
    strength("tint-strong", "Strong tint", "Line & fill strength", "lightness"),

    { id: "hero-paper", label: "Paper", group: "Hero", kind: "color", vars: both("--hero-paper") },
    { id: "hero-ink", label: "Ink", group: "Hero", kind: "color", vars: both("--hero-ink"), solveHeroInk: true, note: "Headline, buttons" },
    { id: "hero-ink-deep", label: "Deep ink", group: "Hero", kind: "color", vars: both("--hero-ink-deep") },
    { id: "hero-light", label: "Light", group: "Hero", kind: "color", vars: both("--hero-light"), note: "Button labels" },
    { id: "hero-nav-ink", label: "Nav ink", group: "Hero", kind: "color", vars: both("--hero-nav-ink"), note: "Topbar over the hero" },
    { id: "hero-nav-ink-muted", label: "Nav links", group: "Hero", kind: "color", vars: both("--hero-nav-ink-muted"), note: "Other topbar links" },
    { id: "hero-body", label: "Body copy", group: "Hero", kind: "color", vars: both("--hero-body"), derived: true },
    { id: "hero-rule", label: "Frame rule", group: "Hero", kind: "color", vars: both("--hero-rule"), derived: true },
    { id: "hero-headline-source", label: "Headline source", group: "Hero", kind: "color", vars: both("--hero-headline-source"), derived: true, note: "Paper + ink" },

    { id: "accent-gold", label: "Gold", group: "Accents", kind: "color", vars: both("--accent-gold"), note: "Blended frames" },
    { id: "accent-gold-dark", label: "Gold on dark", group: "Accents", kind: "color", vars: both("--accent-gold-dark") },
    { id: "plate-accent", label: "Plate accent", group: "Accents", kind: "color", vars: both("--plate-accent"), note: "Dateline bullet" },
    { id: "plate-rule", label: "Image frame", group: "Accents", kind: "color", vars: both("--plate-rule"), derived: true },

    ...(
        [
            ["ink-soft", "Soft text"],
            ["ink-muted", "Muted text"],
            ["ink-faint", "Faint text"],
            ["rule", "Hairline"],
            ["rule-strong", "Strong rule"],
            ["control", "Button border"],
            ["control-hover", "Button border hover"],
            ["field", "Field border"],
            ["underline", "Underline"],
            ["tint", "Tint"],
            ["tint-strong", "Strong tint"],
        ] as const
    ).map(
        ([id, label]): Token => ({
            id: `color-${id}`,
            label,
            group: "Derived roles",
            kind: "color",
            vars: both(`--color-${id}`),
            derived: true,
            note: "Ink at its strength",
        }),
    ),

    { id: "texture-opacity", label: "Texture", group: "Surface", kind: "number", vars: both("--texture-opacity"), min: 0, max: 0.3, step: 0.005 },
    { id: "thumb-dim", label: "Thumbnail dim", group: "Surface", kind: "number", vars: both("--thumb-dim"), min: 0.6, max: 1, step: 0.01, note: "Dark mode only" },
];

export const tokenById = (id: string): Token => {
    const token = TOKENS.find((t) => t.id === id);
    if (!token) throw new Error(`Unknown Color Lab token: ${id}`);
    return token;
};

export const GROUPS = [...new Set(TOKENS.map((t) => t.group))];
