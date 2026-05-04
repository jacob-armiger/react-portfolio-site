import rss from '@astrojs/rss';

const CATEGORY_LABELS = {
    selectedWork: 'Selected Work',
    drawings: 'Drawings',
    oilPaintings: 'Oil Paintings',
    digitalStudies: 'Digital Studies',
};

const slugify = (value) => value.toLowerCase().replace(/\s+/g, '-');

const toDisplayName = (filename) =>
    filename
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

export async function GET(context) {
    const artImages = import.meta.glob([
        '../../assets/selectedWork/*.{png,jpg,jpeg}',
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

            return {
                title: `${categoryLabel}: ${toDisplayName(filename)}`,
                // Build-time date keeps feed valid in static deployments.
                pubDate: new Date(),
                description: `New artwork in ${categoryLabel}.`,
                link: `/art#${slugify(categoryLabel)}`,
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
    });
}
