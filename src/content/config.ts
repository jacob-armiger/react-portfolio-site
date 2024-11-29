// 1. Import utilities from `astro:content`
import { z, defineCollection, reference } from 'astro:content';

// 2. Define a `type` and `schema` for each collection
const artCollection = defineCollection({
  type: 'content', // v2.5.0 and later
  schema: ({ image }) => z.object({
    date: z.date(),
    image: image(),
    title: z.string().optional(),
    reference: z.string().optional(),
    reference_url: z.string().url().optional(),
    // img: z.string(),
    // tags: z.array(z.string()),
    // image: z.string().optional(),
  }),
});

const projectCollection = defineCollection({
    type: 'content', // v2.5.0 and later
    schema: () => z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
    }),
  });

// 3. Export a single `collections` object to register your collection(s)
export const collections = {
    'art': artCollection,
    'projects': projectCollection,
};
