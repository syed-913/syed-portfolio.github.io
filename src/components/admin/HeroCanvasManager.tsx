import { useEffect, useState } from 'react';
import { getProjects, getSiteSettings, saveHeroCanvas } from '../../services/adminDb';
import { initialHeroCanvas } from '../../lib/canvasPresets';
import type { Project } from '../../types/database';
import type { HeroCanvasConfig } from '../../types/heroCanvas';
import { HeroCanvasEditor } from './HeroCanvasEditor';
import { AdminSection } from './AdminUI';

export const HeroCanvasManager = () => {
  const [data, setData] = useState<{ projects: Project[]; config: HeroCanvasConfig } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([getProjects(), getSiteSettings()]).then(([projects, settings]) => {
      if (active) { setData({ projects, config: settings.heroCanvas ?? initialHeroCanvas(projects) }); setError(false); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);
  if (error) return <AdminSection title="Hero canvas"><p className="admin-help" role="alert">The canvas settings could not be loaded. Your published canvas has not changed.</p><button type="button" className="canvas-editor-button" onClick={() => { setError(false); setAttempt(value => value + 1); }}>Try again</button></AdminSection>;
  if (!data) return <AdminSection title="Hero canvas"><p role="status" className="admin-help">Loading your project scenes…</p></AdminSection>;
  return <HeroCanvasEditor initialConfig={data.config} projects={data.projects} onSave={saveHeroCanvas}/>;
};
