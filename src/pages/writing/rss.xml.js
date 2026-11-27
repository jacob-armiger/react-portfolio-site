import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { articleExcerpt } from '../../utils/article';
import { FEED_XMLNS, feedCustomData } from '../../utils/feed';
import { originalUrl } from '../../utils/originals';

export async function GET(context) {
    const articles = await getCollection('article');
    return rss({
        title: 'JacobLDraws Blog',
        description: 'Writing from JacobLDraws on art and related topics',
        site: new URL('/writing', context.site).toString(),
        items: articles.map((article) => {
            const articleUrl = new URL(`/writing/${article.id}`, context.site).toString();
            const coverImageUrl = new URL(originalUrl(article.data.image), context.site).toString();
            const articleTitle = article.data.title ?? article.id;
            return {
                title: articleTitle,
                pubDate: article.data.date,
                description: articleExcerpt(article.body, 300),
                content: `<p><a href="${articleUrl}"><img src="${coverImageUrl}" alt="${articleTitle}" /></a></p><p><a href="${articleUrl}">Read article</a></p>`,
                link: `/writing/${article.id}`
            };
        }),
        xmlns: FEED_XMLNS,
        customData: feedCustomData(context),
        trailingSlash: false,
    });
}
