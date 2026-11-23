import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { FEED_XMLNS, feedCustomData } from '../utils/feed';

export async function GET(context) {
    const books = await getCollection('books');
    return rss({
        // `<title>` field in output xml
        title: "Jacob's Readings and Impressions",
        // `<description>` field in output xml
        description: 'I rate books and sometimes write reviews on them',
        // Pull in your project "site" from the endpoint context
        // https://docs.astro.build/en/reference/api-reference/#site
        site: new URL('/books', context.site).toString(),
        // Array of `<item>`s in output xml
        // See "Generating items" section for examples using content collections and glob imports
        items: books
            .filter((post) => post.data["Date Read"])
            .sort((a, b) => b.data['Date Read'].localeCompare(a.data['Date Read']))
            .map((post) => ({
            title: post.data.Title,
            pubDate: post.data['Date Read'],
            description: `Rated ${post.data['My Rating']}/5.\n` + post.data['My Review'],
            link: `/books#book-${post.data.id}`,
        })),
        xmlns: FEED_XMLNS,
        customData: feedCustomData(context),
        // A trailing slash would land after the #fragment.
        trailingSlash: false,
    });
}
