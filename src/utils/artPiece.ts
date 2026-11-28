import { ART_DESCRIPTIONS } from "../config/artDescriptions";

export const CATEGORY_LABELS: Record<string, string> = {
    selectedWork: "Selected Work",
    drawings: "Drawings",
    oilPaintings: "Oil Paintings",
    digitalStudies: "Digital Studies",
};

const CATEGORY_SINGULAR: Record<string, string> = {
    selectedWork: "Selected work",
    drawings: "Drawing",
    oilPaintings: "Oil painting",
    digitalStudies: "Digital study",
};

export const slugify = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

// Files are named by creation date, with an optional -N suffix for same-day pieces.
const DATE_FILENAME = /^(\d{4})-(\d{2})-(\d{2})(?:-(\d+))?$/;

/** "2026-01-24-1" → January 24, 2026 (1). Null for names that aren't dates. */
export function parseArtPieceDate(filename: string) {
    const match = filename.match(DATE_FILENAME);
    if (!match) return null;

    const [, year, month, day, suffix] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
    return { date, label: suffix ? `${label} (${suffix})` : label };
}

export function categorySingular(folder: string) {
    return CATEGORY_SINGULAR[folder] ?? "Artwork";
}

/** Alt text for a piece: its written description, else its kind and date. */
export function artPieceAlt(folder: string, file: string, index: number) {
    const written = ART_DESCRIPTIONS[`${folder}/${file}`];
    if (written) return written;
    const parsed = parseArtPieceDate(file.replace(/\.[^.]+$/, ""));
    const kind = categorySingular(folder);
    return parsed ? `${kind} from ${parsed.label}` : `${kind} ${index + 1}`;
}
