import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const art = await getCollection('art');
    return rss({
        // `<title>` field in output xml
        title: "Jacob's Art Blog",
        // `<description>` field in output xml
        description: 'I post my art and write about it',
        // Pull in your project "site" from the endpoint context
        // https://docs.astro.build/en/reference/api-reference/#site
        site: context.site + "/gallery",
        // Array of `<item>`s in output xml
        // See "Generating items" section for examples using content collections and glob imports
        items: art.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: "Click the RSS link to see art. " + post.body,
            link: `/gallery/${post.id}`
        })),
        // (optional) inject custom xml
        customData: `<language>en-us</language>`,
    });
}
