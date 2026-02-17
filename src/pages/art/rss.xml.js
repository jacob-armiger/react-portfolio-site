import rss from '@astrojs/rss';

export async function GET(context) {
    const artImages = import.meta.glob('../../assets/art/*.png', { eager: true });
    
    const items = Object.entries(artImages)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([path, module]) => {
            const filename = path.split('/').pop().replace('.png', '');
            return {
                title: `Art ${filename}`,
                pubDate: new Date(),
                description: `Artwork by Jacob`,
                link: `/art#${filename}`
            };
        });

    return rss({
        // `<title>` field in output xml
        title: "Jacob's Art",
        // `<description>` field in output xml
        description: 'All kinds of Art made by Jacob',
        // Pull in your project "site" from the endpoint context
        // https://docs.astro.build/en/reference/api-reference/#site
        site: context.site + "/art",
        // Array of `<item>`s in output xml
        items: items,
        // (optional) inject custom xml
        customData: `<language>en-us</language>`,
    });
}
