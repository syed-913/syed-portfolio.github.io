import type { BlogPost } from '../types/database';

const WORDS_PER_MINUTE = 225;

export const estimateReadingMinutes = (content = '') => {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleaned ? cleaned.split(' ').filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

export const displayReadTime = (post: Pick<BlogPost, 'content'>) => {
  const minutes = estimateReadingMinutes(post.content);
  return `${minutes} min read`;
};
