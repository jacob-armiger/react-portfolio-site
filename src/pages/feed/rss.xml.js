import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

const CATEGORY_LABELS = {
    selectedWork: 'Selected Work',
    drawings: 'Drawings',
    oilPaintings: 'Oil Paintings',
    digitalStudies: 'Digital Studies',
};

// Manual publish dates for art feed entries.
// Key format: "category/filename.ext" (for example: "drawings/01.jpeg").
// Add a date whenever new art is published to keep ordering stable.
const ART_PUBLISH_DATES = {
    // Example:
    // 'drawings/01.jpeg': '2026-05-01',
};

const slugify = (value) => value.toLowerCase().replace(/\s+/g, '-');

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
        '../../assets/selectedWork/*.{png,jpg,jpeg}',
        '../../assets/drawings/*.{png,jpg,jpeg}',
        '../../assets/oilPaintings/*.{png,jpg,jpeg}',
        '../../assets/digitalStudies/*.{png,jpg,jpeg}',
    ], { eager: true });

    const artItems = Object.entries(artImages).map(([path]) => {
        const [category, file] = path.split('/').slice(-2);
        const filename = file.replace(/\.[^.]+$/, '');
        const categoryLabel = CATEGORY_LABELS[category] ?? 'Art';
        const dateKey = `${category}/${file}`;
        const pubDate = ART_PUBLISH_DATES[dateKey] ? new Date(ART_PUBLISH_DATES[dateKey]) : undefined;

        return {
            title: `${categoryLabel}: ${toDisplayName(filename)}`,
            pubDate,
            description: `New artwork in ${categoryLabel}.`,
            link: `/art#${slugify(categoryLabel)}`,
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
        title: 'JacobLDraws Combined Feed',
        description: 'Combined writing and art updates from JacobLDraws',
        site: context.site,
        items,
        customData: `<language>en-us</language>`,
    });
}
