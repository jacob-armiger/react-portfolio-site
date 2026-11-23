import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import { CARD_HEIGHT, CARD_WIDTH } from "./shareCard";

export const SITE_NAME = "JacobLDraws";
export const DEFAULT_DESCRIPTION =
    "One-on-one drawing and painting lessons and commissioned artwork from Jacob, a self-taught NYC artist who studies 19th-century academic methods.";

export type SharePosition = "top" | "center" | "bottom" | "left" | "right" | "attention" | "entropy";

// Cropped to fill the card; suits landscape images. JPEG because not every
// scraper accepts WebP.
export async function shareImage(src: ImageMetadata, position: SharePosition = "attention") {
    const image = await getImage({
        src,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        fit: "cover",
        position,
        format: "jpeg",
        quality: 82,
    });
    return { src: image.src, width: CARD_WIDTH, height: CARD_HEIGHT };
}
