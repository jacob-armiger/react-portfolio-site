/**
 * Shared so the card teaser and the article page derive their reading time from the
 * same text -- they used to disagree, and the article page printed no time at all.
 */
export function articleText(body: string | undefined): string {
    return (body ?? "")
        .replace(/^import\s.+$/gm, "")
        .replace(/^export\s.+$/gm, "")
        .replace(/<ImageCarousel[\s\S]*?\/>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[\`*_>#-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function readingMinutes(text: string): number {
    return Math.max(1, Math.round((text ? text.split(" ").length : 0) / 220));
}
