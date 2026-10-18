import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { safeLink } from '../../lib/safeLink';

export const SafeMarkdown = ({ children, links = true }: { children: string; links?: boolean }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={url => safeLink(url) ?? ''} disallowedElements={links ? ['img', 'input'] : ['img', 'input', 'a']} unwrapDisallowed components={{
    h1: ({ children }) => <h3>{children}</h3>,
    h2: ({ children }) => <h3>{children}</h3>,
    a: ({ href, children }) => href?.startsWith('/') ? <Link to={href}>{children}</Link> : href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{children}</a> : <span>{children}</span>,
  }}>{children}</ReactMarkdown>
);
