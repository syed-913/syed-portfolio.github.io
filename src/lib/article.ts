export type ArticleSection = { id: string; title: string; level: number };
type MarkdownNode = { type: string; depth?: number; value?: string; children?: MarkdownNode[]; data?: { hProperties?: Record<string, unknown> } };
const plain = (value: string) => value.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim();
const headingId = (value: string) => plain(value).toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || "section";

// The article source is preserved. Only a repeated leading page title and
// skipped presentation heading levels are normalized for the reading view.
export const prepareArticle = (source: string, title: string) => {
  const content = source.replace(/^\s*#\s+([^\n]+)\n/, (match, heading: string) => plain(heading).toLowerCase() === plain(title).toLowerCase() ? "" : match);
  let fence = "";
  const headings: { line: number; level: number; title: string; markup: string }[] = [];
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line);
    if (marker) { if (!fence) fence = marker[1][0]; else if (marker[1][0] === fence) fence = ""; return; }
    if (fence) return;
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) headings.push({ line: index, level: heading[1].length, title: plain(heading[2]), markup: heading[2] });
  });
  const minimum = Math.min(...headings.map(heading => heading.level), 6);
  const counts = new Map<string, number>();
  const sections: ArticleSection[] = headings.map(heading => {
    const level = Math.min(6, Math.max(2, heading.level - minimum + 2));
    lines[heading.line] = `${"#".repeat(level)} ${heading.markup}`;
    const base = headingId(heading.title); const count = counts.get(base) ?? 0; counts.set(base, count + 1);
    return { id: count ? `${base}-${count + 1}` : base, title: heading.title, level };
  });
  return { content: lines.join("\n"), sections };
};

export const remarkArticleHeadings = () => (tree: MarkdownNode) => {
  const counts = new Map<string, number>();
  const text = (node: MarkdownNode): string => node.value ?? node.children?.map(text).join("") ?? "";
  const visit = (node: MarkdownNode) => {
    if (node.type === "heading") {
      const base = headingId(text(node)); const count = counts.get(base) ?? 0; counts.set(base, count + 1);
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: count ? `${base}-${count + 1}` : base } };
    }
    node.children?.forEach(visit);
  };
  visit(tree);
};
