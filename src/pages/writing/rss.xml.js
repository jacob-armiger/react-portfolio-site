import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const articles = await getCollection('article');
    return rss({
        title: 'JacobLDraws Blog',
        description: 'Writing from JacobLDraws on art and related topics',
        site: context.site + '/writing',
        items: articles.map((article) => {
            const articleUrl = new URL(`/writing/${article.id}`, context.site).toString();
            const coverImageUrl = new URL(article.data.image.src, context.site).toString();
            const articleTitle = article.data.title ?? article.id;
            return {
                title: articleTitle,
                pubDate: article.data.date,
                description: 'Read the full article on JacobLDraws.',
                content: `<p><a href="${articleUrl}"><img src="${coverImageUrl}" alt="${articleTitle}" /></a></p><p><a href="${articleUrl}">Read article</a></p>`,
                link: `/writing/${article.id}`
            };
        }),
        customData: `<language>en-us</language>`,
    });
}
