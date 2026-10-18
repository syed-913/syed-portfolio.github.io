import type { Project } from '../types/database';
import type { CanvasBox, CanvasElement, CanvasElementKind, CanvasScene, HeroCanvasConfig } from '../types/heroCanvas';
import { safeLink } from './safeLink.ts';

export const CANVAS_LIMITS = { scenes: 8, elements: 60, text: 4000, bytes: 220_000 } as const;
const kinds: CanvasElementKind[] = ['box', 'rectangle', 'ellipse', 'diamond', 'line', 'arrow', 'text', 'markdown'];
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown, max: number = CANVAS_LIMITS.text) => typeof value === 'string' ? value.slice(0, max) : '';
const number = (value: unknown, fallback: number, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const identifier = (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value) ? value : '';
const serializedBytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).byteLength;

export const fitCanvasBox = (value: Partial<CanvasBox>): CanvasBox => {
  const width = number(value.width, 25, 2, 100);
  const height = number(value.height, 16, 1, 100);
  return { x: number(value.x, 5, 0, 100 - width), y: number(value.y, 5, 0, 100 - height), width, height };
};

/** Versioned, bounded data; old/malformed settings retain the existing specimen. */
export const normalizeHeroCanvas = (input: unknown): HeroCanvasConfig | undefined => {
  if (!input) return undefined;
  try { if (serializedBytes(input) > CANVAS_LIMITS.bytes) return undefined; } catch { return undefined; }
  const root = record(input);
  if (root.version !== 1 || typeof root.enabled !== 'boolean' || !Array.isArray(root.scenes)) return undefined;
  const sceneIds = new Set<string>();
  const scenes: CanvasScene[] = [];
  for (const raw of root.scenes.slice(0, CANVAS_LIMITS.scenes)) {
    const scene = record(raw), id = identifier(scene.id);
    if (!id || sceneIds.has(id) || !Array.isArray(scene.elements)) continue;
    sceneIds.add(id);
    const elementIds = new Set<string>();
    const elements: CanvasElement[] = [];
    for (const rawElement of scene.elements.slice(0, CANVAS_LIMITS.elements)) {
      const item = record(rawElement), elementId = identifier(item.id);
      if (!elementId || elementIds.has(elementId) || !kinds.includes(item.kind as CanvasElementKind)) continue;
      elementIds.add(elementId);
      const box = fitCanvasBox(record(item.box));
      elements.push({
        id: elementId, kind: item.kind as CanvasElementKind, text: text(item.text), box,
        mobileBox: fitCanvasBox(item.mobileBox ? record(item.mobileBox) : { x: 5, y: Math.min(88, elements.length * 14 + 3), width: 90, height: 12 }),
        treatment: ['outline', 'surface', 'emphasis', 'quiet'].includes(String(item.treatment)) ? item.treatment as CanvasElement['treatment'] : 'outline',
        textSize: ['small', 'body', 'title', 'display'].includes(String(item.textSize)) ? item.textSize as CanvasElement['textSize'] : 'body',
        align: ['left', 'center', 'right'].includes(String(item.align)) ? item.align as CanvasElement['align'] : 'left',
        rotation: number(item.rotation, 0, -180, 180), mobileRotation: number(item.mobileRotation, number(item.rotation, 0, -180, 180), -180, 180), locked: item.locked === true, hidden: item.hidden === true, mobileHidden: item.mobileHidden === true,
        href: safeLink(text(item.href, 2048)) ?? '', detail: text(item.detail),
      });
    }
    scenes.push({ id, title: text(scene.title, 100) || 'Project scene', subtitle: text(scene.subtitle, 180), projectId: text(scene.projectId, 128), href: safeLink(text(scene.href, 2048)) ?? '', linkLabel: text(scene.linkLabel, 80) || 'Explore the case study', mobileHeight: number(scene.mobileHeight, 720, 360, 1600), elements });
  }
  if (root.enabled && !scenes.length) return undefined;
  return { version: 1, enabled: root.enabled, defaultSceneId: scenes.some(scene => scene.id === root.defaultSceneId) ? String(root.defaultSceneId) : scenes[0]?.id ?? '', scenes };
};

export const publicCanvasScenes = (config: HeroCanvasConfig | undefined, projects: Project[]): CanvasScene[] =>
  config?.enabled ? config.scenes.filter(scene => !scene.projectId || projects.some(project => project.id === scene.projectId && project.visible === true)) : [];

export const canvasIssues = (config: HeroCanvasConfig, projects: Project[]): string[] => {
  const issues: string[] = [];
  if (serializedBytes(config) > CANVAS_LIMITS.bytes) issues.push('This layout is too large. Shorten text or remove unused elements.');
  if (config.scenes.length > CANVAS_LIMITS.scenes) issues.push(`Use no more than ${CANVAS_LIMITS.scenes} scenes.`);
  if (!config.scenes.length) issues.push('Add at least one project scene.');
  for (const scene of config.scenes) {
    if (scene.elements.length > CANVAS_LIMITS.elements) issues.push(`${scene.title}: use no more than ${CANVAS_LIMITS.elements} elements.`);
    if (!scene.title.trim()) issues.push('Every scene needs a title.');
    if (config.enabled && scene.projectId && !projects.some(project => project.id === scene.projectId && project.visible === true)) issues.push(`${scene.title}: choose a visible project before publishing, or unlink the scene.`);
    if (scene.href && !safeLink(scene.href)) issues.push(`${scene.title}: use an https URL or a site path for the scene link.`);
    for (const element of scene.elements) {
      if (element.href && !safeLink(element.href)) issues.push(`${scene.title}: an element has an invalid link.`);
      if (element.text.length > CANVAS_LIMITS.text || element.detail.length > CANVAS_LIMITS.text) issues.push(`${scene.title}: element text is too long.`);
    }
  }
  return [...new Set(issues)];
};
