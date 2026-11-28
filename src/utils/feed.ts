import type { APIContext } from "astro";

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };

/** For values interpolated into feed item HTML. */
export const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c]);

export const FEED_XMLNS = { atom: "http://www.w3.org/2005/Atom" };

// The atom:link self reference is what feed validators and some readers use to
// find the canonical feed URL.
export function feedCustomData({ url, site }: Pick<APIContext, "url" | "site">) {
    const self = new URL(url.pathname, site).toString();
    return `<language>en-us</language><atom:link href="${self}" rel="self" type="application/rss+xml" />`;
}
