import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { articleExcerpt } from '../../utils/article';
import { categorySingular, CATEGORY_LABELS, parseArtPieceDate, slugify } from '../../utils/artPiece';
import { escapeHtml, FEED_XMLNS, feedCustomData } from '../../utils/feed';
import { originalUrl } from '../../utils/originals';

// Manual publish dates for art feed entries. Only needed to override the date
// baked into the filename (e.g. for Selected Work pieces, which aren't named
// by date) or to correct one.
// Key format: "category/filename.ext" (for example: "drawings/2026-05-01.jpeg").
const ART_PUBLISH_DATES = {
    // Example:
    // 'selectedWork/1.png': '2026-05-01',
};

const toDisplayName = (filename) =>
    filename
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const toTime = (value) => {
    if (!value) {
        return 0;
    }

    const date = value instanceof Date ? value : new Date(value);
    const ms = date.getTime();
    return Number.isNaN(ms) ? 0 : ms;
};

export async function GET(context) {
    const articles = await getCollection('article');

    // Keep blog entries identical to the existing /writing/rss.xml behavior.
    const articleItems = articles.map((article) => {
        const articleUrl = new URL(`/writing/${article.id}`, context.site).toString();
        const coverImageUrl = new URL(originalUrl(article.data.image), context.site).toString();
        const articleTitle = article.data.title ?? article.id;
        const href = escapeHtml(articleUrl);
        return {
            title: articleTitle,
            pubDate: article.data.date,
            description: articleExcerpt(article.body, 300),
            content: `<p><a href="${href}"><img src="${escapeHtml(coverImageUrl)}" alt="${escapeHtml(articleTitle)}" /></a></p><p><a href="${href}">Read article</a></p>`,
            link: `/writing/${article.id}`,
        };
    });

    const artImages = import.meta.glob([
        '../../assets/drawings/*.{png,jpg,jpeg,webp}',
        '../../assets/oilPaintings/*.{png,jpg,jpeg,webp}',
        '../../assets/digitalStudies/*.{png,jpg,jpeg,webp}',
    ], { eager: true });

    const artItems = Object.entries(artImages).map(([path]) => {
        const [category, file] = path.split('/').slice(-2);
        const filename = file.replace(/\.[^.]+$/, '');
        const categoryLabel = CATEGORY_LABELS[category] ?? 'Art';
        const categoryTitleLabel = categorySingular(category);
        const dateKey = `${category}/${file}`;
        const parsed = parseArtPieceDate(filename);
        const pubDate = ART_PUBLISH_DATES[dateKey] ? new Date(ART_PUBLISH_DATES[dateKey]) : parsed?.date;
        const artLink = `/art?piece=${slugify(categoryLabel)}-${filename}`;
        const artUrl = new URL(artLink, context.site).toString();

        return {
            title: parsed ? `${categoryTitleLabel}: ${parsed.label}` : `${categoryTitleLabel} ${toDisplayName(filename)}`,
            pubDate,
            description: `New artwork in ${categoryLabel}.`,
            content: `<p><a href="${escapeHtml(artUrl)}">Click to view art</a></p>`,
            link: artLink,
        };
    });

    const items = [...articleItems, ...artItems].sort((a, b) => {
        const timeDiff = toTime(b.pubDate) - toTime(a.pubDate);
        if (timeDiff !== 0) {
            return timeDiff;
        }
        return a.title.localeCompare(b.title);
    });

    return rss({
        title: 'JacobLDraws Blog and Art Feed',
        description: 'Writing and art updates from JacobLDraws',
        site: context.site,
        items,
        xmlns: FEED_XMLNS,
        customData: feedCustomData(context),
        // Art item links use a `?piece=` query string; a trailing slash would get
        // appended after the query string and corrupt it, so disable it here.
        trailingSlash: false,
    });
}
