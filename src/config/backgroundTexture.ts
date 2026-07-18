import type { ImageMetadata } from "astro";
import darkTexture from "../assets/textures/scanlines.webp";
import lightTexture from "../assets/textures/scanlines.webp";

export interface TextureSettings {
    asset: ImageMetadata;
    opacity: number;
    blendMode: "normal" | "multiply" | "screen" | "overlay" | "soft-light" | "hard-light" | "color-dodge" | "color-burn" | "darken" | "lighten" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";
    size: string;
    repeat: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
}

interface BackgroundTextureSettings {
    light: TextureSettings;
    dark: TextureSettings;
}

export const backgroundTexture = {
    light: {
        asset: lightTexture,
        opacity: 0.1,
        blendMode: "overlay",
        size: "1024px auto",
        repeat: "repeat",
    },
    dark: {
        asset: darkTexture,
        opacity: 0.1,
        blendMode: "multiply",
        size: "1024px auto",
        repeat: "repeat",
    },
} satisfies BackgroundTextureSettings;