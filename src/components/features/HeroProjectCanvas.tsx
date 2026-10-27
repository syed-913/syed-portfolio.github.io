import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/database';
import type { CanvasElement, HeroCanvasConfig } from '../../types/heroCanvas';
import { publicCanvasScenes } from '../../lib/heroCanvas';
import { safeLink } from '../../lib/safeLink';
import { HeroCanvasStage } from './HeroCanvasStage';
import { SafeMarkdown } from '../ui/SafeMarkdown';

export default function HeroProjectCanvas({ config, projects }: { config: HeroCanvasConfig; projects: Project[] }) {
  const scenes = publicCanvasScenes(config, projects);
  const [selectedId, setSelectedId] = useState(config.defaultSceneId);
  const [inspected, setInspected] = useState<CanvasElement | null>(null);
  const [compact, setCompact] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  useEffect(() => {
    const media = matchMedia('(max-width:600px)');
    const update = () => setCompact(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const scene = scenes.find(item => item.id === selectedId) ?? scenes[0];
  if (!scene) return null;
  const currentProject = projects.find(project => project.id === scene.projectId);
  const href = safeLink(scene.href) ?? (currentProject?.id ? `/projects/#${currentProject.id}` : '/projects/');
  const select = (index: number) => { setSelectedId(scenes[index].id); setInspected(null); };
  const keyDown = (event: KeyboardEvent, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight' || compact && event.key === 'ArrowDown') next = (index + 1) % scenes.length;
    else if (event.key === 'ArrowLeft' || compact && event.key === 'ArrowUp') next = (index + scenes.length - 1) % scenes.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = scenes.length - 1;
    else return;
    event.preventDefault(); select(next); tabRefs.current[next]?.focus({ preventScroll: true });
    tabRefs.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  return <div className="hero-canvas-viewer">
    <header className="canvas-scene-heading"><h2>{scene.title}</h2>{scene.subtitle && <span>{scene.subtitle}</span>}</header>
    {scenes.length > 1 && <div className="canvas-project-tabs" role="tablist" aria-label="Featured projects" aria-orientation={compact ? 'vertical' : 'horizontal'}>{scenes.map((item, index) => <button key={item.id} ref={node => { tabRefs.current[index] = node; }} role="tab" type="button" id={`${id}-tab-${item.id}`} aria-controls={`${id}-panel`} aria-selected={scene.id === item.id} tabIndex={scene.id === item.id ? 0 : -1} onClick={() => select(index)} onKeyDown={event => keyDown(event, index)}>{item.title}</button>)}</div>}
    <div className="canvas-responsive-stages" id={`${id}-panel`} role={scenes.length > 1 ? 'tabpanel' : undefined} aria-labelledby={scenes.length > 1 ? `${id}-tab-${scene.id}` : undefined}>
      <div className="canvas-desktop-stage"><HeroCanvasStage scene={scene} layout="desktop" inspectedId={inspected?.id} onInspect={element => setInspected(previous => previous?.id === element.id ? null : element)}/></div>
      <div className="canvas-mobile-stage"><HeroCanvasStage scene={scene} layout="mobile" inspectedId={inspected?.id} onInspect={element => setInspected(previous => previous?.id === element.id ? null : element)}/></div>
    </div>
    {inspected && <div className="canvas-inspection" role="region" aria-label="Project element details"><SafeMarkdown>{inspected.detail}</SafeMarkdown><button type="button" onClick={() => setInspected(null)} aria-label="Close element details"><X size={17}/></button></div>}
    <footer className="canvas-scene-footer">{href.startsWith('/') ? <Link to={href}>{scene.linkLabel}<ArrowUpRight size={20}/></Link> : <a href={href} target="_blank" rel="noopener noreferrer">{scene.linkLabel}<ArrowUpRight size={20}/></a>}<span>Selected work</span></footer>
  </div>;
}
