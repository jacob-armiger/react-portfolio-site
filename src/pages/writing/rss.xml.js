import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const blogPosts = await getCollection('blog');
    const artPosts = await getCollection('art');
    const posts = [...blogPosts, ...artPosts];
    return rss({
        title: 'Jacob\'s Writings',
        description: 'Blog posts, essays, and cover-featured pieces',
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
