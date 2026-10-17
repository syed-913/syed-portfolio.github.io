import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "./CopyButton";

export const CodeBlock = ({ code, language = "text" }: { code: string; language?: string }) => <div className="code-frame">
  <div className="code-frame-head"><span>{language}</span><CopyButton text={code} /></div>
  <SyntaxHighlighter style={vscDarkPlus} language={language.toLowerCase()} PreTag="div" customStyle={{ margin: 0, padding: "24px", background: "transparent", fontSize: "inherit" }}>
    {code}
  </SyntaxHighlighter>
</div>;
