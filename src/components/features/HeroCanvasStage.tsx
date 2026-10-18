import { useId, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import '../../hero-canvas.css';
import { ArrowUpRight } from 'lucide-react';
import type { CanvasElement, CanvasLayout, CanvasScene } from '../../types/heroCanvas';
import { safeLink } from '../../lib/safeLink';
import { InlineCopy } from '../ui/InlineCopy';
import { SafeMarkdown } from '../ui/SafeMarkdown';

export interface CanvasStageProps {
  scene: CanvasScene;
  layout: CanvasLayout;
  editing?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  onDrag?: (event: PointerEvent<HTMLElement>, element: CanvasElement, resize?: boolean) => void;
  onElementKey?: (event: KeyboardEvent<HTMLElement>, element: CanvasElement, resize?: boolean) => void;
  onInspect?: (element: CanvasElement) => void;
  inspectedId?: string;
}

export const HeroCanvasStage = ({ scene, layout, editing, selectedId, onSelect, onDrag, onElementKey, onInspect, inspectedId }: CanvasStageProps) => {
  const id = useId();
  return <div className={`hero-canvas-stage ${editing ? 'is-editing' : ''}`} data-layout={layout} style={{ '--canvas-mobile-height': scene.mobileHeight } as CSSProperties} role={editing ? 'group' : 'figure'} aria-label={`${scene.title} ${layout} canvas`}>
    {scene.elements.filter(element => editing || (!element.hidden && !(layout === 'mobile' && element.mobileHidden))).map(element => {
      const box = layout === 'mobile' ? element.mobileBox : element.box;
      const interactive = !editing && (safeLink(element.href) || element.detail);
      const style = { left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%`, '--element-rotation': `${layout === 'mobile' ? element.mobileRotation : element.rotation}deg`, textAlign: element.align } as CSSProperties;
      const content = <>
        {element.kind === 'diamond' && <svg className="canvas-diamond" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="50,1 99,50 50,99 1,50" vectorEffect="non-scaling-stroke"/></svg>}
        {['line', 'arrow'].includes(element.kind) ? <svg className="canvas-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={element.kind === 'arrow' ? 'M1 50H98M86 24L98 50 86 76' : 'M1 50H99'} vectorEffect="non-scaling-stroke"/></svg> : <div className="canvas-element-copy">{element.kind === 'markdown' ? <SafeMarkdown links={!editing && !element.href}>{element.text}</SafeMarkdown> : <InlineCopy>{element.text}</InlineCopy>}</div>}
        {!editing && interactive && <ArrowUpRight className="canvas-link-mark" size={14} aria-hidden="true"/>}
      </>;
      const className = `canvas-element kind-${element.kind} treatment-${element.treatment} size-${element.textSize}${selectedId === element.id ? ' is-selected' : ''}${element.hidden || (layout === 'mobile' && element.mobileHidden) ? ' is-hidden' : ''}${element.locked ? ' is-locked' : ''}${interactive ? ' is-interactive' : ''}`;
      if (editing) return <div key={element.id} className={className} style={style} role="group" aria-roledescription="canvas element" tabIndex={0} aria-label={`${selectedId === element.id ? 'Selected ' : ''}${element.kind}: ${element.text.replace(/[*`#]/g, '').slice(0, 60) || 'Untitled shape'}${element.locked ? ', locked' : ''}`} onClick={event => { event.preventDefault(); onSelect?.(element.id); }} onPointerDown={event => onDrag?.(event, element)} onKeyDown={event => onElementKey?.(event, element)}>
        {content}
        {selectedId === element.id && !element.locked && <button className="canvas-resize-handle" type="button" aria-label="Resize selected element with arrow keys or drag" onPointerDown={event => { event.stopPropagation(); onDrag?.(event, element, true); }} onClick={event => event.stopPropagation()} onKeyDown={event => { event.stopPropagation(); onElementKey?.(event, element, true); }}><span/></button>}
      </div>;
      const href = safeLink(element.href);
      if (href) return <a key={element.id} className={className} style={style} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{content}</a>;
      if (element.detail) return <button key={element.id} type="button" className={className} style={style} onClick={() => onInspect?.(element)} aria-expanded={inspectedId === element.id} aria-controls={`canvas-detail-${id}`}>{content}</button>;
      return <div key={element.id} className={className} style={style}>{content}</div>;
    })}
    {!editing && <span id={`canvas-detail-${id}`} className="sr-only">Project element details appear below this drawing.</span>}
  </div>;
};
