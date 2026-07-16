import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

const CATEGORY_LABELS = {
    selectedWork: 'Selected Work',
    drawings: 'Drawings',
    oilPaintings: 'Oil Paintings',
    digitalStudies: 'Digital Studies',
};

const CATEGORY_TITLE_LABELS = {
    selectedWork: 'Selected Work',
    drawings: 'Drawing',
    oilPaintings: 'Oil Painting',
    digitalStudies: 'Digital Study',
};

// Manual publish dates for art feed entries. Only needed to override the date
// baked into the filename (e.g. for Selected Work pieces, which aren't named
// by date) or to correct one.
// Key format: "category/filename.ext" (for example: "drawings/2026-05-01.jpeg").
const ART_PUBLISH_DATES = {
    // Example:
    // 'selectedWork/1.png': '2026-05-01',
};

const slugify = (value) => value.toLowerCase().replace(/\s+/g, '-');

const toDisplayName = (filename) =>
    filename
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

// Filenames are named by creation date: YYYY-MM-DD, with an optional -1/-2
// suffix to disambiguate same-day duplicates. Turns "2026-01-24-1" into a
// readable "January 24, 2026 (1)" title and a real Date for pubDate.
const DATE_FILENAME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:-(\d+))?$/;

const parseArtPieceDate = (filename) => {
    const match = filename.match(DATE_FILENAME_PATTERN);
    if (!match) return null;

    const [, year, month, day, suffix] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    const label = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });

    return { date, label: suffix ? `${label} (${suffix})` : label };
};

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
        const coverImageUrl = new URL(article.data.image.src, context.site).toString();
        const articleTitle = article.data.title ?? article.id;
        return {
            title: articleTitle,
            pubDate: article.data.date,
            description: 'Read the full article on JacobLDraws.',
            content: `<p><a href="${articleUrl}"><img src="${coverImageUrl}" alt="${articleTitle}" /></a></p><p><a href="${articleUrl}">Read article</a></p>`,
            link: `/writing/${article.id}`,
        };
    });

    const artImages = import.meta.glob([
        '../../assets/drawings/*.{png,jpg,jpeg}',
        '../../assets/oilPaintings/*.{png,jpg,jpeg}',
        '../../assets/digitalStudies/*.{png,jpg,jpeg}',
    ], { eager: true });

    const artItems = Object.entries(artImages).map(([path]) => {
        const [category, file] = path.split('/').slice(-2);
        const filename = file.replace(/\.[^.]+$/, '');
        const categoryLabel = CATEGORY_LABELS[category] ?? 'Art';
        const categoryTitleLabel = CATEGORY_TITLE_LABELS[category] ?? 'Art';
        const dateKey = `${category}/${file}`;
        const parsed = parseArtPieceDate(filename);
        const pubDate = ART_PUBLISH_DATES[dateKey] ? new Date(ART_PUBLISH_DATES[dateKey]) : parsed?.date;
        const artLink = `/art?piece=${slugify(categoryLabel)}-${filename}`;
        const artUrl = new URL(artLink, context.site).toString();

        return {
            title: parsed ? `${categoryTitleLabel}: ${parsed.label}` : `${categoryTitleLabel} ${toDisplayName(filename)}`,
            pubDate,
            description: `New artwork in ${categoryLabel}.`,
            content: `<p><a href="${artUrl}">Click to view art</a></p>`,
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
        customData: `<language>en-us</language>`,
        // Art item links use a `?piece=` query string; a trailing slash would get
        // appended after the query string and corrupt it, so disable it here.
        trailingSlash: false,
    });
}
