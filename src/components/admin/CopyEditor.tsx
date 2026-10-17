import { useId, useRef } from "react";
import { Bold, Code2, Italic } from "lucide-react";
import { InlineCopy, InlineCopyLines } from "../ui/InlineCopy";

export const CopyEditor = ({ label, value, onChange, rows = 3, authoredLines = false }: { label: string; value: string; onChange: (value: string) => void; rows?: number; authoredLines?: boolean }) => {
  const id = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const format = (marker: string) => {
    const field = textarea.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = value.slice(start, end) || "text";
    onChange(value.slice(0, start) + marker + selected + marker + value.slice(end));
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    });
  };
  return <div className="admin-field copy-editor">
    <label htmlFor={id}>{label}</label>
    <div className="copy-editor-toolbar" role="group" aria-label={`Format ${label}`}>
      <button type="button" onClick={() => format("**")} aria-label={`Bold in ${label}`}><Bold size={14} />Bold</button>
      <button type="button" onClick={() => format("*")} aria-label={`Italic in ${label}`}><Italic size={14} />Italic</button>
      <button type="button" onClick={() => format("`")} aria-label={`Inline code in ${label}`}><Code2 size={14} />Code</button>
    </div>
    <textarea ref={textarea} id={id} className="admin-input admin-textarea" rows={rows} value={value} onChange={event => onChange(event.target.value)} aria-describedby={`${id}-preview-label`} />
    <div className={`copy-editor-preview${authoredLines ? " has-authored-lines" : ""}`}><span id={`${id}-preview-label`}>Preview</span><div>{value ? authoredLines ? <InlineCopyLines>{value}</InlineCopyLines> : <InlineCopy>{value}</InlineCopy> : <span className="copy-preview-empty">Your text will appear here.</span>}</div></div>
  </div>;
};
