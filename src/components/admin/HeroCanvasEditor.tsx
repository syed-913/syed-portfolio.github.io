import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Bold, Circle, Copy, Diamond, Eye, EyeOff, Italic, Code2, Layers, LockKeyhole, Minus, Monitor, Plus, RectangleHorizontal, Redo2, Save, Smartphone, Square, TextQuote, Trash2, Type, Undo2, UnlockKeyhole } from 'lucide-react';
import type { Project } from '../../types/database';
import type { CanvasBox, CanvasElement, CanvasElementKind, CanvasLayout, CanvasScene, HeroCanvasConfig } from '../../types/heroCanvas';
import { CANVAS_LIMITS, canvasIssues, fitCanvasBox, normalizeHeroCanvas } from '../../lib/heroCanvas';
import '../../canvas-editor.css';
import { newCanvasElement, sceneFromProject } from '../../lib/canvasPresets';
import { HeroCanvasStage } from '../features/HeroCanvasStage';
import { AdminField, AdminInput, AdminSection, AdminSelect, AdminTextarea } from './AdminUI';

const DRAFT_KEY = 'portfolio:hero-canvas-draft:v1';
const tools = [
  { kind: 'box', label: 'Box', icon: Square }, { kind: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
  { kind: 'ellipse', label: 'Ellipse', icon: Circle }, { kind: 'diamond', label: 'Diamond', icon: Diamond },
  { kind: 'line', label: 'Line', icon: Minus }, { kind: 'arrow', label: 'Arrow', icon: ArrowRight },
  { kind: 'text', label: 'Text', icon: Type }, { kind: 'markdown', label: 'Markdown', icon: TextQuote },
] as const;
const elementName = (element: CanvasElement) => element.text.replace(/[*`#\n]/g, ' ').trim().slice(0, 32) || `${element.kind} shape`;
type HistoryState = { past: HeroCanvasConfig[]; present: HeroCanvasConfig; future: HeroCanvasConfig[] };
type ConfigChange = (config: HeroCanvasConfig) => HeroCanvasConfig;

const CanvasCopyField = ({ value, onChange, markdown }: { value: string; onChange: (value: string) => void; markdown: boolean }) => {
  const field = useRef<HTMLTextAreaElement>(null), id = useId();
  const format = (marker: string) => {
    if (!field.current) return;
    const start = field.current.selectionStart, end = field.current.selectionEnd, selected = value.slice(start, end) || 'text';
    onChange(value.slice(0, start) + marker + selected + marker + value.slice(end));
    requestAnimationFrame(() => { field.current?.focus(); field.current?.setSelectionRange(start + marker.length, start + marker.length + selected.length); });
  };
  return <div className="admin-field canvas-copy-field"><label htmlFor={id}>Content</label><div className="canvas-format-toolbar" role="group" aria-label="Format canvas content"><button type="button" aria-label="Bold canvas text" onClick={() => format('**')}><Bold size={14}/></button><button type="button" aria-label="Italic canvas text" onClick={() => format('*')}><Italic size={14}/></button><button type="button" aria-label="Code in canvas text" onClick={() => format('`')}><Code2 size={14}/></button></div><textarea ref={field} id={id} className="admin-input admin-textarea" rows={5} value={value} maxLength={CANVAS_LIMITS.text} onChange={event => onChange(event.target.value)} aria-describedby={`${id}-help`}/><small id={`${id}-help`}>{markdown ? 'Markdown supports headings, lists, links, bold, italic and code. The canvas is your live preview.' : 'Supports bold, italic, inline code and line breaks.'}</small></div>;
};

export const HeroCanvasEditor = ({ initialConfig, projects, onSave }: { initialConfig: HeroCanvasConfig; projects: Project[]; onSave: (config: HeroCanvasConfig) => Promise<void> }) => {
  const [history, setHistory] = useState<HistoryState>({ past: [], present: initialConfig, future: [] });
  const config = history.present;
  const [saved, setSaved] = useState(initialConfig);
  const [sceneId, setSceneId] = useState(initialConfig.defaultSceneId);
  const [selectedId, setSelectedId] = useState(initialConfig.scenes[0]?.elements[0]?.id ?? '');
  const [layout, setLayout] = useState<CanvasLayout>('desktop');
  const [snap, setSnap] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [draft, setDraft] = useState<HeroCanvasConfig | undefined>(() => {
    try { return normalizeHeroCanvas(JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')); } catch { return undefined; }
  });
  const dragCleanup = useRef<(() => void) | null>(null);
  const lastDraft = useRef({ config, dirty: false });
  const scene = config.scenes.find(item => item.id === sceneId) ?? config.scenes[0];
  const selected = scene?.elements.find(item => item.id === selectedId);
  const dirty = config !== saved;
  const issues = canvasIssues(config, projects);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(config)); } catch { /* Draft storage is optional. */ } }, 500);
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', unload);
    return () => { clearTimeout(timer); window.removeEventListener('beforeunload', unload); };
  }, [config, dirty]);
  useEffect(() => { lastDraft.current = { config, dirty }; }, [config, dirty]);
  useEffect(() => () => {
    dragCleanup.current?.();
    if (lastDraft.current.dirty) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(lastDraft.current.config)); } catch { /* Optional storage. */ } }
  }, []);

  const apply = (change: ConfigChange) => setHistory(previous => ({ past: [...previous.past, previous.present].slice(-40), present: change(previous.present), future: [] }));
  const undo = () => setHistory(previous => previous.past.length ? { past: previous.past.slice(0, -1), present: previous.past[previous.past.length - 1], future: [previous.present, ...previous.future].slice(0, 40) } : previous);
  const redo = () => setHistory(previous => previous.future.length ? { past: [...previous.past, previous.present].slice(-40), present: previous.future[0], future: previous.future.slice(1) } : previous);
  const modifyScene = (change: (scene: CanvasScene) => CanvasScene) => { if (scene) apply(previous => ({ ...previous, scenes: previous.scenes.map(item => item.id === scene.id ? change(item) : item) })); };
  const modifyElement = (change: Partial<CanvasElement>) => { if (selected) modifyScene(current => ({ ...current, elements: current.elements.map(item => item.id === selected.id ? { ...item, ...change } : item) })); };
  const geometry = selected ? layout === 'mobile' ? selected.mobileBox : selected.box : undefined;
  const modifyBox = (change: Partial<CanvasBox>) => { if (geometry) modifyElement({ [layout === 'mobile' ? 'mobileBox' : 'box']: fitCanvasBox({ ...geometry, ...change }) }); };
  const addElement = (kind: CanvasElementKind) => {
    if (!scene || scene.elements.length >= CANVAS_LIMITS.elements) return;
    const element = newCanvasElement(kind, scene.elements.length);
    modifyScene(current => ({ ...current, elements: [...current.elements, element] })); setSelectedId(element.id);
  };
  const removeElement = () => { if (selected) { modifyScene(current => ({ ...current, elements: current.elements.filter(item => item.id !== selected.id) })); setSelectedId(''); } };
  const duplicateElement = () => {
    if (!selected || !scene || scene.elements.length >= CANVAS_LIMITS.elements) return;
    const element = { ...selected, id: newCanvasElement(selected.kind).id, box: fitCanvasBox({ ...selected.box, x: selected.box.x + 3, y: selected.box.y + 3 }), mobileBox: fitCanvasBox({ ...selected.mobileBox, y: selected.mobileBox.y + 3 }) };
    modifyScene(current => ({ ...current, elements: [...current.elements, element] })); setSelectedId(element.id);
  };
  const moveLayer = (direction: number) => {
    if (!selected || !scene) return;
    const index = scene.elements.findIndex(item => item.id === selected.id), next = index + direction;
    if (next < 0 || next >= scene.elements.length) return;
    modifyScene(current => { const elements = [...current.elements]; [elements[index], elements[next]] = [elements[next], elements[index]]; return { ...current, elements }; });
  };
  const addScene = () => {
    if (config.scenes.length >= CANVAS_LIMITS.scenes) return;
    const unused = projects.find(project => project.visible && !config.scenes.some(item => item.projectId === project.id));
    const next = sceneFromProject(unused);
    apply(previous => ({ ...previous, scenes: [...previous.scenes, next] })); setSceneId(next.id); setSelectedId(next.elements[0]?.id ?? '');
  };
  const removeScene = () => {
    if (!scene || config.scenes.length <= 1) return;
    const next = config.scenes.find(item => item.id !== scene.id)!;
    apply(previous => ({ ...previous, scenes: previous.scenes.filter(item => item.id !== scene.id), defaultSceneId: previous.defaultSceneId === scene.id ? next.id : previous.defaultSceneId })); setSceneId(next.id); setSelectedId('');
  };
  const autoArrangeMobile = () => modifyScene(current => {
    const content = current.elements.filter(item => !['arrow', 'line'].includes(item.kind));
    const row = Math.max(10, 88 / Math.max(1, content.length));
    return { ...current, mobileHeight: Math.min(1600, Math.max(720, content.length * 110)), elements: current.elements.map(item => ['arrow', 'line'].includes(item.kind) ? { ...item, mobileHidden: true } : { ...item, mobileHidden: false, mobileBox: fitCanvasBox({ x: 5, y: 3 + content.findIndex(node => node.id === item.id) * row, width: 90, height: row - 2 }) }) };
  });

  const startDrag = (event: PointerEvent<HTMLElement>, element: CanvasElement, resize = false) => {
    setSelectedId(element.id);
    if (element.locked || event.button !== 0 || !scene) return;
    event.preventDefault();
    dragCleanup.current?.();
    const surface = event.currentTarget.closest('.hero-canvas-stage');
    if (!surface) return;
    const rect = surface.getBoundingClientRect(), x = event.clientX, y = event.clientY, initial = config;
    const box = layout === 'mobile' ? element.mobileBox : element.box;
    const field = layout === 'mobile' ? 'mobileBox' : 'box';
    let moved = false;
    const move = (pointer: globalThis.PointerEvent) => {
      if (pointer.pointerId !== event.pointerId) return;
      pointer.preventDefault();
      const dx = (pointer.clientX - x) / rect.width * 100, dy = (pointer.clientY - y) / rect.height * 100;
      if (Math.abs(dx) + Math.abs(dy) < 0.2) return;
      moved = true;
      const quantize = (value: number, step: number) => snap ? Math.round(value / step) * step : value;
      const stepX = (layout === 'mobile' ? 30 : 47) / rect.width * 100, stepY = (layout === 'mobile' ? 30 : 47) / rect.height * 100;
      const next = fitCanvasBox(resize ? { ...box, width: quantize(box.width + dx, stepX), height: quantize(box.height + dy, stepY) } : { ...box, x: quantize(box.x + dx, stepX), y: quantize(box.y + dy, stepY) });
      setHistory(previous => ({ ...previous, present: { ...initial, scenes: initial.scenes.map(item => item.id === scene.id ? { ...item, elements: item.elements.map(node => node.id === element.id ? { ...node, [field]: next } : node) } : item) }, future: [] }));
    };
    const cleanup = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', cancel); window.removeEventListener('keydown', escape); dragCleanup.current = null; };
    const finish = () => { cleanup(); if (moved) setHistory(previous => ({ ...previous, past: [...previous.past, initial].slice(-40) })); };
    const cancel = () => { cleanup(); setHistory(previous => ({ ...previous, present: initial })); };
    const escape = (key: globalThis.KeyboardEvent) => { if (key.key === 'Escape') { key.preventDefault(); cancel(); } };
    window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', cancel); window.addEventListener('keydown', escape); dragCleanup.current = cleanup;
  };
  const elementKey = (event: KeyboardEvent<HTMLElement>, element: CanvasElement, resize = false) => {
    if (event.target !== event.currentTarget) return;
    setSelectedId(element.id);
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); return; }
    if (element.locked) return;
    const box = layout === 'mobile' ? element.mobileBox : element.box, step = event.shiftKey ? 5 : 1;
    const directions: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (directions[event.key]) {
      event.preventDefault(); const [dx, dy] = directions[event.key];
      modifyScene(current => ({ ...current, elements: current.elements.map(item => item.id === element.id ? { ...item, [layout === 'mobile' ? 'mobileBox' : 'box']: fitCanvasBox(resize ? { ...box, width: box.width + dx, height: box.height + dy } : { ...box, x: box.x + dx, y: box.y + dy }) } : item) }));
    } else if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); modifyScene(current => ({ ...current, elements: current.elements.filter(item => item.id !== element.id) })); setSelectedId(''); }
  };
  const publish = async () => {
    if (saving || issues.length) return;
    const snapshot = { ...config, enabled: saved.enabled && !config.enabled ? false : true }; setSaving(true); setSaveError(false); setStatus('Saving canvas…');
    try {
      await onSave(snapshot); setSaved(snapshot);
      setHistory(previous => ({ ...previous, present: previous.present === config ? snapshot : { ...previous.present, enabled: snapshot.enabled } }));
      setStatus(snapshot.enabled ? 'Canvas published. Your project scenes are live.' : 'Original canvas restored. Your edited scenes are kept here.'); setDraft(undefined);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* Optional storage. */ }
    } catch (error) { setSaveError(true); setStatus(error instanceof Error ? error.message : 'Could not save. Please try again.'); }
    finally { setSaving(false); }
  };

  return <AdminSection title="Hero canvas" description="Compose the project drawing on your home page. Publish canvas saves and displays these scenes. The grid and palette stay in place." action={<button className="canvas-editor-button is-primary" type="button" disabled={saving || (!dirty && saved.enabled) || issues.length > 0} onClick={() => void publish()}><Save size={15}/>{saving ? 'Saving…' : saved.enabled && !config.enabled ? 'Use original canvas' : 'Publish canvas'}</button>}>
    <div className="canvas-editor" onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !(event.target instanceof HTMLElement && event.target.closest('input,textarea,select'))) { event.preventDefault(); if (event.shiftKey) redo(); else undo(); } }}>
      <div className="canvas-editor-publish"><label><input type="checkbox" checked={config.enabled} onChange={event => apply(previous => ({ ...previous, enabled: event.target.checked }))}/>Show custom canvas on home</label><span>{dirty ? 'Unpublished changes · draft kept in this browser' : config.enabled ? 'Published canvas' : 'Original canvas active'}</span></div>
      {draft && <div className="canvas-draft-notice"><p>A local canvas draft is available.</p><button type="button" onClick={() => { apply(() => draft); setSceneId(draft.defaultSceneId); setSelectedId(''); setDraft(undefined); }}>Restore draft</button><button type="button" onClick={() => { setDraft(undefined); try { localStorage.removeItem(DRAFT_KEY); } catch { /* Optional storage. */ } }}>Discard draft</button></div>}
      <div className="canvas-editor-scenes"><AdminField label="Project scene"><AdminSelect value={scene?.id ?? ''} onChange={event => { setSceneId(event.target.value); setSelectedId(''); }}>{config.scenes.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</AdminSelect></AdminField><div className="canvas-editor-scene-actions"><button type="button" className="canvas-editor-button" onClick={addScene} disabled={config.scenes.length >= CANVAS_LIMITS.scenes}><Plus size={14}/>Add scene</button><button type="button" className="canvas-editor-icon" aria-label="Delete scene" onClick={removeScene} disabled={config.scenes.length <= 1}><Trash2 size={16}/></button></div><div className="canvas-undo-actions"><button type="button" className="canvas-editor-icon" onClick={undo} disabled={!history.past.length} aria-label="Undo canvas change"><Undo2 size={17}/></button><button type="button" className="canvas-editor-icon" onClick={redo} disabled={!history.future.length} aria-label="Redo canvas change"><Redo2 size={17}/></button></div></div>
      <div className="canvas-toolbox" role="group" aria-label="Add canvas elements">{tools.map(tool => <button key={tool.kind} type="button" onClick={() => addElement(tool.kind)} disabled={!scene || scene.elements.length >= CANVAS_LIMITS.elements}><tool.icon size={15}/>{tool.label}</button>)}</div>
      {scene && <>
        <div className="canvas-editor-grid">
          <aside className="canvas-layer-panel"><div className="canvas-editor-panel-title"><h3><Layers size={15}/>Layers</h3><span>{scene.elements.length}/{CANVAS_LIMITS.elements}</span></div><ol>{[...scene.elements].reverse().map(element => <li key={element.id}><button type="button" aria-pressed={selectedId === element.id} onClick={() => setSelectedId(element.id)} className={element.hidden ? 'is-hidden' : ''}><span>{elementName(element)}</span><small>{element.locked ? <LockKeyhole size={12}/> : element.hidden ? <EyeOff size={12}/> : element.kind}</small></button></li>)}</ol>{!scene.elements.length && <p className="admin-help">Add a shape or text to start.</p>}</aside>
          <div className="canvas-editor-workbench"><div className="canvas-editor-view-controls"><div role="group" aria-label="Canvas arrangement"><button type="button" aria-pressed={layout === 'desktop'} onClick={() => setLayout('desktop')}><Monitor size={15}/>Desktop</button><button type="button" aria-pressed={layout === 'mobile'} onClick={() => setLayout('mobile')}><Smartphone size={15}/>Mobile</button></div><label><input type="checkbox" checked={snap} onChange={event => setSnap(event.target.checked)}/>Snap</label></div><div className="canvas-editor-preview" data-layout={layout}><HeroCanvasStage scene={scene} layout={layout} editing selectedId={selectedId} onSelect={setSelectedId} onDrag={startDrag} onElementKey={elementKey}/></div><p className="canvas-stage-help">Drag to move. Use the corner handle to resize. Arrow keys nudge; Shift moves 5%. Positions and sizes are percentages.</p>{layout === 'mobile' && <button type="button" className="canvas-editor-button" onClick={autoArrangeMobile}>Stack elements for mobile</button>}</div>
          <aside className="canvas-inspector"><div className="canvas-editor-panel-title"><h3>Inspector</h3>{selected && <span>{selected.kind}</span>}</div>{selected ? <>
            <div className="canvas-inspector-actions"><button type="button" className="canvas-editor-icon" aria-label="Duplicate selected element" onClick={duplicateElement} disabled={scene.elements.length >= CANVAS_LIMITS.elements}><Copy size={16}/></button><button type="button" className="canvas-editor-icon" aria-label="Bring selected element forward" onClick={() => moveLayer(1)} disabled={scene.elements.at(-1)?.id === selected.id}><ArrowUp size={16}/></button><button type="button" className="canvas-editor-icon" aria-label="Send selected element backward" onClick={() => moveLayer(-1)} disabled={scene.elements[0]?.id === selected.id}><ArrowDown size={16}/></button><button type="button" className="canvas-editor-icon" aria-label="Delete selected element" onClick={removeElement}><Trash2 size={16}/></button></div>
            {!['arrow', 'line'].includes(selected.kind) && <CanvasCopyField value={selected.text} onChange={value => modifyElement({ text: value })} markdown={selected.kind === 'markdown'}/>}
            <div className="canvas-geometry-fields">{(['x', 'y', 'width', 'height'] as const).map(key => <AdminField key={key} label={`${key[0].toUpperCase()}${key.slice(1)} %`}><AdminInput type="number" step="0.1" min={0} max={100} value={Math.round((geometry?.[key] ?? 0) * 10) / 10} onChange={event => modifyBox({ [key]: Number(event.target.value) })} disabled={selected.locked}/></AdminField>)}</div>
            <AdminField label="Rotation °"><AdminInput type="number" min={-180} max={180} value={layout === 'mobile' ? selected.mobileRotation : selected.rotation} disabled={selected.locked} onChange={event => modifyElement({ [layout === 'mobile' ? 'mobileRotation' : 'rotation']: Math.min(180, Math.max(-180, Number(event.target.value))) })}/></AdminField>
            <AdminField label="Treatment" hint="Uses your theme’s fixed color roles."><AdminSelect value={selected.treatment} onChange={event => modifyElement({ treatment: event.target.value as CanvasElement['treatment'] })}>{['outline', 'surface', 'emphasis', 'quiet'].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</AdminSelect></AdminField>
            <div className="canvas-geometry-fields"><AdminField label="Text size"><AdminSelect value={selected.textSize} onChange={event => modifyElement({ textSize: event.target.value as CanvasElement['textSize'] })}>{['small', 'body', 'title', 'display'].map(value => <option key={value} value={value}>{value}</option>)}</AdminSelect></AdminField><AdminField label="Alignment"><AdminSelect value={selected.align} onChange={event => modifyElement({ align: event.target.value as CanvasElement['align'] })}>{['left', 'center', 'right'].map(value => <option key={value} value={value}>{value}</option>)}</AdminSelect></AdminField></div>
            <AdminField label="Element link" hint="Optional. A site path or https URL; links take priority over details."><AdminInput value={selected.href} maxLength={2048} placeholder="/projects or https://…" onChange={event => modifyElement({ href: event.target.value })}/></AdminField>
            <AdminField label="On-click details" hint="Optional Markdown revealed when this element is selected publicly."><AdminTextarea rows={3} value={selected.detail} maxLength={CANVAS_LIMITS.text} onChange={event => modifyElement({ detail: event.target.value })}/></AdminField>
            <div className="canvas-element-flags"><label><input type="checkbox" checked={selected.locked} onChange={event => modifyElement({ locked: event.target.checked })}/>{selected.locked ? <LockKeyhole size={14}/> : <UnlockKeyhole size={14}/>}Lock position</label><label><input type="checkbox" checked={selected.hidden} onChange={event => modifyElement({ hidden: event.target.checked })}/>{selected.hidden ? <EyeOff size={14}/> : <Eye size={14}/>}Hide publicly</label>{layout === 'mobile' && <label><input type="checkbox" checked={selected.mobileHidden} onChange={event => modifyElement({ mobileHidden: event.target.checked })}/><EyeOff size={14}/>Hide on mobile only</label>}</div>
          </> : <p className="admin-help">Select an element in the canvas or layer list to edit its text, layout and behavior.</p>}</aside>
        </div>
        <details className="canvas-scene-settings"><summary>Scene settings · title, project link and initial view</summary><div className="admin-form-grid"><AdminField label="Scene title"><AdminInput value={scene.title} maxLength={100} onChange={event => modifyScene(current => ({ ...current, title: event.target.value }))}/></AdminField><AdminField label="Subtitle"><AdminInput value={scene.subtitle} maxLength={180} onChange={event => modifyScene(current => ({ ...current, subtitle: event.target.value }))}/></AdminField><AdminField label="Linked project"><AdminSelect value={scene.projectId} onChange={event => modifyScene(current => ({ ...current, projectId: event.target.value }))}><option value="">Custom scene · no project link</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}{project.visible ? '' : ' (hidden)'}</option>)}</AdminSelect></AdminField><AdminField label="Scene action label"><AdminInput value={scene.linkLabel} maxLength={80} onChange={event => modifyScene(current => ({ ...current, linkLabel: event.target.value }))}/></AdminField><AdminField label="Scene action URL" hint="Leave empty to use the linked project’s case study."><AdminInput value={scene.href} maxLength={2048} placeholder="/projects" onChange={event => modifyScene(current => ({ ...current, href: event.target.value }))}/></AdminField><AdminField label="Mobile canvas height" hint="Logical pixels, 360–1600. Desktop and mobile arrangements are independent."><AdminInput type="number" min={360} max={1600} step={10} value={scene.mobileHeight} onChange={event => modifyScene(current => ({ ...current, mobileHeight: Math.min(1600, Math.max(360, Number(event.target.value))) }))}/></AdminField></div><label className="canvas-default-scene"><input type="radio" name="initial-canvas-scene" checked={config.defaultSceneId === scene.id} onChange={() => apply(previous => ({ ...previous, defaultSceneId: scene.id }))}/>Open this scene first</label><div className="canvas-scene-maintenance"><button className="canvas-editor-button" type="button" onClick={() => { const preset = sceneFromProject(projects.find(project => project.id === scene.projectId)); modifyScene(() => ({ ...preset, id: scene.id })); setSelectedId(preset.elements[0]?.id ?? ''); }}>Reset scene template</button><button className="canvas-editor-button" type="button" onClick={() => { modifyScene(current => ({ ...current, elements: [] })); setSelectedId(''); }}>Clear scene</button></div></details>
      </>}
      {!!issues.length && <ul className="canvas-editor-issues" role="alert">{issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
      <p className={`canvas-editor-status${saveError ? ' is-error' : ''}`} role={saveError ? 'alert' : 'status'}>{status || 'Edits stay in your browser until you save. Publishing makes the scene content public.'}</p>
    </div>
  </AdminSection>;
};
