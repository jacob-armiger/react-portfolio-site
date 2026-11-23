import type { APIRoute, GetStaticPaths, ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import shareArtwork from "../../assets/selectedWork/13.jpeg";
import { mattedCard } from "../../utils/shareCard";

export const getStaticPaths = (async () => {
    const articles = await getCollection("article");
    return [
        { params: { key: "art" }, props: { image: shareArtwork } },
        ...articles.map((article) => ({
            params: { key: `writing-${article.id}` },
            props: { image: article.data.image },
        })),
    ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
    const body = await mattedCard((props as { image: ImageMetadata }).image);
    return new Response(new Uint8Array(body), { headers: { "Content-Type": "image/jpeg" } });
};
