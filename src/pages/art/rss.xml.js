import rss from '@astrojs/rss';
import { categorySingular, CATEGORY_LABELS, parseArtPieceDate, slugify } from '../../utils/artPiece';
import { FEED_XMLNS, feedCustomData } from '../../utils/feed';

const toDisplayName = (filename) =>
    filename
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

export async function GET(context) {
    const artImages = import.meta.glob([
        '../../assets/drawings/*.{png,jpg,jpeg,webp}',
        '../../assets/oilPaintings/*.{png,jpg,jpeg,webp}',
        '../../assets/digitalStudies/*.{png,jpg,jpeg,webp}',
    ], { eager: true });

    const items = Object.entries(artImages)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([path]) => {
            const [category, file] = path.split('/').slice(-2);
            const filename = file.replace(/\.[^.]+$/, '');
            const categoryLabel = CATEGORY_LABELS[category] ?? 'Art';
            const categoryTitleLabel = categorySingular(category);
            const parsed = parseArtPieceDate(filename);
            const pieceLink = `/art?piece=${slugify(categoryLabel)}-${filename}`;

            return {
                title: parsed ? `${categoryTitleLabel}: ${parsed.label}` : `${categoryLabel}: ${toDisplayName(filename)}`,
                pubDate: parsed?.date,
                description: `New artwork in ${categoryLabel}.`,
                link: pieceLink,
            };
        });

    return rss({
        // `<title>` field in output xml
        title: "Jacob's Art",
        // `<description>` field in output xml
        description: 'All kinds of Art made by Jacob',
        // Pull in your project "site" from the endpoint context
        // https://docs.astro.build/en/reference/api-reference/#site
        site: context.site,
        // Array of `<item>`s in output xml
        items: items,
        xmlns: FEED_XMLNS,
        customData: feedCustomData(context),
        // Item links use a `?piece=` query string; a trailing slash would get
        // appended after the query string and corrupt it, so disable it here.
        trailingSlash: false,
    });
}
