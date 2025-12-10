import React from 'react';
import { ThemeKey } from '../types';

interface EditorPanelProps {
  code: string;
  onChange: (value: string) => void;
  currentTheme: ThemeKey;
  onThemeChange: (theme: ThemeKey) => void;
  width: number;
}

const THEME_OPTIONS: { id: ThemeKey; label: string }[] = [
  { id: 'default', label: '기본' },
  { id: 'simple', label: '심플(Notion)' },
  { id: 'modern', label: '모던 블루' },
  { id: 'dark', label: '다크' },
];

const EditorPanel: React.FC<EditorPanelProps> = ({ 
    code, 
    onChange, 
    currentTheme, 
    onThemeChange, 
    width
}) => {
  return (
    <div 
        style={{ width: width }}
        className="flex flex-col border-r border-neutral-200 bg-white z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative h-full"
    >
      {/* Toolbar - Responsive Wrapping */}
      <div className="min-h-12 py-2 border-b border-neutral-100 flex items-center px-4 gap-4 bg-white shrink-0 flex-wrap">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider shrink-0">Theme</span>
        <div className="flex items-center gap-2 flex-wrap">
            {THEME_OPTIONS.map((option) => (
                <button
                    key={option.id}
                    onClick={() => onThemeChange(option.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap
                        ${currentTheme === option.id 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }
                        ${option.id === 'dark' && currentTheme !== 'dark' ? 'hover:bg-neutral-900 hover:text-white' : ''}
                    `}
                >
                    {option.label}
                </button>
            ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 relative h-full">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-6 resize-none outline-none text-sm leading-relaxed font-mono text-neutral-800 bg-white"
          spellCheck={false}
          placeholder="여기에 Mermaid 코드를 입력하세요..."
        />
        
        {/* Helper Tip */}
        <div className="absolute bottom-4 right-4 text-xs text-neutral-400 bg-white/90 backdrop-blur border border-neutral-100 px-3 py-1.5 rounded-full shadow-sm pointer-events-none">
          자동 저장됨
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
