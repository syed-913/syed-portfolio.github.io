import { useContext, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { HtmlSanitizerContext } from '../../context/HtmlSanitizerContext';
import { richTextPolicy } from '../../lib/richTextPolicy';

export function SafeProjectHtml({ html }: { html: string }) {
  const buildSanitizer = useContext(HtmlSanitizerContext);
  const clean = useMemo(() => buildSanitizer ? buildSanitizer(html) : DOMPurify.isSupported ? DOMPurify.sanitize(html, richTextPolicy) : undefined, [html, buildSanitizer]);
  // Unsupported environments get readable escaped content, never raw HTML.
  return clean === undefined ? <pre>{html}</pre> : <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
