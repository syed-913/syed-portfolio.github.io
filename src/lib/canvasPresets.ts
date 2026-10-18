import type { Project } from '../types/database';
import type { CanvasElement, CanvasElementKind, CanvasScene, HeroCanvasConfig } from '../types/heroCanvas';
import { consoleWorkflow } from '../data/consoleWorkflow.ts';

const uniqueId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const newCanvasElement = (kind: CanvasElementKind, index = 0): CanvasElement => ({
  id: uniqueId(), kind, text: ['line', 'arrow'].includes(kind) ? '' : kind === 'markdown' ? '**A useful heading**\n\nDescribe what this part of the project does.' : 'New element',
  box: { x: 8 + index % 5 * 3, y: 8 + index % 5 * 3, width: kind === 'markdown' ? 44 : 26, height: ['line', 'arrow'].includes(kind) ? 4 : kind === 'markdown' ? 32 : 20 },
  mobileBox: { x: 5, y: Math.min(85, 5 + index * 12), width: 90, height: ['line', 'arrow'].includes(kind) ? 3 : 12 },
  treatment: ['text', 'markdown', 'line', 'arrow'].includes(kind) ? 'quiet' : 'outline', textSize: 'body', align: 'left', rotation: 0, mobileRotation: 0, locked: false, hidden: false, mobileHidden: false, href: '', detail: '',
});

export const sceneFromProject = (project?: Project): CanvasScene => {
  const scene: CanvasScene = { id: uniqueId(), title: project?.name ?? 'New project scene', subtitle: project?.stack?.join(' / ') ?? '', projectId: project?.id ?? '', linkLabel: 'Explore the case study', href: '', mobileHeight: 720, elements: [] };
  if (project && /user.management.console/i.test(project.name)) {
    scene.subtitle = 'Linux / Security / Automation';
    for (const [index, stage] of consoleWorkflow.entries()) {
      scene.elements.push({ ...newCanvasElement('box'), text: `**${stage.name}**\n\n${stage.caption}`, textSize: 'body', box: { x: 3 + index * 25, y: 12, width: 21, height: 40 }, mobileBox: { x: index % 2 ? 52 : 4, y: index < 2 ? 5 : 32, width: 44, height: 24 }, detail: stage.detail });
      if (index < 3) scene.elements.push({ ...newCanvasElement('arrow'), box: { x: 24 + index * 25, y: 29, width: 4, height: 5 }, mobileBox: { x: index === 1 ? 46 : 48, y: index === 0 ? 16 : index === 1 ? 29 : 43, width: index === 1 ? 8 : 4, height: 3 }, mobileRotation: index === 1 ? 90 : 0, treatment: 'quiet' });
    }
    scene.elements.push({ ...newCanvasElement('text'), text: 'Account files · read / update', textSize: 'small', box: { x: 3, y: 64, width: 92, height: 6 }, mobileBox: { x: 4, y: 61, width: 92, height: 5 } });
    ['/etc/passwd', '/etc/shadow', '/etc/{group,gshadow}'].forEach((name, index) => scene.elements.push({ ...newCanvasElement('box'), text: `\`${name}\``, textSize: 'small', box: { x: 3 + index * 33, y: 73, width: 29, height: 15 }, mobileBox: { x: 4, y: 68 + index * 10, width: 92, height: 8 } }));
  } else {
    scene.elements.push({ ...newCanvasElement('text'), text: project?.name ?? 'Make the project visible', textSize: 'display', box: { x: 7, y: 12, width: 84, height: 18 }, mobileBox: { x: 6, y: 8, width: 88, height: 14 } }, { ...newCanvasElement('markdown'), text: project?.description ?? 'Add a project, describe its workflow, and link to the evidence.', box: { x: 7, y: 36, width: 84, height: 40 }, mobileBox: { x: 6, y: 30, width: 88, height: 48 } });
  }
  return scene;
};

export const initialHeroCanvas = (projects: Project[]): HeroCanvasConfig => {
  const project = projects.find(item => /user.management.console/i.test(item.name) && item.visible) ?? projects.find(item => item.visible);
  const scene = sceneFromProject(project);
  return { version: 1, enabled: false, defaultSceneId: scene.id, scenes: [scene] };
};
