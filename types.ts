export type ThemeKey = 'default' | 'simple' | 'modern' | 'dark';
export type ViewMode = 'split' | 'code' | 'preview';

export interface ThemeConfig {
  theme: string;
  themeVariables: Record<string, string>;
}

export interface PanZoomInstance {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  center: () => void;
  destroy: () => void;
  resize: () => void;
}

export interface BackgroundOption {
  id: string;
  color: string;
  label: string;
}
