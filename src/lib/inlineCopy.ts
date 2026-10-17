export type InlineCopyPart = { kind: "text" | "strong" | "em" | "code"; text: string; children?: InlineCopyPart[] };

/** Deliberately small: prose emphasis and inline code, with no links or HTML. */
export function parseInlineCopy(source: string, depth = 0): InlineCopyPart[] {
  if (depth > 8) return [{ kind: "text", text: source }];
  const pattern = /\\([\\`*_])|(`+)([\s\S]*?)\2|\*\*([\s\S]+?)\*\*(?!\*)|__([\s\S]+?)__(?!_)|(?<!\*)\*([^*]+)\*(?!\*)|(?<![\w_])_([^_]+)_(?![\w_])/g;
  const parts: InlineCopyPart[] = [];
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index > cursor) parts.push({ kind: "text", text: source.slice(cursor, match.index) });
    if (match[1]) parts.push({ kind: "text", text: match[1] });
    else if (match[2]) parts.push({ kind: "code", text: match[3] });
    else {
      const text = match[4] ?? match[5] ?? match[6] ?? match[7];
      parts.push({ kind: match[4] !== undefined || match[5] !== undefined ? "strong" : "em", text, children: parseInlineCopy(text, depth + 1) });
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < source.length) parts.push({ kind: "text", text: source.slice(cursor) });
  return parts;
}

export const plainInlineCopy = (source: string): string =>
  parseInlineCopy(source).map(part => part.children ? plainInlineCopy(part.text) : part.kind === "code" ? part.text.replace(/\n/g, " ") : part.text).join("");

/** Split after parsing so a delimiter may span the authored headline lines. */
const splitParts = (parts: InlineCopyPart[]): InlineCopyPart[][] => {
  const lines: InlineCopyPart[][] = [[]];
  for (const part of parts) {
    const fragments = part.children
      ? splitParts(part.children).map(children => [{ ...part, children }])
      : part.text.split("\n").map(text => [{ ...part, text }]);
    fragments.forEach((fragment, index) => {
      if (index) lines.push([]);
      lines[lines.length - 1].push(...fragment);
    });
  }
  return lines;
};

export const inlineCopyLines = (source: string) => splitParts(parseInlineCopy(source));
