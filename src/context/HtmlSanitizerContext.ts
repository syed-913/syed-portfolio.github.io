import { createContext } from 'react';

/** Build rendering supplies DOMPurify backed by jsdom; browsers use their native DOM. */
export const HtmlSanitizerContext = createContext<((html: string) => string) | null>(null);
