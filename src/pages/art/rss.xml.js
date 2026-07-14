import rss from '@astrojs/rss';

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

export async function GET(context) {
    const artImages = import.meta.glob([
        '../../assets/drawings/*.{png,jpg,jpeg}',
        '../../assets/oilPaintings/*.{png,jpg,jpeg}',
        '../../assets/digitalStudies/*.{png,jpg,jpeg}',
    ], { eager: true });

    const items = Object.entries(artImages)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([path]) => {
            const [category, file] = path.split('/').slice(-2);
            const filename = file.replace(/\.[^.]+$/, '');
            const categoryLabel = CATEGORY_LABELS[category] ?? 'Art';
            const categoryTitleLabel = CATEGORY_TITLE_LABELS[category] ?? 'Art';
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
        // (optional) inject custom xml
        customData: `<language>en-us</language>`,
        // Item links use a `?piece=` query string; a trailing slash would get
        // appended after the query string and corrupt it, so disable it here.
        trailingSlash: false,
    });
}
