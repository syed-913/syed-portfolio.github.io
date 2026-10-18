export type CanvasElementKind = 'box' | 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'text' | 'markdown';
export type CanvasTreatment = 'outline' | 'surface' | 'emphasis' | 'quiet';
export type CanvasTextSize = 'small' | 'body' | 'title' | 'display';
export type CanvasLayout = 'desktop' | 'mobile';

export interface CanvasBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasElement {
  id: string;
  kind: CanvasElementKind;
  text: string;
  box: CanvasBox;
  mobileBox: CanvasBox;
  treatment: CanvasTreatment;
  textSize: CanvasTextSize;
  align: 'left' | 'center' | 'right';
  rotation: number;
  mobileRotation: number;
  locked: boolean;
  hidden: boolean;
  mobileHidden: boolean;
  href: string;
  detail: string;
}

export interface CanvasScene {
  id: string;
  title: string;
  subtitle: string;
  projectId: string;
  linkLabel: string;
  href: string;
  mobileHeight: number;
  elements: CanvasElement[];
}

export interface HeroCanvasConfig {
  version: 1;
  enabled: boolean;
  defaultSceneId: string;
  scenes: CanvasScene[];
}
