import type { ImageMetadata } from "astro";
import sharp from "sharp";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
const MATTE = "#e5e2da";
const INSET = 40;

type ImportedImage = ImageMetadata & { fsPath?: string };

// Whole artwork on a matte: a 1.91:1 crop of a portrait loses most of the piece.
export async function mattedCard(image: ImageMetadata): Promise<Buffer> {
    const source = (image as ImportedImage).fsPath;
    if (!source) throw new Error(`No source file for share card: ${image.src}`);

    const art = await sharp(source)
        .rotate()
        .resize(CARD_WIDTH - INSET * 2, CARD_HEIGHT - INSET * 2, { fit: "inside" })
        .toBuffer({ resolveWithObject: true });

    return sharp({
        create: { width: CARD_WIDTH, height: CARD_HEIGHT, channels: 3, background: MATTE },
    })
        .composite([
            {
                input: art.data,
                left: Math.round((CARD_WIDTH - art.info.width) / 2),
                top: Math.round((CARD_HEIGHT - art.info.height) / 2),
            },
        ])
        .jpeg({ quality: 84, mozjpeg: true })
        .toBuffer();
}
