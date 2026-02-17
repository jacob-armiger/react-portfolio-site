// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';

// 2. Import loader(s)
import { glob, file } from 'astro/loaders';

// 3. Define collections
const article = defineCollection({
    loader: glob({pattern: "**/*.{md,mdx}", base: "./src/content/article"}),
    schema: ({ image }) => z.object({
        date: z.date(),
        image: image(),
        title: z.string().optional(),
        reference: z.string().optional(),
        reference_url: z.string().url().optional(),
  }),
});

const essay = defineCollection({
    loader: glob({pattern: "**/*.{md,mdx}", base: "./src/content/essay"}),
    schema: () => z.object({
        title: z.string(),
        dateCreated: z.date(),
        dateEdited: z.date().optional(),
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

const projects = defineCollection({
    loader: glob({pattern: "**/*.{md,mdx}", base: "./src/content/projects"}),
    schema: () => z.object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
    }),
});


// 3. Export a single `collections` object to register your collection(s)
export const collections = {
    article,
    essay,
    books,
    projects,
};
