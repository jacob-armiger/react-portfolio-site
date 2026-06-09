import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const articles = await getCollection('article');
    return rss({
        title: 'JacobLDraws Blog',
        description: 'Writing from JacobLDraws on art and related topics',
        site: context.site + '/writing',
        items: articles.map((article) => ({
            title: article.data.title,
            pubDate: article.data.date,
            description: article.data.title,
            content: article.rendered?.html ?? article.body,
            link: `/writing/${article.id}`
        })),
        customData: `<language>en-us</language>`,
    });
}
