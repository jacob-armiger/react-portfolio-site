import type { ImageMetadata } from "astro";

// Full-size files are served from GitHub Pages (.github/workflows/publish-originals.yml)
// so they aren't copied into every retained Vercel deployment.
const ORIGINALS_BASE = "https://jacob-armiger.github.io/react-portfolio-site";

// Reading any property of an imported image makes Astro ship its original file;
// `clone` and `fsPath` are the exceptions its own getImage relies on.
type ImportedImage = ImageMetadata & { clone?: ImageMetadata; fsPath?: string };

export function imageSize(image: ImageMetadata) {
    const { width, height } = (image as ImportedImage).clone ?? image;
    return { width, height };
}

export function originalUrl(image: ImageMetadata) {
    const relative = (image as ImportedImage).fsPath?.split("/src/assets/")[1];
    if (import.meta.env.DEV || !relative) return image.src;
    // PNGs are published as lossless WebP.
    const published = relative.replace(/\.png$/i, ".webp");
    return `${ORIGINALS_BASE}/${published.split("/").map(encodeURIComponent).join("/")}`;
}
