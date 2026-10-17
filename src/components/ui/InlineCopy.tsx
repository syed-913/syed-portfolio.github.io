import { Fragment, type ReactNode } from "react";
import { inlineCopyLines, parseInlineCopy, type InlineCopyPart } from "../../lib/inlineCopy";

const render = (parts: InlineCopyPart[]): ReactNode => parts.map((part, index) => {
  const content = part.children ? render(part.children) : part.text;
  if (part.kind === "strong") return <strong key={index}>{content}</strong>;
  if (part.kind === "em") return <em key={index} className="copy-emphasis">{content}</em>;
  if (part.kind === "code") return <code key={index} className="copy-code">{part.text.replace(/\n/g, " ")}</code>;
  return <Fragment key={index}>{content}</Fragment>;
});

export const InlineCopy = ({ children }: { children: string }) => <>{render(parseInlineCopy(children))}</>;

export const InlineCopyLines = ({ children, lineClassName }: { children: string; lineClassName?: (index: number) => string | undefined }) => <>{inlineCopyLines(children).map((parts, index) => <span key={index} className={lineClassName?.(index)}>{render(parts)}</span>)}</>;
