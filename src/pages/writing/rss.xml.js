import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const essays = await getCollection('essay');
    const articles = await getCollection('article');
    const posts = [...essays, ...articles];
    return rss({
        title: 'Jacob\'s Writings',
        description: 'Articles and Essays on Art',
        site: context.site + '/writing',
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.dateCreated || post.data.date,
            description: post.body,
            link: `/writing/${post.id}`
        })),
        customData: `<language>en-us</language>`,
    });
}
