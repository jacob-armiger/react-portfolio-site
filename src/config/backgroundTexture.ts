import type { ImageMetadata } from "astro";
import scanlines from "../assets/textures/scanlines.webp";

export interface TextureSettings {
    asset: ImageMetadata;
    opacity: number;
    blendMode: "normal" | "multiply" | "screen" | "overlay" | "soft-light" | "hard-light" | "color-dodge" | "color-burn" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";
    size: string;
    repeat: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
}

const light: TextureSettings = {
    asset: scanlines,
    opacity: 0.1,
    blendMode: "overlay",
    size: "1024px auto",
    repeat: "repeat",
};

export const backgroundTexture = {
    light,
    dark: { ...light, opacity: 0.05 },
} satisfies Record<"light" | "dark", TextureSettings>;
