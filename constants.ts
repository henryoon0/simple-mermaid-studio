import { ThemeConfig, ThemeKey, BackgroundOption } from "./types";

export const DEFAULT_CODE = `graph TD
    A[Start] --> B{Is it simple?}
    B -- Yes --> C[Great!]
    B -- No --> D[Make it simple]
    D --> B
    C --> E[Done]
    
    style A fill:#ffffff,stroke:#333,stroke-width:2px
    style E fill:#000000,stroke:#333,stroke-width:2px,color:#fff`;

// Added specific Emoji fonts to ensure Mermaid calculates width correctly when Emojis are present
const FONT_STACK = '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  default: {
    theme: 'base',
    themeVariables: {
      fontFamily: FONT_STACK,
      primaryColor: '#f3f4f6',
      edgeLabelBackground: '#ffffff',
      tertiaryColor: '#fff'
    }
  },
  simple: {
    theme: 'base',
    themeVariables: {
      fontFamily: FONT_STACK,
      primaryColor: '#ffffff',
      primaryTextColor: '#222',
      primaryBorderColor: '#000',
      lineColor: '#444',
      secondaryColor: '#f4f4f5',
      tertiaryColor: '#fff'
    }
  },
  modern: {
    theme: 'base',
    themeVariables: {
      fontFamily: FONT_STACK,
      primaryColor: '#e0e7ff',
      primaryTextColor: '#3730a3',
      primaryBorderColor: '#6366f1',
      lineColor: '#6366f1',
      secondaryColor: '#c7d2fe',
      tertiaryColor: '#eef2ff'
    }
  },
  dark: {
    theme: 'dark',
    themeVariables: {
      fontFamily: FONT_STACK,
      primaryColor: '#1f2937',
      lineColor: '#9ca3af'
    }
  }
};

export const BACKGROUNDS: BackgroundOption[] = [
  { id: 'white', color: '#ffffff', label: 'White' },
  { id: 'dots', color: 'dots', label: 'Dots' }, // Special ID for pattern
  { id: 'soft-gray', color: '#f5f5f7', label: 'Soft Gray' },
  { id: 'warm', color: '#fbfbf9', label: 'Warm' },
  { id: 'mint', color: '#f0fdf4', label: 'Mint' },
  { id: 'blue', color: '#eff6ff', label: 'Blue' },
  { id: 'dark', color: '#111827', label: 'Dark' },
  { id: 'transparent', color: 'transparent', label: 'Transparent' },
];
