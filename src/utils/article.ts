/**
 * Plain text of an article body. Shared by the card teaser and the article page so
 * their reading times agree.
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

/** First `max` characters of the article text, cut back to a word boundary. */
export function articleExcerpt(body: string | undefined, max = 155): string {
    const text = articleText(body);
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.]+$/, "")}…`;
}
