import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const articles = await getCollection('article');
    return rss({
        title: 'Jacob\'s Articles',
        description: 'Articles on Art',
        site: context.site + '/writing',
        items: articles.map((article) => ({
            title: article.data.title,
            pubDate: article.data.date,
            description: article.body,
            link: `/writing/${article.id}`
        })),
        customData: `<language>en-us</language>`,
    });
}
