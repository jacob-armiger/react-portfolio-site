// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

// 3. Define collections
const art = defineCollection({
    loader: glob({pattern: "**/*.md", base: "./src/content/art"}),
    schema: ({ image }) => z.object({
        date: z.date(),
        image: image(),
        title: z.string().optional(),
        reference: z.string().optional(),
        reference_url: z.string().url().optional(),
  }),
});

const projects = defineCollection({
    loader: glob({pattern: "**/*.md", base: "./src/content/projects"}),
    schema: () => z.object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
    }),
});

const books = defineCollection({
    loader: file("src/assets/books.json"),
    schema: () => z.object({
      id: z.string(),
      Title: z.string(),
      Author: z.string(),
      ISBN: z.string(),
      ISBN13: z.string(),
      "My Rating": z.string(),
      "Date Read": z.string(),
      Bookshelves: z.string(),
      "Exclusive Shelf": z.string(),
      "My Review": z.string(),
    }),
  });



// 3. Export a single `collections` object to register your collection(s)
export const collections = {
    art,
    projects,
    books
};
