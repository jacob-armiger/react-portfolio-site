import calculateReadingTime from 'reading-time';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';

export const getReadingTime = (text: string): string | undefined => {
  if (!text || !text.length) return undefined;
  try {
    const { minutes } = calculateReadingTime(toString(fromMarkdown(text)));
    // console.log(minutes)
    if (minutes > 1) {
      return `${Math.ceil(minutes)} min read`;
    } else if (minutes < 1) {
      return `${Math.ceil(minutes * 60)} sec read`;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};
