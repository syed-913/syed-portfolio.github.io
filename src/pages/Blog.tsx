import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SEO } from "../components/features/SEO";
import { PageIntro } from "../components/ui/PageIntro";
import { DataEmpty, DataError, DataLoading } from "../components/ui/DataState";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { usePublicData } from "../hooks/usePublicData";
import { getPublicPosts } from "../services/db";
import { displayReadTime } from "../lib/writing";

const previewText = (content: string) => {
  const text = content
    .replace(/^\s*#{1,6}\s+[^\n]+\n/, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>~]/g, "")
    .replace(/\s+/g, " ").trim();
  if (text.length <= 180) return text;
  const excerpt = text.slice(0, 180);
  const sentenceEnd = Array.from(excerpt.matchAll(/[.!?](?:\s|$)/g)).at(-1)?.index;
  if (sentenceEnd !== undefined && sentenceEnd >= 100) return excerpt.slice(0, sentenceEnd + 1);
  const wordEnd = excerpt.lastIndexOf(" ");
  return `${(wordEnd > 0 ? excerpt.slice(0, wordEnd) : excerpt).replace(/[.,;:]$/, "")}…`;
};
const readableDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
};

export default function Blog() {
  const { settings } = useSiteSettings();
  const { items: posts, loading, error, retry } = usePublicData(getPublicPosts, 'posts');
  return <div className="writing-index">
    <SEO title={`Writing — ${settings.shortName}`} description={settings.writingIntro} path="/writing" />
    <PageIntro title={settings.writingTitle} intro={settings.writingIntro} />
    <section className="content-section journal-grid" aria-label="Published articles">
      {loading ? <DataLoading label="Loading field notes…" variant="list" /> : error ? <DataError retry={retry} /> : posts.map(post => <article key={post.id ?? post.slug}>
        <Link to={`/writing/${post.slug}/`} className="journal-card" aria-labelledby={`note-${post.slug}`}>
          <div className="journal-meta"><time dateTime={post.date}>{readableDate(post.date)}</time><span>{displayReadTime(post)}</span></div>
          <div className="journal-copy">
            <h2 id={`note-${post.slug}`}>{post.title}</h2>
            <p>{previewText(post.content)}</p>
            <div className="tag-row">{post.tags?.slice(0, 4).map(tag => <span key={tag}>{tag}</span>)}</div>
          </div>
          <span className="journal-read" aria-hidden="true">Read note<ArrowUpRight size={19} /></span>
        </Link>
      </article>)}
      {!loading && !error && !posts.length && <DataEmpty title="No field notes published yet." body="The next note will appear here when it is ready." />}
    </section>
  </div>;
}
